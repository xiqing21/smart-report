import { createContext, useContext, useState, type ReactNode } from 'react'
import { Spin } from 'antd'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean, message?: string) => void
  loadingMessage: string
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('加载中...')

  const setLoading = (loading: boolean, message = '加载中...') => {
    setIsLoading(loading)
    setLoadingMessage(message)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                textAlign: 'center',
                minWidth: '200px'
              }}
            >
              <Spin size="large" />
              <div style={{
                marginTop: '16px',
                fontSize: '16px',
                color: '#666',
                fontWeight: 500
              }}>
                {loadingMessage}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  )
}

export default LoadingProvider