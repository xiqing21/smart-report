import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  EditOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '报告管理',
    },
    {
      key: '/editor',
      icon: <EditOutlined />,
      label: '报告编辑器',
    },
    {
      key: '/templates',
      icon: <AppstoreOutlined />,
      label: '模板中心',
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined />,
      label: 'AI分析中心',
    },
  ]

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        navigate('/login')
      },
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={64}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Logo区域 */}
        <motion.div
          className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-blue-700"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {collapsed ? (
            <div className="text-white text-xl font-bold">智</div>
          ) : (
            <div className="text-white text-lg font-bold">智能报告系统</div>
          )}
        </motion.div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
          }}
        />
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-center justify-between h-full">
            {/* 左侧：折叠按钮 */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />

            {/* 右侧：通知和用户信息 */}
            <div className="flex items-center space-x-4">
              {/* 通知铃铛 */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{
                      fontSize: '16px',
                      width: 40,
                      height: 40,
                    }}
                  />
                </Badge>
              </motion.div>

              {/* 用户头像和下拉菜单 */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <motion.div
                  className="flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      管理员
                    </span>
                    <span className="text-xs text-gray-500">admin@example.com</span>
                  </div>
                </motion.div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* 主内容区域 */}
        <Content
          style={
            {
              margin: '24px',
              padding: '24px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              minHeight: 'calc(100vh - 112px)',
            }
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout