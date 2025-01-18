export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notices: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          posted_by: string
          posted_at: string
          expires_at: string
          priority: string
          is_sponsored: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          posted_by: string
          posted_at?: string
          expires_at: string
          priority?: string
          is_sponsored?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          posted_by?: string
          posted_at?: string
          expires_at?: string
          priority?: string
          is_sponsored?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 