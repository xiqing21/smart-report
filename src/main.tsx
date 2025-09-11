// import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import './styles/global.css'
import App from './App.tsx'

// Ant Design 主题配置
const theme = {
  token: {
    colorPrimary: '#1890FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1890FF',
    borderRadius: 6,
    fontFamily: 'PingFang SC, Microsoft YaHei, Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={theme} locale={zhCN}>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={4000}
      />
    </AuthProvider>
  </ConfigProvider>,
)
