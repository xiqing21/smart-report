// 本地存储服务 - 作为Supabase的临时替代方案
// Local Storage Service - Temporary replacement for Supabase

import type { Report, ReportInsert } from '../../types/database';

export interface LocalReport extends Omit<Report, 'id' | 'created_at' | 'updated_at'> {
  id: string;
  created_at: string;
  updated_at: string;
}

export class LocalStorageService {
  private static readonly REPORTS_KEY = 'smart_report_reports';
  private static readonly COUNTER_KEY = 'smart_report_counter';

  // 获取下一个ID
  private static getNextId(): string {
    const counter = parseInt(localStorage.getItem(this.COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(this.COUNTER_KEY, counter.toString());
    return `local_report_${counter}`;
  }

  // 获取所有报告
  static getReports(): LocalReport[] {
    try {
      const reportsJson = localStorage.getItem(this.REPORTS_KEY);
      if (!reportsJson) return [];
      
      const reports = JSON.parse(reportsJson);
      return Array.isArray(reports) ? reports : [];
    } catch (error) {
      console.error('获取本地报告失败:', error);
      return [];
    }
  }

  // 保存报告
  static saveReport(reportData: ReportInsert): LocalReport {
    try {
      const reports = this.getReports();
      const now = new Date().toISOString();
      
      const newReport: LocalReport = {
        id: this.getNextId(),
        title: reportData.title,
        content: reportData.content,
        status: reportData.status || 'draft',
        owner_id: reportData.owner_id || '00000000-0000-0000-0000-000000000001',
        organization_id: reportData.organization_id || null,
        template_id: reportData.template_id || null,
        analysis_task_id: reportData.analysis_task_id || null,
        published_at: null,
        view_count: 0,
        download_count: 0,
        tags: reportData.tags || [],
        metadata: reportData.metadata || {},
        created_at: now,
        updated_at: now
      };
      
      reports.push(newReport);
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      
      console.log('✅ 报告已保存到本地存储:', newReport.id);
      return newReport;
    } catch (error) {
      console.error('保存报告到本地存储失败:', error);
      throw new Error('保存报告失败');
    }
  }

  // 获取单个报告
  static getReport(id: string): LocalReport | null {
    try {
      const reports = this.getReports();
      return reports.find(report => report.id === id) || null;
    } catch (error) {
      console.error('获取报告失败:', error);
      return null;
    }
  }

  // 更新报告
  static updateReport(id: string, updates: Partial<ReportInsert>): LocalReport | null {
    try {
      const reports = this.getReports();
      const reportIndex = reports.findIndex(report => report.id === id);
      
      if (reportIndex === -1) {
        throw new Error('报告不存在');
      }
      
      const updatedReport = {
        ...reports[reportIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      reports[reportIndex] = updatedReport;
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
      
      console.log('✅ 报告已更新:', id);
      return updatedReport;
    } catch (error) {
      console.error('更新报告失败:', error);
      return null;
    }
  }

  // 删除报告
  static deleteReport(id: string): boolean {
    try {
      const reports = this.getReports();
      const filteredReports = reports.filter(report => report.id !== id);
      
      if (filteredReports.length === reports.length) {
        return false; // 报告不存在
      }
      
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(filteredReports));
      console.log('✅ 报告已删除:', id);
      return true;
    } catch (error) {
      console.error('删除报告失败:', error);
      return false;
    }
  }

  // 清空所有报告
  static clearAllReports(): void {
    try {
      localStorage.removeItem(this.REPORTS_KEY);
      localStorage.removeItem(this.COUNTER_KEY);
      console.log('✅ 所有报告已清空');
    } catch (error) {
      console.error('清空报告失败:', error);
    }
  }

  // 获取报告统计
  static getStats(): {
    total: number;
    draft: number;
    published: number;
    archived: number;
  } {
    try {
      const reports = this.getReports();
      return {
        total: reports.length,
        draft: reports.filter(r => r.status === 'draft').length,
        published: reports.filter(r => r.status === 'published').length,
        archived: reports.filter(r => r.status === 'archived').length
      };
    } catch (error) {
      console.error('获取统计失败:', error);
      return { total: 0, draft: 0, published: 0, archived: 0 };
    }
  }

  // 导出数据（用于备份）
  static exportData(): string {
    try {
      const reports = this.getReports();
      return JSON.stringify({
        reports,
        exportTime: new Date().toISOString(),
        version: '1.0'
      }, null, 2);
    } catch (error) {
      console.error('导出数据失败:', error);
      return '{}';
    }
  }

  // 导入数据（用于恢复）
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.reports && Array.isArray(data.reports)) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(data.reports));
        console.log('✅ 数据导入成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}

// 导出便捷函数
export const localReportService = {
  getAll: () => LocalStorageService.getReports(),
  save: (report: ReportInsert) => LocalStorageService.saveReport(report),
  get: (id: string) => LocalStorageService.getReport(id),
  update: (id: string, updates: Partial<ReportInsert>) => LocalStorageService.updateReport(id, updates),
  delete: (id: string) => LocalStorageService.deleteReport(id),
  clear: () => LocalStorageService.clearAllReports(),
  stats: () => LocalStorageService.getStats(),
  export: () => LocalStorageService.exportData(),
  import: (data: string) => LocalStorageService.importData(data)
};