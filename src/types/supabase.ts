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
          category_id: string
          posted_by: string
          posted_at: string
          expires_at: string | null
          priority: string | null
          is_sponsored: boolean
          published: boolean
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category_id: string
          posted_by: string
          posted_at?: string
          expires_at?: string | null
          priority?: string | null
          is_sponsored?: boolean
          published?: boolean
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category_id?: string
          posted_by?: string
          posted_at?: string
          expires_at?: string | null
          priority?: string | null
          is_sponsored?: boolean
          published?: boolean
          created_at?: string
          created_by?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          created_at?: string
          created_by?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
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