import { createContext, useContext, type ReactNode, useEffect } from 'react'
import { notification, message } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, description?: string, duration?: number) => void
  showMessage: (type: NotificationType, content: string, duration?: number) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // 配置全局通知样式
  useEffect(() => {
    notification.config({
      placement: 'topRight',
      duration: 4.5,
      rtl: false,
    })

    message.config({
      duration: 3,
      maxCount: 3,
    })
  }, [])

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      case 'info':
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  const showNotification = (
    type: NotificationType,
    title: string,
    description?: string,
    duration?: number
  ) => {
    notification[type]({
      message: title,
      description,
      icon: getIcon(type),
      duration,
      style: {
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    })
  }

  const showMessage = (
    type: NotificationType,
    content: string,
    duration?: number
  ) => {
    message[type]({
      content,
      duration,
      icon: getIcon(type)
    })
  }

  const showSuccess = (title: string, description?: string) => {
    showNotification('success', title, description)
  }

  const showError = (title: string, description?: string) => {
    showNotification('error', title, description)
  }

  const showInfo = (title: string, description?: string) => {
    showNotification('info', title, description)
  }

  const showWarning = (title: string, description?: string) => {
    showNotification('warning', title, description)
  }

  const contextValue: NotificationContextType = {
    showNotification,
    showMessage,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider