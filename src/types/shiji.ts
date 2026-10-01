export interface Chapter {
  id: number
  category: string
  title: string
  summary: string | null
  word_count: number
  section_count: number
}

export interface Section {
  id: number
  chapter_id: number
  pn_index: string
  section_type: string
  heading_level: number
  heading_text: string | null
  tagged_content: string | null
  plain_text: string | null
  translation: string | null
  order_in_chapter: number
}

export interface SanjiazhuNote {
  id: number
  chapter_id: number
  note_id: string
  anchor_text: string
  before_context: string
  after_context: string
  jijie: string | null
  suoyin: string | null
  zhengyi: string | null
  other_notes: string | null
  sentence_id: string
}

export interface Entity {
  id: string
  label: string
  type: string
  type_name_zh: string
  aliases: string | null
  description: string | null
  tags: string | null
  occurrences_count: number
}

export interface EntityOccurrence {
  id: number
  entity_id: string
  chapter_id: number
  section_pn: string
  chapter_title?: string
}

export interface Story {
  id: string
  chapter_id: number
  chapter_title: string
  title: string
  summary: string
  original: string
  translation: string
  source_pns: string
}

export interface Chengyu {
  id: number
  word: string
  chapter_id: number
  chapter_title: string
  pn: string
  quote: string
  meaning: string
  context: string
}

export interface War {
  id: number
  war_id: string
  name: string
  chapter_num: string
  chapter_title: string
  description: string
  full_description: string
}

export interface Taishigongyue {
  id: number
  chapter_id: number
  chapter_title: string
  content: string
  plain_content: string
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

export interface SearchResultItem {
  type: 'section' | 'entity' | 'chengyu' | 'story'
  id: string | number
  title: string
  subtitle?: string
  snippet: string
  chapter_id?: number
  section_pn?: string
}

export type ThemeStyle = 'parchment' | 'indigo' | 'bamboo'
export type DarkMode = 'light' | 'dark' | 'system'

export interface ReaderSettings {
  themeStyle: ThemeStyle
  darkMode: DarkMode
  fontSize: number // 14 to 26
  lineHeight: number // 1.6 to 2.4
  showJijie: boolean
  showSuoyin: boolean
  showZhengyi: boolean
  showTranslation: boolean
  showEntities: boolean
  dualPane: boolean
}
