/**
 * Supabase 数据库类型定义
 */

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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          username: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      turtle_soup_records: {
        Row: {
          id: string
          user_id: string
          soup_id: string
          completed: boolean
          time_spent: number | null
          hints_used: number
          created_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          soup_id: string
          completed?: boolean
          time_spent?: number | null
          hints_used?: number
          created_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          soup_id?: string
          completed?: boolean
          time_spent?: number | null
          hints_used?: number
          created_at?: string
          synced_at?: string
        }
      }
      riddle_records: {
        Row: {
          id: string
          user_id: string
          riddle_id: string
          completed: boolean
          hints_used: number
          created_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          riddle_id: string
          completed?: boolean
          hints_used?: number
          created_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          riddle_id?: string
          completed?: boolean
          hints_used?: number
          created_at?: string
          synced_at?: string
        }
      }
      yes_or_no_records: {
        Row: {
          id: string
          user_id: string
          target_word: string
          category: string
          questions_count: number
          completed: boolean
          time_spent: number | null
          created_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_word: string
          category: string
          questions_count?: number
          completed?: boolean
          time_spent?: number | null
          created_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_word?: string
          category?: string
          questions_count?: number
          completed?: boolean
          time_spent?: number | null
          created_at?: string
          synced_at?: string
        }
      }
      guess_number_records: {
        Row: {
          id: string
          user_id: string
          secret_number: string
          attempts_count: number
          completed: boolean
          time_spent: number | null
          created_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          secret_number: string
          attempts_count?: number
          completed?: boolean
          time_spent?: number | null
          created_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          secret_number?: string
          attempts_count?: number
          completed?: boolean
          time_spent?: number | null
          created_at?: string
          synced_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          category_primary: 'thinking' | 'scenario' | 'random'
          category_secondary: string | null
          content: string
          difficulty: number
          tags: string[]
          created_at: string
          updated_at: string
          answer_count: number
        }
        Insert: {
          id: string
          category_primary: 'thinking' | 'scenario' | 'random'
          category_secondary?: string | null
          content: string
          difficulty: number
          tags?: string[]
          created_at?: string
          updated_at?: string
          answer_count?: number
        }
        Update: {
          id?: string
          category_primary?: 'thinking' | 'scenario' | 'random'
          category_secondary?: string | null
          content?: string
          difficulty?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
          answer_count?: number
        }
      }
      answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          content: string
          metadata: Json
          is_public: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          user_id: string
          question_id: string
          content: string
          metadata?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          content?: string
          metadata?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      user_progress: {
        Row: {
          user_id: string
          total_answers: number
          total_days: number
          current_streak: number
          longest_streak: number
          category_breakdown: Json
          slot_machine_plays: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          total_answers?: number
          total_days?: number
          current_streak?: number
          longest_streak?: number
          category_breakdown?: Json
          slot_machine_plays?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_answers?: number
          total_days?: number
          current_streak?: number
          longest_streak?: number
          category_breakdown?: Json
          slot_machine_plays?: number
          created_at?: string
          updated_at?: string
        }
      }
      slot_machine_results: {
        Row: {
          id: string
          user_id: string
          words: string[]
          response: string | null
          easter_egg: Json | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          words: string[]
          response?: string | null
          easter_egg?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          words?: string[]
          response?: string | null
          easter_egg?: Json | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          answer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          answer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          answer_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          answer_id: string
          content: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          answer_id: string
          content: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          answer_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      public_answers: {
        Row: {
          id: string
          question_id: string
          content: string
          metadata: Json
          created_at: string
          updated_at: string
          question_content: string
          category_primary: string
          category_secondary: string | null
          difficulty: number
          question_tags: string[]
          username: string | null
          full_name: string | null
          avatar_url: string | null
          like_count: number
          comment_count: number
        }
      }
    }
    Functions: {
      handle_new_user: () => void
    }
  }
}
