import initSqlJs, { type Database } from 'sql.js'
import type {
  Chapter,
  Section,
  SanjiazhuNote,
  Story,
  Chengyu,
  War,
  Taishigongyue,
  Entity,
  SearchResultItem,
} from '../types/shiji'

let db: Database | null = null

function queryAll<T>(sql: string, params: (string | number | null)[] = []): T[] {
  if (!db) throw new Error('Database is not initialized')
  const stmt = db.prepare(sql)
  if (params.length > 0) {
    stmt.bind(params)
  }
  const results: T[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T)
  }
  stmt.free()
  return results
}

function queryOne<T>(sql: string, params: (string | number | null)[] = []): T | null {
  const items = queryAll<T>(sql, params)
  return items.length > 0 ? items[0] : null
}

async function fetchWithProgress(dbUrl: string): Promise<ArrayBuffer> {
  const CACHE_NAME = 'cicada930-db-v1'
  let cache: Cache | null = null

  try {
    if (typeof caches !== 'undefined') {
      cache = await caches.open(CACHE_NAME)
      const cached = await cache.match(dbUrl)
      if (cached) {
        self.postMessage({ type: 'PROGRESS', payload: { percent: 100, text: '已从本地缓存装载典籍数据库...' } })
        return await cached.arrayBuffer()
      }
    }
  } catch (err) {
    console.warn('Cache API access skipped:', err)
  }

  self.postMessage({ type: 'PROGRESS', payload: { percent: 10, text: '正在下载《史记》典籍数据库 (24.89MB)...' } })
  const response = await fetch(dbUrl)
  if (!response.ok) {
    throw new Error(`Failed to load database: ${response.status} ${response.statusText}`)
  }

  const contentLength = response.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  if (!response.body || !total) {
    const buf = await response.arrayBuffer()
    if (cache) {
      try {
        await cache.put(dbUrl, new Response(buf))
      } catch {
        // ignore
      }
    }
    return buf
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    const percent = Math.min(96, Math.round((received / total) * 90) + 5)
    const mb = (received / (1024 * 1024)).toFixed(1)
    const totalMb = (total / (1024 * 1024)).toFixed(1)
    self.postMessage({
      type: 'PROGRESS',
      payload: { percent, text: `正在装载典籍数据库 (${mb}MB / ${totalMb}MB)...` },
    })
  }

  const full = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    full.set(chunk, offset)
    offset += chunk.length
  }

  if (cache) {
    try {
      await cache.put(dbUrl, new Response(full.buffer))
    } catch {
      // ignore
    }
  }

  return full.buffer
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data

  try {
    switch (type) {
      case 'INIT': {
        const { dbUrl, wasmUrl } = payload
        self.postMessage({ type: 'PROGRESS', payload: { percent: 5, text: '初始化 SQLite WASM 运行时...' } })

        const SQL = await initSqlJs({
          locateFile: () => wasmUrl,
        })

        const dbBuffer = await fetchWithProgress(dbUrl)
        self.postMessage({ type: 'PROGRESS', payload: { percent: 98, text: '解析古籍索引与实体图谱...' } })

        db = new SQL.Database(new Uint8Array(dbBuffer))
        self.postMessage({ type: 'PROGRESS', payload: { percent: 100, text: '装载完毕' } })
        self.postMessage({ id, success: true, data: { ready: true } })
        break
      }

      case 'GET_CHAPTERS': {
        const chapters = queryAll<Chapter>(
          'SELECT id, category, title, summary, word_count, section_count FROM chapters ORDER BY id ASC'
        )
        self.postMessage({ id, success: true, data: chapters })
        break
      }

      case 'GET_CHAPTER_DATA': {
        const { chapterId } = payload
        const chapter = queryOne<Chapter>(
          'SELECT id, category, title, summary, word_count, section_count FROM chapters WHERE id = ?',
          [chapterId]
        )

        const sections = queryAll<Section>(
          `SELECT id, chapter_id, pn_index, section_type, heading_level, heading_text, 
                  tagged_content, plain_text, translation, order_in_chapter 
           FROM sections 
           WHERE chapter_id = ? 
           ORDER BY order_in_chapter ASC`,
          [chapterId]
        )

        const notes = queryAll<SanjiazhuNote>(
          `SELECT id, chapter_id, note_id, anchor_text, before_context, after_context, 
                  jijie, suoyin, zhengyi, other_notes, sentence_id 
           FROM sanjiazhu_notes 
           WHERE chapter_id = ? 
           ORDER BY id ASC`,
          [chapterId]
        )

        const stories = queryAll<Story>(
          `SELECT id, chapter_id, chapter_title, title, summary, original, translation, source_pns 
           FROM stories 
           WHERE chapter_id = ? 
           ORDER BY id ASC`,
          [chapterId]
        )

        const chengyu = queryAll<Chengyu>(
          `SELECT id, word, chapter_id, chapter_title, pn, quote, meaning, context 
           FROM chengyu 
           WHERE chapter_id = ? 
           ORDER BY id ASC`,
          [chapterId]
        )

        const wars = queryAll<War>(
          `SELECT id, war_id, name, chapter_num, chapter_title, description, full_description 
           FROM wars 
           WHERE chapter_num = ? OR chapter_title = ?`,
          [String(chapterId), chapter?.title || '']
        )

        const taishigongyue = queryOne<Taishigongyue>(
          `SELECT id, chapter_id, chapter_title, content, plain_content 
           FROM taishigongyue 
           WHERE chapter_id = ?`,
          [chapterId]
        )

        self.postMessage({
          id,
          success: true,
          data: {
            chapter,
            sections,
            notes,
            stories,
            chengyu,
            wars,
            taishigongyue,
          },
        })
        break
      }

      case 'GET_ENTITY_DETAILS': {
        const { label } = payload
        const entity = queryOne<Entity>(
          `SELECT id, label, type, type_name_zh, aliases, description, tags, occurrences_count 
           FROM entities 
           WHERE label = ? OR id = ?`,
          [label, label]
        )

        let occurrences: { chapter_id: number; section_pn: string; chapter_title: string }[] = []
        if (entity) {
          occurrences = queryAll<{ chapter_id: number; section_pn: string; chapter_title: string }>(
            `SELECT eo.chapter_id, eo.section_pn, c.title AS chapter_title 
             FROM entity_occurrences eo 
             JOIN chapters c ON eo.chapter_id = c.id 
             WHERE eo.entity_id = ? 
             ORDER BY eo.chapter_id ASC LIMIT 20`,
            [entity.id]
          )
        }

        self.postMessage({
          id,
          success: true,
          data: { entity, occurrences },
        })
        break
      }

      case 'SEARCH': {
        const { query } = payload
        const cleanQuery = (query || '').trim()
        if (!cleanQuery) {
          self.postMessage({ id, success: true, data: [] })
          return
        }

        const pattern = `%${cleanQuery}%`
        const results: SearchResultItem[] = []

        // 1. Match entities
        const matchedEntities = queryAll<Entity>(
          `SELECT id, label, type_name_zh, description, occurrences_count 
           FROM entities 
           WHERE label LIKE ? OR aliases LIKE ? 
           ORDER BY occurrences_count DESC LIMIT 5`,
          [pattern, pattern]
        )
        for (const item of matchedEntities) {
          results.push({
            type: 'entity',
            id: item.id,
            title: item.label,
            subtitle: `${item.type_name_zh} · 全书出现 ${item.occurrences_count} 次`,
            snippet: item.description || '',
          })
        }

        // 2. Match chengyu
        const matchedChengyu = queryAll<Chengyu>(
          `SELECT id, word, chapter_title, meaning, quote, chapter_id, pn 
           FROM chengyu 
           WHERE word LIKE ? OR meaning LIKE ? 
           LIMIT 5`,
          [pattern, pattern]
        )
        for (const item of matchedChengyu) {
          results.push({
            type: 'chengyu',
            id: item.id,
            title: item.word,
            subtitle: `出自《${item.chapter_title}》`,
            snippet: item.meaning || item.quote,
            chapter_id: item.chapter_id,
            section_pn: item.pn,
          })
        }

        // 3. Match sections
        const matchedSections = queryAll<{
          id: number
          chapter_id: number
          pn_index: string
          plain_text: string
          chapter_title: string
        }>(
          `SELECT s.id, s.chapter_id, s.pn_index, s.plain_text, c.title AS chapter_title 
           FROM sections s 
           JOIN chapters c ON s.chapter_id = c.id 
           WHERE s.plain_text LIKE ? 
           ORDER BY s.chapter_id ASC, s.order_in_chapter ASC 
           LIMIT 25`,
          [pattern]
        )
        for (const item of matchedSections) {
          // Highlight snippet window around matched term
          const text = item.plain_text || ''
          const idx = text.indexOf(cleanQuery)
          const start = Math.max(0, idx - 30)
          const end = Math.min(text.length, idx + cleanQuery.length + 45)
          const snippet = (start > 0 ? '…' : '') + text.substring(start, end) + (end < text.length ? '…' : '')

          results.push({
            type: 'section',
            id: item.id,
            title: `《${item.chapter_title}》`,
            subtitle: `段落 [${item.pn_index}]`,
            snippet,
            chapter_id: item.chapter_id,
            section_pn: item.pn_index,
          })
        }

        self.postMessage({ id, success: true, data: results })
        break
      }

      case 'GET_STATS': {
        const chapterCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM chapters')?.count || 0
        const sectionCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM sections')?.count || 0
        const notesCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM sanjiazhu_notes')?.count || 0
        const entityCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM entities')?.count || 0
        const chengyuCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM chengyu')?.count || 0
        const warCount = queryOne<{ count: number }>('SELECT count(*) AS count FROM wars')?.count || 0
        const totalWords = queryOne<{ total: number }>('SELECT sum(word_count) AS total FROM chapters')?.total || 0

        self.postMessage({
          id,
          success: true,
          data: {
            chapterCount,
            sectionCount,
            notesCount,
            entityCount,
            chengyuCount,
            warCount,
            totalWords,
          },
        })
        break
      }

      case 'GET_SPECIAL_LIST': {
        const { category } = payload
        if (category === 'chengyu') {
          const list = queryAll<Chengyu>('SELECT * FROM chengyu ORDER BY chapter_id ASC')
          self.postMessage({ id, success: true, data: list })
        } else if (category === 'stories') {
          const list = queryAll<Story>('SELECT * FROM stories ORDER BY chapter_id ASC')
          self.postMessage({ id, success: true, data: list })
        } else if (category === 'wars') {
          const list = queryAll<War>('SELECT * FROM wars ORDER BY id ASC')
          self.postMessage({ id, success: true, data: list })
        } else if (category === 'taishigongyue') {
          const list = queryAll<Taishigongyue>('SELECT * FROM taishigongyue ORDER BY chapter_id ASC')
          self.postMessage({ id, success: true, data: list })
        } else {
          self.postMessage({ id, success: true, data: [] })
        }
        break
      }

      default:
        self.postMessage({ id, success: false, error: `Unknown message type: ${type}` })
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    self.postMessage({ id, success: false, error: errorMsg })
  }
}
