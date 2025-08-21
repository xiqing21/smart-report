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
// 从 @/hooks/useAuth 导入 useAuth hook
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

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

  // 处理用户菜单点击
  const handleUserMenuClick = async ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        // TODO: 实现系统设置页面
        toast.info('系统设置功能即将上线')
        break
      case 'logout':
        try {
          await signOut()
          navigate('/login')
        } catch (error: any) {
          toast.error(error.message || '退出登录失败')
        }
        break
    }
  }

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
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '64px',
            background: 'linear-gradient(to right, #1890ff, #096dd9)',
            color: 'white'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {collapsed ? (
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>智</div>
          ) : (
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>智能报告系统</div>
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
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 101 }}>
              {/* 通知铃铛 */}
              <Dropdown
                open={notificationVisible}
                onOpenChange={setNotificationVisible}
                placement="bottomRight"
                arrow
                overlayStyle={{ zIndex: 1050 }}
                popupRender={() => (
                  <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '12px',
                    minWidth: '300px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>通知消息</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ padding: '8px', borderRadius: '4px', background: '#f6f8fa', cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>新报告已生成</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>您的"销售数据分析"报告已完成生成</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>2分钟前</div>
                      </div>
                      <div style={{ padding: '8px', borderRadius: '4px', background: '#f6f8fa', cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>系统更新</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>智能报告系统已更新到v2.1版本</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>1小时前</div>
                      </div>
                      <div style={{ padding: '8px', borderRadius: '4px', background: '#f6f8fa', cursor: 'pointer' }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>团队邀请</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>张三邀请您加入"市场分析"项目</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>3小时前</div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px', textAlign: 'center' }}>
                      <Button type="link" size="small" style={{ fontSize: '12px' }}>查看全部通知</Button>
                    </div>
                  </div>
                )}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Badge count={3} size="small">
                    <Button
                      type="text"
                      icon={<BellOutlined />}
                      onClick={() => setNotificationVisible(!notificationVisible)}
                      style={{
                        fontSize: '16px',
                        width: 40,
                        height: 40,
                      }}
                    />
                  </Badge>
                </motion.div>
              </Dropdown>

              {/* 用户头像和下拉菜单 */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                placement="bottomRight"
                arrow
                overlayStyle={{ zIndex: 1050 }}
              >
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    zIndex: 102
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Avatar
                    size={28}
                    style={{ backgroundColor: '#1890ff' }}
                  >
                    {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#262626', marginBottom: '1px' }}>
                      {user?.profile?.full_name || '用户'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#8c8c8c' }}>{user?.email}</span>
                  </div>
                </motion.div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* 主内容区域 */}
        <Content
          style={{
            margin: '16px 24px 24px 24px',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            minHeight: 'calc(100vh - 128px)',
            position: 'relative',
            zIndex: 1,
            overflow: 'auto'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <Outlet />
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout