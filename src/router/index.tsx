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
import ProtectedRoute from '../components/ProtectedRoute'

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
    ],
  },
])