import { RouterProvider } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import { router } from './router'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingProvider from './components/LoadingProvider'
import NotificationProvider from './components/NotificationProvider'
import './styles/variables.css'
import './styles/global.css'

function App() {
  return (
    <ErrorBoundary>
      <AntdApp>
        <NotificationProvider>
          <LoadingProvider>
            <RouterProvider router={router} />
          </LoadingProvider>
        </NotificationProvider>
      </AntdApp>
    </ErrorBoundary>
  )
}

export default App
