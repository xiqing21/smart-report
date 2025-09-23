import type { Template } from '../components/TemplateLibrary';

// 模拟的行业模板数据
const industryTemplates: Template[] = [
  {
    id: '1',
    name: '财务分析报告',
    description: '专业的财务数据分析报告模板，包含收入、支出、利润等关键财务指标',
    category: '财务',
    industry: '金融',
    type: 'pdf',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20financial%20report%20template%20with%20charts%20and%20tables%20blue%20theme&image_size=landscape_4_3',
    rating: 4.8,
    downloads: 15420,
    tags: ['财务', '分析', '专业'],
    isFavorite: false,
    isPublic: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    author: '财务专家团队',
    template: `
      <div class="financial-report">
        <header class="report-header">
          <h1>{{title}}</h1>
          <div class="report-meta">
            <span>报告期间: {{period}}</span>
            <span>生成时间: {{generatedAt}}</span>
          </div>
        </header>
        
        <section class="executive-summary">
          <h2>执行摘要</h2>
          <p>{{summary}}</p>
        </section>
        
        <section class="key-metrics">
          <h2>关键财务指标</h2>
          <div class="metrics-grid">
            {{#each metrics}}
            <div class="metric-card">
              <h3>{{this.name}}</h3>
              <div class="metric-value">{{this.value}}</div>
              <div class="metric-change {{this.changeType}}">{{this.change}}</div>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="charts-section">
          <h2>数据可视化</h2>
          {{#each charts}}
          <div class="chart-container">
            <h3>{{this.title}}</h3>
            <div class="chart-placeholder">[图表: {{this.title}}]</div>
          </div>
          {{/each}}
        </section>
      </div>
    `
  },
  {
    id: '2',
    name: '市场营销报告',
    description: '全面的市场营销活动效果分析报告，包含转化率、ROI等核心指标',
    category: '营销',
    industry: '市场营销',
    type: 'pptx',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=marketing%20report%20presentation%20template%20with%20colorful%20charts%20modern%20design&image_size=landscape_4_3',
    rating: 4.6,
    downloads: 12350,
    tags: ['营销', 'ROI', '转化率'],
    isFavorite: true,
    isPublic: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    author: '营销分析师',
    template: `
      <div class="marketing-report">
        <header class="report-header">
          <h1>{{title}}</h1>
          <div class="campaign-info">
            <span>活动周期: {{campaignPeriod}}</span>
            <span>目标受众: {{targetAudience}}</span>
          </div>
        </header>
        
        <section class="campaign-overview">
          <h2>活动概览</h2>
          <p>{{overview}}</p>
        </section>
        
        <section class="performance-metrics">
          <h2>核心指标</h2>
          <div class="metrics-dashboard">
            {{#each metrics}}
            <div class="metric-item">
              <span class="metric-label">{{this.name}}</span>
              <span class="metric-value">{{this.value}}</span>
              <span class="metric-target">目标: {{this.target}}</span>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="roi-analysis">
          <h2>投资回报分析</h2>
          <div class="roi-summary">
            <div class="roi-item">
              <h3>总投入</h3>
              <span class="amount">{{totalInvestment}}</span>
            </div>
            <div class="roi-item">
              <h3>总回报</h3>
              <span class="amount">{{totalReturn}}</span>
            </div>
            <div class="roi-item">
              <h3>ROI</h3>
              <span class="percentage">{{roi}}</span>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: '3',
    name: '运营数据报告',
    description: '企业运营关键指标监控报告，涵盖用户活跃度、业务增长等维度',
    category: '运营',
    industry: '企业管理',
    type: 'xlsx',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=business%20operations%20dashboard%20excel%20template%20with%20kpi%20metrics%20green%20theme&image_size=landscape_4_3',
    rating: 4.7,
    downloads: 9870,
    tags: ['运营', 'KPI', '监控'],
    isFavorite: false,
    isPublic: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-22',
    author: '运营团队',
    template: `
      <div class="operations-report">
        <header class="report-header">
          <h1>{{title}}</h1>
          <div class="period-info">
            <span>统计周期: {{period}}</span>
            <span>更新时间: {{lastUpdated}}</span>
          </div>
        </header>
        
        <section class="kpi-overview">
          <h2>核心KPI概览</h2>
          <div class="kpi-grid">
            {{#each kpis}}
            <div class="kpi-card">
              <h3>{{this.name}}</h3>
              <div class="kpi-value">{{this.current}}</div>
              <div class="kpi-comparison">
                <span class="previous">上期: {{this.previous}}</span>
                <span class="change {{this.trend}}">{{this.change}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="user-metrics">
          <h2>用户指标</h2>
          <div class="user-stats">
            <div class="stat-item">
              <h4>活跃用户</h4>
              <span class="stat-value">{{userMetrics.activeUsers}}</span>
            </div>
            <div class="stat-item">
              <h4>新增用户</h4>
              <span class="stat-value">{{userMetrics.newUsers}}</span>
            </div>
            <div class="stat-item">
              <h4>留存率</h4>
              <span class="stat-value">{{userMetrics.retentionRate}}</span>
            </div>
          </div>
        </section>
        
        <section class="business-metrics">
          <h2>业务指标</h2>
          {{#each businessMetrics}}
          <div class="business-item">
            <h4>{{this.category}}</h4>
            <div class="metric-details">
              {{#each this.items}}
              <span class="detail-item">{{this.name}}: {{this.value}}</span>
              {{/each}}
            </div>
          </div>
          {{/each}}
        </section>
      </div>
    `
  },
  {
    id: '4',
    name: '项目进度报告',
    description: '项目管理进度跟踪报告，包含里程碑、任务完成情况、风险评估',
    category: '项目管理',
    industry: '项目管理',
    type: 'docx',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=project%20management%20report%20template%20with%20gantt%20chart%20timeline%20purple%20theme&image_size=landscape_4_3',
    rating: 4.5,
    downloads: 8650,
    tags: ['项目', '进度', '管理'],
    isFavorite: false,
    isPublic: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-25',
    author: '项目管理办公室',
    template: `
      <div class="project-report">
        <header class="report-header">
          <h1>{{projectName}} - 进度报告</h1>
          <div class="project-info">
            <span>项目经理: {{projectManager}}</span>
            <span>报告周期: {{reportPeriod}}</span>
            <span>项目状态: {{projectStatus}}</span>
          </div>
        </header>
        
        <section class="project-summary">
          <h2>项目概要</h2>
          <p>{{projectSummary}}</p>
          
          <div class="progress-overview">
            <div class="progress-item">
              <h4>整体进度</h4>
              <div class="progress-bar">
                <div class="progress-fill" style="width: {{overallProgress}}%"></div>
              </div>
              <span class="progress-text">{{overallProgress}}%</span>
            </div>
          </div>
        </section>
        
        <section class="milestones">
          <h2>里程碑状态</h2>
          <div class="milestone-list">
            {{#each milestones}}
            <div class="milestone-item {{this.status}}">
              <h4>{{this.name}}</h4>
              <div class="milestone-details">
                <span class="due-date">计划完成: {{this.dueDate}}</span>
                <span class="actual-date">实际完成: {{this.actualDate}}</span>
                <span class="status">状态: {{this.status}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="task-summary">
          <h2>任务完成情况</h2>
          <div class="task-stats">
            <div class="stat-card">
              <h4>已完成</h4>
              <span class="stat-number">{{taskStats.completed}}</span>
            </div>
            <div class="stat-card">
              <h4>进行中</h4>
              <span class="stat-number">{{taskStats.inProgress}}</span>
            </div>
            <div class="stat-card">
              <h4>待开始</h4>
              <span class="stat-number">{{taskStats.pending}}</span>
            </div>
          </div>
        </section>
        
        <section class="risks-issues">
          <h2>风险与问题</h2>
          {{#if risks}}
          <div class="risk-list">
            {{#each risks}}
            <div class="risk-item {{this.severity}}">
              <h4>{{this.title}}</h4>
              <p>{{this.description}}</p>
              <div class="risk-meta">
                <span class="severity">严重程度: {{this.severity}}</span>
                <span class="mitigation">缓解措施: {{this.mitigation}}</span>
              </div>
            </div>
            {{/each}}
          </div>
          {{else}}
          <p>当前无重大风险或问题。</p>
          {{/if}}
        </section>
      </div>
    `
  },
  {
    id: '5',
    name: '销售业绩报告',
    description: '销售团队业绩分析报告，包含销售额、客户转化、团队表现等指标',
    category: '销售',
    industry: '销售',
    type: 'pdf',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=sales%20performance%20report%20template%20with%20revenue%20charts%20orange%20theme&image_size=landscape_4_3',
    rating: 4.9,
    downloads: 18750,
    tags: ['销售', '业绩', '转化'],
    isFavorite: true,
    isPublic: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-28',
    author: '销售总监',
    template: `
      <div class="sales-report">
        <header class="report-header">
          <h1>{{title}}</h1>
          <div class="sales-period">
            <span>销售周期: {{salesPeriod}}</span>
            <span>团队规模: {{teamSize}}</span>
          </div>
        </header>
        
        <section class="sales-summary">
          <h2>销售概要</h2>
          <div class="summary-metrics">
            <div class="metric-box">
              <h3>总销售额</h3>
              <span class="amount">{{totalRevenue}}</span>
              <span class="target">目标: {{revenueTarget}}</span>
            </div>
            <div class="metric-box">
              <h3>完成率</h3>
              <span class="percentage">{{completionRate}}</span>
            </div>
            <div class="metric-box">
              <h3>新客户</h3>
              <span class="count">{{newCustomers}}</span>
            </div>
          </div>
        </section>
        
        <section class="sales-funnel">
          <h2>销售漏斗分析</h2>
          <div class="funnel-stages">
            {{#each funnelStages}}
            <div class="funnel-stage">
              <h4>{{this.stage}}</h4>
              <div class="stage-metrics">
                <span class="count">{{this.count}}</span>
                <span class="conversion">转化率: {{this.conversionRate}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="team-performance">
          <h2>团队表现</h2>
          <div class="team-stats">
            {{#each teamMembers}}
            <div class="member-card">
              <h4>{{this.name}}</h4>
              <div class="member-metrics">
                <span class="sales">销售额: {{this.sales}}</span>
                <span class="deals">成交数: {{this.deals}}</span>
                <span class="rate">成交率: {{this.closingRate}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </section>
        
        <section class="customer-analysis">
          <h2>客户分析</h2>
          <div class="customer-segments">
            {{#each customerSegments}}
            <div class="segment-item">
              <h4>{{this.segment}}</h4>
              <div class="segment-data">
                <span class="revenue">收入贡献: {{this.revenue}}</span>
                <span class="count">客户数量: {{this.customerCount}}</span>
                <span class="avg-deal">平均订单: {{this.avgDealSize}}</span>
              </div>
            </div>
            {{/each}}
          </div>
        </section>
      </div>
    `
  }
];

// 模板服务类
class TemplateService {
  // 获取所有模板
  async getAllTemplates(): Promise<Template[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return industryTemplates;
  }
  
  // 根据分类获取模板
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return industryTemplates.filter(template => 
      template.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  // 根据类型获取模板
  async getTemplatesByType(type: string): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return industryTemplates.filter(template => template.type === type);
  }
  
  // 搜索模板
  async searchTemplates(query: string): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const searchTerm = query.toLowerCase();
    return industryTemplates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // 获取收藏的模板
  async getFavoriteTemplates(): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return industryTemplates.filter(template => template.isFavorite);
  }
  
  // 根据ID获取模板
  async getTemplateById(id: string): Promise<Template | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return industryTemplates.find(template => template.id === id) || null;
  }
  
  // 切换收藏状态
  async toggleFavorite(templateId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const template = industryTemplates.find(t => t.id === templateId);
    if (template) {
      template.isFavorite = !template.isFavorite;
      return template.isFavorite;
    }
    return false;
  }
  
  // 增加下载次数
  async incrementDownloads(templateId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const template = industryTemplates.find(t => t.id === templateId);
    if (template) {
      template.downloads += 1;
    }
  }
  
  // 获取模板分类列表
  getCategories(): string[] {
    const categories = [...new Set(industryTemplates.map(t => t.category))];
    return categories.sort();
  }
  
  // 获取热门模板（按下载量排序）
  async getPopularTemplates(limit: number = 5): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...industryTemplates]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }
  
  // 获取最新模板（按创建时间排序）
  async getLatestTemplates(limit: number = 5): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...industryTemplates]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// 导出单例实例
export const templateService = new TemplateService();
export default templateService;