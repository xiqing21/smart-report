import React, { useState, useEffect } from 'react';
import { Card, Badge, Progress } from 'antd';
import { Activity, Clock, Cpu, HardDrive, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  bundleSize: number;
}

interface PerformanceThresholds {
  pageLoadTime: { good: number; fair: number };
  apiResponseTime: { good: number; fair: number };
  memoryUsage: { good: number; fair: number };
  networkLatency: { good: number; fair: number };
}

const THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: { good: 3000, fair: 5000 }, // 3s good, 5s fair
  apiResponseTime: { good: 1000, fair: 2000 }, // 1s good, 2s fair
  memoryUsage: { good: 50, fair: 80 }, // 50MB good, 80MB fair
  networkLatency: { good: 100, fair: 300 } // 100ms good, 300ms fair
};

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    bundleSize: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // 获取页面加载性能指标
    const getPageLoadMetrics = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        setMetrics(prev => ({
          ...prev,
          pageLoadTime,
          renderTime
        }));
      }
    };

    // 获取内存使用情况
    const getMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }));
      }
    };

    // 测试API响应时间
    const testApiResponse = async () => {
      const startTime = performance.now();
      try {
        await fetch('/api/health', { method: 'GET' });
        const endTime = performance.now();
        const apiResponseTime = endTime - startTime;
        
        setMetrics(prev => ({
          ...prev,
          apiResponseTime
        }));
      } catch (error) {
        console.warn('API health check failed:', error);
      }
    };

    // 测试网络延迟
    const testNetworkLatency = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch('/favicon.ico', { method: 'HEAD' });
        if (response.ok) {
          const endTime = performance.now();
          const networkLatency = endTime - startTime;
          
          setMetrics(prev => ({
            ...prev,
            networkLatency
          }));
        }
      } catch (error) {
        console.warn('Network latency test failed:', error);
      }
    };

    // 获取打包大小（模拟）
    const getBundleSize = () => {
      // 在实际项目中，这个值应该从构建工具获取
      const estimatedBundleSize = 2.5; // MB
      setMetrics(prev => ({
        ...prev,
        bundleSize: estimatedBundleSize
      }));
    };

    const runMetrics = () => {
      getPageLoadMetrics();
      getMemoryMetrics();
      testApiResponse();
      testNetworkLatency();
      getBundleSize();
    };

    // 初始运行
    runMetrics();

    // 定期更新指标
    const interval = setInterval(() => {
      if (isMonitoring) {
        getMemoryMetrics();
        testApiResponse();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getPerformanceStatus = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'bg-green-500' };
    if (value <= thresholds.fair) return { status: 'fair', color: 'bg-yellow-500' };
    return { status: 'poor', color: 'bg-red-500' };
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    return `${mb.toFixed(2)}MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">性能监控</h2>
        <div className="flex items-center space-x-2">
          <Badge 
            color={isMonitoring ? "green" : "default"}
            text={isMonitoring ? '监控中' : '已暂停'}
            className="cursor-pointer"
            onClick={() => setIsMonitoring(!isMonitoring)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 页面加载时间 */}
        <Card
          title="页面加载时间"
          extra={<Clock />}
        >
          <div className="text-2xl font-bold">{formatTime(metrics.pageLoadTime)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              getPerformanceStatus(metrics.pageLoadTime, THRESHOLDS.pageLoadTime).color
            }`} />
            <p className="text-xs text-muted-foreground">
              目标: ≤3秒
            </p>
          </div>
          <Progress 
            percent={Math.min((metrics.pageLoadTime / THRESHOLDS.pageLoadTime.fair) * 100, 100)} 
            className="mt-2"
            showInfo={false}
          />
        </Card>

        {/* API响应时间 */}
        <Card
          title="API响应时间"
          extra={<Wifi />}
        >
          <div className="text-2xl font-bold">{formatTime(metrics.apiResponseTime)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              getPerformanceStatus(metrics.apiResponseTime, THRESHOLDS.apiResponseTime).color
            }`} />
            <p className="text-xs text-muted-foreground">
              目标: ≤1秒
            </p>
          </div>
          <Progress 
            percent={Math.min((metrics.apiResponseTime / THRESHOLDS.apiResponseTime.fair) * 100, 100)} 
            className="mt-2"
            showInfo={false}
          />
        </Card>

        {/* 内存使用 */}
        <Card
          title="内存使用"
          extra={<Cpu />}
        >
          <div className="text-2xl font-bold">{formatSize(metrics.memoryUsage)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              getPerformanceStatus(metrics.memoryUsage, THRESHOLDS.memoryUsage).color
            }`} />
            <p className="text-xs text-muted-foreground">
              目标: ≤50MB
            </p>
          </div>
          <Progress 
            percent={Math.min((metrics.memoryUsage / THRESHOLDS.memoryUsage.fair) * 100, 100)} 
            className="mt-2"
            showInfo={false}
          />
        </Card>

        {/* 网络延迟 */}
        <Card
          title="网络延迟"
          extra={<Activity />}
        >
          <div className="text-2xl font-bold">{formatTime(metrics.networkLatency)}</div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              getPerformanceStatus(metrics.networkLatency, THRESHOLDS.networkLatency).color
            }`} />
            <p className="text-xs text-muted-foreground">
              目标: ≤100ms
            </p>
          </div>
          <Progress 
            percent={Math.min((metrics.networkLatency / THRESHOLDS.networkLatency.fair) * 100, 100)} 
            className="mt-2"
            showInfo={false}
          />
        </Card>

        {/* 渲染时间 */}
        <Card
          title="DOM渲染时间"
          extra={<Clock />}
        >
          <div className="text-2xl font-bold">{formatTime(metrics.renderTime)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            DOM内容加载完成时间
          </p>
        </Card>

        {/* 打包大小 */}
        <Card
          title="打包大小"
          extra={<HardDrive />}
        >
          <div className="text-2xl font-bold">{formatSize(metrics.bundleSize)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            JavaScript包总大小
          </p>
        </Card>
      </div>

      {/* 性能建议 */}
      <Card title="性能建议">
        <div className="space-y-2">
            {metrics.pageLoadTime > THRESHOLDS.pageLoadTime.good && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>页面加载时间较长，建议优化图片压缩和代码分割</span>
              </div>
            )}
            {metrics.apiResponseTime > THRESHOLDS.apiResponseTime.good && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>API响应时间较长，建议优化数据库查询和添加缓存</span>
              </div>
            )}
            {metrics.memoryUsage > THRESHOLDS.memoryUsage.good && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>内存使用较高，建议检查内存泄漏和优化组件渲染</span>
              </div>
            )}
            {metrics.networkLatency > THRESHOLDS.networkLatency.good && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>网络延迟较高，建议使用CDN和优化资源加载</span>
              </div>
            )}
          </div>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;