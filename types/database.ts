/**
 * Supabase Database Types
 * Auto-generated based on migration: 001_initial_schema.sql
 * Project ID: cnximbkrryvvbyyjtxwc
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
          full_name: string | null
          company_name: string | null
          job_title: string | null
          industry: string | null
          employee_count: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          employee_count?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          job_title?: string | null
          industry?: string | null
          employee_count?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      diagnosis_sessions: {
        Row: {
          id: string
          user_id: string
          status: "active" | "completed" | "archived"
          current_stage: string
          data_strategy: Json
          data_structure: Json
          data_performance: Json
          data_compensation: Json
          data_talent: Json
          total_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: "active" | "completed" | "archived"
          current_stage?: string
          data_strategy?: Json
          data_structure?: Json
          data_performance?: Json
          data_compensation?: Json
          data_talent?: Json
          total_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "active" | "completed" | "archived"
          current_stage?: string
          data_strategy?: Json
          data_structure?: Json
          data_performance?: Json
          data_compensation?: Json
          data_talent?: Json
          total_score?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnosis_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_logs: {
        Row: {
          id: string
          session_id: string
          role: "user" | "assistant" | "system"
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: "user" | "assistant" | "system"
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: "user" | "assistant" | "system"
          content?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "diagnosis_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          user_id: string
          lead_score: number
          status: "new" | "contacted" | "converted"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lead_score?: number
          status?: "new" | "contacted" | "converted"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lead_score?: number
          status?: "new" | "contacted" | "converted"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_total_score: {
        Args: {
          session_id: string
        }
        Returns: number
      }
    }
    Enums: {
      session_status: "active" | "completed" | "archived"
      chat_role: "user" | "assistant" | "system"
      lead_status: "new" | "contacted" | "converted"
    }
  }
}
