// Supabase连接测试工具
// Supabase Connection Test Utility

import { supabase } from '../lib/supabase';

export class SupabaseTestUtil {
  // 测试基本连接
  static async testConnection(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🔍 测试Supabase连接...');
      
      // 测试基本连接
      const { data, error } = await supabase
        .from('reports')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Supabase连接失败:', error);
        return {
          success: false,
          error: error.message,
          details: error
        };
      }
      
      console.log('✅ Supabase连接成功');
      return {
        success: true,
        details: { count: data }
      };
    } catch (error) {
      console.error('❌ Supabase连接异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接异常',
        details: error
      };
    }
  }
  
  // 测试表结构
  static async testTableStructure(): Promise<{ success: boolean; error?: string; tables?: string[] }> {
    try {
      console.log('🔍 检查数据库表结构...');
      
      // 尝试查询不同的表
      const tables = ['reports', 'report_templates', 'analysis_tasks', 'data_sources'];
      const results: string[] = [];
      
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .limit(1);
          
          if (!error) {
            results.push(table);
            console.log(`✅ 表 ${table} 存在`);
          } else {
            console.log(`❌ 表 ${table} 不存在或无权限:`, error.message);
          }
        } catch (err) {
          console.log(`❌ 表 ${table} 查询异常:`, err);
        }
      }
      
      return {
        success: true,
        tables: results
      };
    } catch (error) {
      console.error('❌ 表结构检查异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查异常'
      };
    }
  }
  
  // 测试插入操作
  static async testInsert(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      console.log('🔍 测试数据插入...');
      
      const testData = {
        title: `测试报告 - ${new Date().toISOString()}`,
        content: {
          text: '这是一个测试报告内容',
          createdAt: new Date().toISOString()
        },
        status: 'draft',
        owner_id: '00000000-0000-0000-0000-000000000001',
        organization_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await (supabase as any)
        .from('reports')
        .insert(testData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ 数据插入失败:', error);
        return {
          success: false,
          error: error.message,
          data: error
        };
      }
      
      console.log('✅ 数据插入成功:', data);
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ 数据插入异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '插入异常'
      };
    }
  }
  
  // 测试查询操作
  static async testQuery(): Promise<{ success: boolean; error?: string; data?: any[] }> {
    try {
      console.log('🔍 测试数据查询...');
      
      const { data, error } = await (supabase as any)
        .from('reports')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('❌ 数据查询失败:', error);
        return {
          success: false,
          error: error.message
        };
      }
      
      console.log('✅ 数据查询成功，找到', data?.length || 0, '条记录');
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ 数据查询异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询异常'
      };
    }
  }
  
  // 运行完整测试
  static async runFullTest(): Promise<{
    connection: boolean;
    tables: string[];
    insert: boolean;
    query: boolean;
    summary: string;
  }> {
    console.log('🚀 开始Supabase完整测试...');
    
    const connectionResult = await this.testConnection();
    const tableResult = await this.testTableStructure();
    const insertResult = await this.testInsert();
    const queryResult = await this.testQuery();
    
    const summary = `
📊 Supabase测试结果:
- 连接状态: ${connectionResult.success ? '✅ 成功' : '❌ 失败'}
- 可用表: ${tableResult.tables?.join(', ') || '无'}
- 插入测试: ${insertResult.success ? '✅ 成功' : '❌ 失败'}
- 查询测试: ${queryResult.success ? '✅ 成功' : '❌ 失败'}

${!connectionResult.success ? `连接错误: ${connectionResult.error}\n` : ''}
${!insertResult.success ? `插入错误: ${insertResult.error}\n` : ''}
${!queryResult.success ? `查询错误: ${queryResult.error}\n` : ''}
`;
    
    console.log(summary);
    
    return {
      connection: connectionResult.success,
      tables: tableResult.tables || [],
      insert: insertResult.success,
      query: queryResult.success,
      summary
    };
  }
}

// 导出便捷函数
export const testSupabaseConnection = () => SupabaseTestUtil.runFullTest();