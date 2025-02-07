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
      todo_folders: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          user_id: string
          shared_with: string[] | null
          can_edit: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          user_id: string
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          user_id?: string
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
      }
      todos: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          is_complete: boolean
          user_id: string
          folder_id: string | null
          shared_with: string[] | null
          can_edit: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          is_complete?: boolean
          user_id: string
          folder_id?: string | null
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          is_complete?: boolean
          user_id?: string
          folder_id?: string | null
          shared_with?: string[] | null
          can_edit?: string[] | null
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