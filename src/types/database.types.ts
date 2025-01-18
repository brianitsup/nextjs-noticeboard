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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string
          created_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          title: string
          content: string
          category_id: string
          posted_by: string
          posted_at: string
          expires_at: string
          priority: string
          is_sponsored: boolean
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category_id: string
          posted_by: string
          posted_at?: string
          expires_at: string
          priority?: string
          is_sponsored?: boolean
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category_id?: string
          posted_by?: string
          posted_at?: string
          expires_at?: string
          priority?: string
          is_sponsored?: boolean
          published?: boolean
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