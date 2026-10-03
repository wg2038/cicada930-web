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

interface WorkerRequest {
  id: number
  type: string
  payload?: any
}

interface WorkerResponse {
  id?: number
  type?: string
  success?: boolean
  data?: any
  error?: string
  payload?: any
}

export interface ChapterData {
  chapter: Chapter
  sections: Section[]
  notes: SanjiazhuNote[]
  stories: Story[]
  chengyu: Chengyu[]
  wars: War[]
  taishigongyue: Taishigongyue | null
}

export interface DBStats {
  chapterCount: number
  sectionCount: number
  notesCount: number
  entityCount: number
  chengyuCount: number
  warCount: number
  totalWords: number
}

class ShijiDatabaseClient {
  private worker: Worker | null = null
  private requestId = 0
  private pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>()
  private progressCallback: ((percent: number, text: string) => void) | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  public init(onProgress?: (percent: number, text: string) => void): Promise<void> {
    if (this.initialized) return Promise.resolve()
    if (this.initPromise) return this.initPromise

    this.progressCallback = onProgress || null

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

        this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const { id, type, payload, success, data, error } = event.data

          if (type === 'PROGRESS' && payload) {
            this.progressCallback?.(payload.percent, payload.text)
            return
          }

          if (id && this.pendingRequests.has(id)) {
            const { resolve: reqResolve, reject: reqReject } = this.pendingRequests.get(id)!
            this.pendingRequests.delete(id)
            if (success) {
              reqResolve(data)
            } else {
              reqReject(new Error(error || 'Worker request failed'))
            }
          }
        }

        this.worker.onerror = (err) => {
          console.error('SQLite Web Worker encountered an error:', err)
          reject(err)
        }

        // Compute absolute URLs for db and wasm
        let baseHref = window.location.href.split('#')[0].split('?')[0]
        if (!baseHref.endsWith('/')) {
          baseHref += '/'
        }
        const dbUrl = new URL('opusone.db', baseHref).href
        const wasmUrl = new URL('sql-wasm.wasm', baseHref).href

        this.sendRequest<{ ready: boolean }>('INIT', { dbUrl, wasmUrl })
          .then(() => {
            this.initialized = true
            resolve()
          })
          .catch(reject)
      } catch (err) {
        reject(err)
      }
    })

    return this.initPromise
  }

  private sendRequest<T>(type: string, payload?: any): Promise<T> {
    if (!this.worker) {
      return Promise.reject(new Error('Database worker is not started'))
    }

    const id = ++this.requestId
    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      this.worker!.postMessage({ id, type, payload } as WorkerRequest)
    })
  }

  public async getChapters(): Promise<Chapter[]> {
    return this.sendRequest<Chapter[]>('GET_CHAPTERS')
  }

  public async getChapterData(chapterId: number): Promise<ChapterData> {
    return this.sendRequest<ChapterData>('GET_CHAPTER_DATA', { chapterId })
  }

  public async getEntityDetails(label: string): Promise<{
    entity: Entity | null
    occurrences: { chapter_id: number; section_pn: string; chapter_title: string }[]
  }> {
    return this.sendRequest('GET_ENTITY_DETAILS', { label })
  }

  public async search(query: string): Promise<SearchResultItem[]> {
    return this.sendRequest<SearchResultItem[]>('SEARCH', { query })
  }

  public async getStats(): Promise<DBStats> {
    return this.sendRequest<DBStats>('GET_STATS')
  }

  public async getSpecialList<T = any>(category: 'chengyu' | 'stories' | 'wars' | 'taishigongyue'): Promise<T[]> {
    return this.sendRequest<T[]>('GET_SPECIAL_LIST', { category })
  }
}

export const dbClient = new ShijiDatabaseClient()
