// 数据服务层
// Data Service Layer for Supabase Integration

import { supabase } from '../../lib/supabase';
import type {
  Database,
  DataSource,
  DataSourceInsert,
  DataSourceUpdate,
  AnalysisTask,
  AnalysisTaskInsert,
  AnalysisTaskUpdate,
  AnalysisResult,
  AnalysisResultInsert,
  Report,
  ReportInsert,
  ReportUpdate,
  ReportTemplate,
  UserProfile
} from '../../types/database';

// 通用响应类型
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error: string | null;
  success: boolean;
}

// 数据源服务
export class DataSourceService {
  // 获取数据源列表
  static async getDataSources(page = 1, pageSize = 20): Promise<PaginatedResponse<DataSource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: '用户未登录',
          success: false
        };
      }

      const offset = (page - 1) * pageSize;
      
      // 获取总数
      const { count } = await supabase
        .from('data_sources')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // 获取数据
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: error.message,
          success: false
        };
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        error: error instanceof Error ? error.message : '获取数据源失败',
        success: false
      };
    }
  }

  // 创建数据源
  static async createDataSource(dataSource: DataSourceInsert): Promise<ApiResponse<DataSource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase
        .from('data_sources')
        .insert({
          ...dataSource,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 记录用户活动
      await this.logUserActivity('create_data_source', 'data_source', data.id);

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '创建数据源失败',
        success: false
      };
    }
  }

  // 更新数据源
  static async updateDataSource(id: string, updates: DataSourceUpdate): Promise<ApiResponse<DataSource>> {
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 记录用户活动
      await this.logUserActivity('update_data_source', 'data_source', id);

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '更新数据源失败',
        success: false
      };
    }
  }

  // 删除数据源
  static async deleteDataSource(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('data_sources')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 记录用户活动
      await this.logUserActivity('delete_data_source', 'data_source', id);

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '删除数据源失败',
        success: false
      };
    }
  }

  // 测试数据源连接
  static async testConnection(id: string): Promise<ApiResponse<boolean>> {
    try {
      // 更新状态为测试中
      await supabase
        .from('data_sources')
        .update({ status: 'testing' })
        .eq('id', id);

      // 模拟连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 随机成功或失败（实际应该根据真实连接结果）
      const isSuccess = Math.random() > 0.2;
      const status = isSuccess ? 'active' : 'error';

      await supabase
        .from('data_sources')
        .update({ status })
        .eq('id', id);

      return { data: isSuccess, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '连接测试失败',
        success: false
      };
    }
  }

  private static async logUserActivity(action: string, resourceType: string, resourceId: string): Promise<void> {
    try {
      await supabase.rpc('log_user_activity', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId
      });
    } catch (error) {
      console.warn('Failed to log user activity:', error);
    }
  }
}

// 分析任务服务
export class AnalysisTaskService {
  // 获取分析任务列表
  static async getAnalysisTasks(
    page = 1,
    pageSize = 20,
    statusFilter?: string
  ): Promise<PaginatedResponse<AnalysisTask>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: '用户未登录',
          success: false
        };
      }

      // 使用数据库函数进行分页查询
      const { data, error } = await supabase.rpc('get_analysis_tasks_paginated', {
        user_uuid: user.id,
        page_size: pageSize,
        page_offset: (page - 1) * pageSize,
        status_filter: statusFilter
      });

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: error.message,
          success: false
        };
      }

      const total = data?.[0]?.total_count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: data || [],
        total,
        page,
        pageSize,
        totalPages,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        error: error instanceof Error ? error.message : '获取分析任务失败',
        success: false
      };
    }
  }

  // 创建分析任务
  static async createAnalysisTask(task: AnalysisTaskInsert): Promise<ApiResponse<AnalysisTask>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase
        .from('analysis_tasks')
        .insert({
          ...task,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '创建分析任务失败',
        success: false
      };
    }
  }

  // 更新分析任务
  static async updateAnalysisTask(id: string, updates: AnalysisTaskUpdate): Promise<ApiResponse<AnalysisTask>> {
    try {
      const { data, error } = await supabase
        .from('analysis_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '更新分析任务失败',
        success: false
      };
    }
  }

  // 获取分析任务详情
  static async getAnalysisTask(id: string): Promise<ApiResponse<AnalysisTask>> {
    try {
      const { data, error } = await supabase
        .from('analysis_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取分析任务失败',
        success: false
      };
    }
  }

  // 启动分析任务
  static async startAnalysisTask(id: string): Promise<ApiResponse<AnalysisTask>> {
    try {
      const { data, error } = await supabase
        .from('analysis_tasks')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          progress: 0
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '启动分析任务失败',
        success: false
      };
    }
  }

  // 停止分析任务
  static async stopAnalysisTask(id: string): Promise<ApiResponse<AnalysisTask>> {
    try {
      const { data, error } = await supabase
        .from('analysis_tasks')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '停止分析任务失败',
        success: false
      };
    }
  }
}

// 分析结果服务
export class AnalysisResultService {
  // 保存分析结果
  static async saveAnalysisResult(result: AnalysisResultInsert): Promise<ApiResponse<AnalysisResult>> {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .insert(result)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '保存分析结果失败',
        success: false
      };
    }
  }

  // 获取分析结果
  static async getAnalysisResult(taskId: string): Promise<ApiResponse<AnalysisResult>> {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取分析结果失败',
        success: false
      };
    }
  }
}

// 报告服务
export class ReportService {
  // 获取报告列表
  static async getReports(page = 1, pageSize = 20): Promise<PaginatedResponse<Report>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: '用户未登录',
          success: false
        };
      }

      const offset = (page - 1) * pageSize;
      
      // 获取总数
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      // 获取数据
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
          error: error.message,
          success: false
        };
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
        error: error instanceof Error ? error.message : '获取报告失败',
        success: false
      };
    }
  }

  // 创建报告
  static async createReport(report: ReportInsert): Promise<ApiResponse<Report>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...report,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '创建报告失败',
        success: false
      };
    }
  }

  // 更新报告
  static async updateReport(id: string, updates: ReportUpdate): Promise<ApiResponse<Report>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '更新报告失败',
        success: false
      };
    }
  }

  // 获取报告详情
  static async getReport(id: string): Promise<ApiResponse<Report>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 增加查看次数
      await supabase
        .from('reports')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取报告失败',
        success: false
      };
    }
  }

  // 发布报告
  static async publishReport(id: string): Promise<ApiResponse<Report>> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '发布报告失败',
        success: false
      };
    }
  }
}

// 报告模板服务
export class ReportTemplateService {
  // 获取报告模板列表
  static async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('report_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      // 如果用户已登录，包含用户自己的模板
      if (user) {
        query = query.or(`is_public.eq.true,is_system.eq.true,owner_id.eq.${user.id}`);
      } else {
        query = query.or('is_public.eq.true,is_system.eq.true');
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取报告模板失败',
        success: false
      };
    }
  }

  // 获取模板详情
  static async getReportTemplate(id: string): Promise<ApiResponse<ReportTemplate>> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 增加使用次数
      await supabase
        .from('report_templates')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', id);

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取报告模板失败',
        success: false
      };
    }
  }
}

// 用户服务
export class UserService {
  // 获取用户配置文件
  static async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取用户信息失败',
        success: false
      };
    }
  }

  // 更新用户配置文件
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '更新用户信息失败',
        success: false
      };
    }
  }

  // 获取用户权限
  static async getUserPermissions(): Promise<ApiResponse<string[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_uuid: user.id
      });

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: data || [], error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '获取用户权限失败',
        success: false
      };
    }
  }

  // 检查用户权限
  static async checkUserPermission(permission: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: false, error: '用户未登录', success: false };
      }

      const { data, error } = await supabase.rpc('check_user_permission', {
        user_uuid: user.id,
        permission
      });

      if (error) {
        return { data: false, error: error.message, success: false };
      }

      return { data: data || false, error: null, success: true };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : '检查用户权限失败',
        success: false
      };
    }
  }
}

// 文件上传服务
export class FileUploadService {
  // 上传文件
  static async uploadFile(file: File, bucket = 'data-files'): Promise<ApiResponse<string>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: '用户未登录', success: false };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { data: publicUrl, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : '文件上传失败',
        success: false
      };
    }
  }

  // 删除文件
  static async deleteFile(filePath: string, bucket = 'data-files'): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return { data: false, error: error.message, success: false };
      }

      return { data: true, error: null, success: true };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : '文件删除失败',
        success: false
      };
    }
  }
}

// 所有服务已通过class声明导出