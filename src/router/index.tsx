import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Reports from '../pages/Reports'
import ReportEditor from '../pages/ReportEditor'
import Templates from '../pages/Templates'
import AIAnalysis from '../pages/AIAnalysis'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
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
    ],
  },
])