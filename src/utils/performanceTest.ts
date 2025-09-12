// 性能测试工具类
export class PerformanceTest {
  private static instance: PerformanceTest;
  private testResults: Map<string, any> = new Map();

  static getInstance(): PerformanceTest {
    if (!PerformanceTest.instance) {
      PerformanceTest.instance = new PerformanceTest();
    }
    return PerformanceTest.instance;
  }

  // 测试页面加载性能
  async testPageLoad(url: string = window.location.href): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  }> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const paintEntries = entries.filter(entry => entry.entryType === 'paint');
        const lcpEntries = entries.filter(entry => entry.entryType === 'largest-contentful-paint');
        
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const result = {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: lcpEntries[lcpEntries.length - 1]?.startTime || 0
        };
        
        this.testResults.set('pageLoad', result);
        resolve(result);
        observer.disconnect();
      });
      
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    });
  }

  // 测试API响应时间
  async testApiResponse(endpoint: string, options: RequestInit = {}): Promise<{
    responseTime: number;
    status: number;
    success: boolean;
  }> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const result = {
        responseTime,
        status: response.status,
        success: response.ok
      };
      
      this.testResults.set(`api_${endpoint}`, result);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const result = {
        responseTime,
        status: 0,
        success: false
      };
      
      this.testResults.set(`api_${endpoint}`, result);
      return result;
    }
  }

  // 并发API测试
  async testConcurrentApi(endpoint: string, concurrency: number = 10, options: RequestInit = {}): Promise<{
    averageResponseTime: number;
    successRate: number;
    maxResponseTime: number;
    minResponseTime: number;
    results: Array<{ responseTime: number; success: boolean; status: number }>;
  }> {
    const promises = Array.from({ length: concurrency }, () => 
      this.testApiResponse(endpoint, options)
    );
    
    const results = await Promise.all(promises);
    
    const responseTimes = results.map(r => r.responseTime);
    const successCount = results.filter(r => r.success).length;
    
    const testResult = {
      averageResponseTime: responseTimes.reduce((a, b) => a + b,