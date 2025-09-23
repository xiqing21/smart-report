export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// 具体表类型
export type Organization = Tables<'organizations'>;
export type Role = Tables<'roles'>;
export type UserProfile = Tables<'user_profiles'>;
export type DataSource = Tables<'data_sources'>;
export type AnalysisTask = Tables<'analysis_tasks'>;
export type AnalysisResult = Tables<'analysis_results'>;
export type ReportTemplate = Tables<'report_templates'>;
export type Report = Tables<'reports'>;
export type ConversationContext = Tables<'conversation_contexts'>;
export type Document = Tables<'documents'>;
export type DocumentChunk = Tables<'document_chunks'>;

// 插入类型
export type OrganizationInsert = TablesInsert<'organizations'>;
export type RoleInsert = TablesInsert<'roles'>;
export type UserProfileInsert = TablesInsert<'user_profiles'>;
export type DataSourceInsert = TablesInsert<'data_sources'>;
export type AnalysisTaskInsert = TablesInsert<'analysis_tasks'>;
export type AnalysisResultInsert = TablesInsert<'analysis_results'>;
export type ReportTemplateInsert = TablesInsert<'report_templates'>;
export type ReportInsert = TablesInsert<'reports'>;
export type ConversationContextInsert = TablesInsert<'conversation_contexts'>;
export type DocumentInsert = TablesInsert<'documents'>;
export type DocumentChunkInsert = TablesInsert<'document_chunks'>;

// 更新类型
export type OrganizationUpdate = TablesUpdate<'organizations'>;
export type RoleUpdate = TablesUpdate<'roles'>;
export type UserProfileUpdate = TablesUpdate<'user_profiles'>;
export type DataSourceUpdate = TablesUpdate<'data_sources'>;
export type AnalysisTaskUpdate = TablesUpdate<'analysis_tasks'>;
export type AnalysisResultUpdate = TablesUpdate<'analysis_results'>;
export type ReportTemplateUpdate = TablesUpdate<'report_templates'>;
export type ReportUpdate = TablesUpdate<'reports'>;
export type ConversationContextUpdate = TablesUpdate<'conversation_contexts'>;
export type DocumentUpdate = TablesUpdate<'documents'>;
export type DocumentChunkUpdate = TablesUpdate<'document_chunks'>;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          email_confirmed_at: string | null
          last_sign_in_at: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          email_confirmed_at?: string | null
          last_sign_in_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          website: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      // 组织表
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 角色表
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: any; // JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: any;
          created_at?: string;
        };
      };
      
      // 用户配置文件表
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          department: string | null;
          position: string | null;
          role_id: string | null;
          organization_id: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          department?: string | null;
          position?: string | null;
          role_id?: string | null;
          organization_id?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          department?: string | null;
          position?: string | null;
          role_id?: string | null;
          organization_id?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 数据源表
      data_sources: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'database' | 'file' | 'api' | 'stream';
          connection_config: any | null; // JSONB
          status: 'active' | 'inactive' | 'error' | 'testing';
          file_path: string | null;
          file_size: number | null;
          file_extension: string | null;
          owner_id: string | null;
          organization_id: string | null;
          tags: string[] | null;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'database' | 'file' | 'api' | 'stream';
          connection_config?: any | null;
          status?: 'active' | 'inactive' | 'error' | 'testing';
          file_path?: string | null;
          file_size?: number | null;
          file_extension?: string | null;
          owner_id?: string | null;
          organization_id?: string | null;
          tags?: string[] | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'database' | 'file' | 'api' | 'stream';
          connection_config?: any | null;
          status?: 'active' | 'inactive' | 'error' | 'testing';
          file_path?: string | null;
          file_size?: number | null;
          file_extension?: string | null;
          owner_id?: string | null;
          organization_id?: string | null;
          tags?: string[] | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 分析任务表
      analysis_tasks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          data_source_id: string | null;
          analysis_type: 'trend' | 'prediction' | 'statistical' | 'anomaly' | 'comparison';
          parameters: any; // JSONB
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          progress: number;
          error_message: string | null;
          owner_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          estimated_duration: number | null;
          actual_duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          data_source_id?: string | null;
          analysis_type: 'trend' | 'prediction' | 'statistical' | 'anomaly' | 'comparison';
          parameters?: any;
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          progress?: number;
          error_message?: string | null;
          owner_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          estimated_duration?: number | null;
          actual_duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          data_source_id?: string | null;
          analysis_type?: 'trend' | 'prediction' | 'statistical' | 'anomaly' | 'comparison';
          parameters?: any;
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
          progress?: number;
          error_message?: string | null;
          owner_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          estimated_duration?: number | null;
          actual_duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 分析结果表
      analysis_results: {
        Row: {
          id: string;
          task_id: string;
          result_data: any | null; // JSONB
          insights: any | null; // JSONB
          visualizations: any | null; // JSONB
          confidence_score: number | null;
          ai_provider: string | null;
          model_version: string | null;
          processing_time: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          result_data?: any | null;
          insights?: any | null;
          visualizations?: any | null;
          confidence_score?: number | null;
          ai_provider?: string | null;
          model_version?: string | null;
          processing_time?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          result_data?: any | null;
          insights?: any | null;
          visualizations?: any | null;
          confidence_score?: number | null;
          ai_provider?: string | null;
          model_version?: string | null;
          processing_time?: number | null;
          created_at?: string;
        };
      };
      
      // 报告模板表
      report_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          template_type: string;
          content: any | null; // JSONB
          parameters: any; // JSONB
          is_public: boolean;
          is_system: boolean;
          owner_id: string | null;
          organization_id: string | null;
          version: number;
          tags: string[] | null;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          template_type?: string;
          content?: any | null;
          parameters?: any;
          is_public?: boolean;
          is_system?: boolean;
          owner_id?: string | null;
          organization_id?: string | null;
          version?: number;
          tags?: string[] | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          template_type?: string;
          content?: any | null;
          parameters?: any;
          is_public?: boolean;
          is_system?: boolean;
          owner_id?: string | null;
          organization_id?: string | null;
          version?: number;
          tags?: string[] | null;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 报告实例表
      reports: {
        Row: {
          id: string;
          template_id: string | null;
          analysis_task_id: string | null;
          title: string;
          content: any | null; // JSONB
          status: 'draft' | 'published' | 'archived' | 'deleted';
          owner_id: string | null;
          organization_id: string | null;
          published_at: string | null;
          view_count: number;
          download_count: number;
          tags: string[] | null;
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          analysis_task_id?: string | null;
          title: string;
          content?: any | null;
          status?: 'draft' | 'published' | 'archived' | 'deleted';
          owner_id?: string | null;
          organization_id?: string | null;
          published_at?: string | null;
          view_count?: number;
          download_count?: number;
          tags?: string[] | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string | null;
          analysis_task_id?: string | null;
          title?: string;
          content?: any | null;
          status?: 'draft' | 'published' | 'archived' | 'deleted';
          owner_id?: string | null;
          organization_id?: string | null;
          published_at?: string | null;
          view_count?: number;
          download_count?: number;
          tags?: string[] | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 对话上下文表
      conversation_contexts: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          messages: any[]; // JSONB
          summary: string | null;
          keywords: string[] | null;
          token_count: number;
          max_tokens: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          messages?: any[];
          summary?: string | null;
          keywords?: string[] | null;
          token_count?: number;
          max_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          messages?: any[];
          summary?: string | null;
          keywords?: string[] | null;
          token_count?: number;
          max_tokens?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 文档表
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          content: string | null;
          status: string;
          chunks: number | null;
          vectors: number | null;
          metadata: any | null; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          content?: string | null;
          status?: string;
          chunks?: number | null;
          vectors?: number | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          content?: string | null;
          status?: string;
          chunks?: number | null;
          vectors?: number | null;
          metadata?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // 文档块表
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          embedding: string; // JSON string
          metadata: any; // JSONB
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          chunk_index: number;
          content: string;
          embedding: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          chunk_index?: number;
          content?: string;
          embedding?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions: {
        Args: {
          user_uuid: string;
        };
        Returns: any; // JSONB
      };
      
      check_user_permission: {
        Args: {
          user_uuid: string;
          permission: string;
        };
        Returns: boolean;
      };
      
      get_analysis_tasks_paginated: {
        Args: {
          user_uuid: string;
          page_size?: number;
          page_offset?: number;
          status_filter?: string;
        };
        Returns: {
          id: string;
          name: string;
          analysis_type: string;
          status: string;
          progress: number;
          created_at: string;
          total_count: number;
        }[];
      };
      
      search_documents: {
        Args: {
          query_embedding: string;
          match_threshold: number;
          match_count: number;
          filter_user_id: string | null;
        };
        Returns: {
          id: string;
          document_id: string;
          document_name: string;
          content: string;
          similarity: number;
          metadata: any;
        }[];
      };
    }
    Enums: {
      analysis_type: 'trend' | 'prediction' | 'statistical' | 'anomaly' | 'comparison';
      task_status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
      data_source_type: 'database' | 'file' | 'api' | 'stream';
      data_source_status: 'active' | 'inactive' | 'error' | 'testing';
      report_status: 'draft' | 'published' | 'archived' | 'deleted';
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}