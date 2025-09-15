import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Profile from '../pages/Profile'

// 四大核心模块页面
import Workspace from '@/pages/Workspace'
import DataCenter from '@/pages/DataCenter'
import IntelligentAnalysis from '@/pages/IntelligentAnalysis'
import ReportFactory from '@/pages/ReportFactory'

// 原有页面保留
import Dashboard from '../pages/Dashboard'
import Reports from '../pages/Reports'
import ReportEditor from '../pages/ReportEditor'
import Templates from '../pages/Templates'
import AIAnalysis from '../pages/AIAnalysis'
import DataPipeline from '../pages/DataPipeline'
import DataButler from '../pages/DataButler'
import ChartGeneration from '../pages/ChartGeneration'
import TrendPrediction from '../pages/TrendPrediction'
import AgentMonitor from '../pages/AgentMonitor'
import TestPage from '../pages/TestPage'
import TestRunner from '../pages/TestRunner'
import KnowledgeBase from '../pages/KnowledgeBase'
import Export from '../pages/Export'
import ProtectedRoute from '../components/ProtectedRoute'

// 根据环境变量设置basename
const getBasename = () => {
  // 在GitHub Pages环境中使用/smart-report/作为basename
  if (import.meta.env.VITE_GITHUB_PAGES === 'true') {
    return '/smart-report'
  }
  return '/'
}

export const router = createBrowserRouter([
  // 公开路由 - 未认证用户可访问
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  // 受保护路由 - 需要认证
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
          index: true,
          element: <Navigate to="/workspace" replace />,
        },
      // 四大核心模块路由
      {
        path: 'workspace',
        element: <Workspace />,
      },
      {
        path: 'data-center',
        element: <DataCenter />,
      },
      {
        path: 'intelligent-analysis',
        element: <IntelligentAnalysis />,
      },
      {
        path: 'report-factory',
        element: <ReportFactory />,
      },
      // 原有页面路由保留
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'editor/:id?',
        element: <ReportEditor />,
      },
      {
        path: 'templates',
        element: <Templates />,
      },
      {
        path: 'analysis',
        element: <AIAnalysis />,
      },
      {
        path: 'data-pipeline',
        element: <DataPipeline />,
      },
      {
        path: 'data-butler',
        element: <DataButler />,
      },
      {
        path: 'chart-generation',
        element: <ChartGeneration />,
      },
      {
        path: 'trend-prediction',
        element: <TrendPrediction />,
      },
      {
        path: 'agent-monitor',
        element: <AgentMonitor />,
      },
      {
        path: 'knowledge-base',
        element: <KnowledgeBase />,
      },
      {
        path: 'export',
        element: <Export />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'test',
        element: <TestPage />,
      },
      {
        path: 'test-runner',
        element: <TestRunner />,
      },
    ],
  },
], {
  basename: getBasename(),
  future: {
    v7_skipActionErrorRevalidation: true,
    v7_partialHydration: true,
    v7_normalizeFormMethod: true,
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true
  }
})