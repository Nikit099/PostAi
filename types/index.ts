export interface User {
  id: string
  email?: string
  username?: string
  avatar_url?: string
  daily_credits: number
}

export interface ConnectedAccount {
  id: string
  user_id: string
  service: 'telegram' | 'instagram' | 'vk' | 'twitter' | 'dzen'
  account_name: string
  account_data: {
    token?: string
    chat_id?: string
    access_token?: string
    username?: string
    group_id?: string
    // Другие специфичные для сервиса поля
  }
  is_active: boolean
  created_at: string
}

export interface Generation {
  id: string
  user_id: string
  original_idea: string
  generated_text: string
  used_credits: number
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  generation_id?: string
  title: string
  text: string
  media_urls: string[]
  status: 'draft' | 'published' | 'failed'
  published_to: Array<{
    accountId: string
    success: boolean
    messageId?: string
  }>
  created_at: string
}

export interface AppState {
  user: User | null
  accounts: ConnectedAccount[]
  currentPost: {
    title: string
    text: string
    mediaFiles: File[]
  } | null
  isLoading: boolean
}