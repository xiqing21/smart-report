// 测试数据脚本 - 用于检查和创建报告数据

// 模拟localStorage环境
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// 模拟LocalStorageService
class TestLocalStorageService {
  static REPORTS_KEY = 'smart_report_reports';
  static COUNTER_KEY = 'smart_report_counter';

  static getNextId() {
    const counter = parseInt(localStorage.getItem(this.COUNTER_KEY) || '0', 10) + 1;
    localStorage.setItem(this.COUNTER_KEY, counter.toString());
    return `local_report_${counter}`;
  }

  static getReports() {
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

  static saveReport(reportData) {
    try {
      const reports = this.getReports();
      const now = new Date().toISOString();
      
      const newReport = {
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
}

// 创建测试数据
function createTestReports() {
  console.log('🔍 检查现有报告数据...');
  const existingReports = TestLocalStorageService.getReports();
  console.log('现有报告数量:', existingReports.length);
  
  if (existingReports.length === 0) {
    console.log('📝 创建测试报告数据...');
    
    // 创建几个测试报告
    const testReports = [
      {
        title: '测试报告 1 - 数据分析报告',
        content: {
          text: '这是一个测试数据分析报告的内容。包含了各种数据图表和分析结果。',
          type: 'analysis'
        },
        status: 'published',
        tags: ['数据分析', '测试']
      },
      {
        title: '测试报告 2 - 市场调研报告',
        content: {
          text: '这是一个市场调研报告的测试内容。包含了市场趋势和竞争分析。',
          type: 'market_research'
        },
        status: 'draft',
        tags: ['市场调研', '测试']
      },
      {
        title: '测试报告 3 - 财务分析报告',
        content: {
          text: '这是一个财务分析报告的测试内容。包含了财务数据和趋势分析。',
          type: 'financial'
        },
        status: 'published',
        tags: ['财务分析', '测试']
      }
    ];
    
    testReports.forEach((report, index) => {
      try {
        const savedReport = TestLocalStorageService.saveReport(report);
        console.log(`✅ 测试报告 ${index + 1} 创建成功:`, savedReport.id);
      } catch (error) {
        console.error(`❌ 测试报告 ${index + 1} 创建失败:`, error);
      }
    });
  } else {
    console.log('✅ 已存在报告数据，无需创建测试数据');
    existingReports.forEach((report, index) => {
      console.log(`报告 ${index + 1}:`, report.title, '- 状态:', report.status);
    });
  }
  
  // 输出localStorage数据供浏览器使用
  console.log('\n📋 localStorage数据:');
  console.log('REPORTS_KEY:', TestLocalStorageService.REPORTS_KEY);
  console.log('COUNTER_KEY:', TestLocalStorageService.COUNTER_KEY);
  console.log('Reports JSON:', localStorage.getItem(TestLocalStorageService.REPORTS_KEY));
  console.log('Counter:', localStorage.getItem(TestLocalStorageService.COUNTER_KEY));
}

// 运行测试
createTestReports();

// 导出数据供浏览器控制台使用
console.log('\n🌐 浏览器控制台命令:');
console.log('// 在浏览器控制台中运行以下命令来创建测试数据:');
console.log(`localStorage.setItem('${TestLocalStorageService.REPORTS_KEY}', '${localStorage.getItem(TestLocalStorageService.REPORTS_KEY)}');`);
console.log(`localStorage.setItem('${TestLocalStorageService.COUNTER_KEY}', '${localStorage.getItem(TestLocalStorageService.COUNTER_KEY)}');`);
console.log('// 然后刷新页面查看报告');