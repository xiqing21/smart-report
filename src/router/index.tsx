import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import Profile from '../pages/Profile'
import Dashboard from '../pages/Dashboard'
import Reports from '../pages/Reports'
import ReportEditor from '../pages/ReportEditor'
import Templates from '../pages/Templates'
import AIAnalysis from '../pages/AIAnalysis'
import AgentMonitor from '../pages/AgentMonitor'
import TestPage from '../pages/TestPage'
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
        element: <Navigate to="/dashboard" replace />,
      },
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
        path: 'agent-monitor',
        element: <AgentMonitor />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'test',
        element: <TestPage />,
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