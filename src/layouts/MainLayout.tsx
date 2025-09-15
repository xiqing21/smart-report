import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Divider, Drawer } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  EditOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  NodeIndexOutlined,
  RobotOutlined,
  LineChartOutlined,
  FundProjectionScreenOutlined,
  DatabaseOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Button, Card } from '@/components/ui'
import { designSystem } from '@/styles/design-system'
import '@/styles/responsive.css'

const { Text } = Typography

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()

  // 响应式检测
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1200)
      
      // 移动端自动折叠侧边栏
      if (width < 768) {
        setCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 移动端菜单点击处理
  const handleMobileMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    setMobileDrawerVisible(false)
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileDrawerVisible(!mobileDrawerVisible)
    } else {
      setCollapsed(!collapsed)
    }
  }

  // 菜单项配置
  const menuItems = [
    {
      key: '/workspace',
      icon: <DashboardOutlined />,
      label: '工作台',
      description: '统一工作入口'
    },
    {
      key: '/data-center',
      icon: <DatabaseOutlined />,
      label: '数据中心',
      description: '数据源管理'
    },
    {
      key: '/intelligent-analysis',
      icon: <BarChartOutlined />,
      label: '智能分析',
      description: 'AI驱动分析'
    },
    {
      key: '/report-factory',
      icon: <FileTextOutlined />,
      label: '报告工厂',
      description: '报告创建与管理'
    },
    {
      type: 'divider'
    },
    {
      key: 'legacy',
      icon: <AppstoreOutlined />,
      label: '传统功能',
      children: [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: '原工作台'
        },
        {
          key: '/reports',
          icon: <FileTextOutlined />,
          label: '报告管理'
        },
        {
          key: '/editor',
          icon: <EditOutlined />,
          label: '报告编辑器'
        },
        {
          key: '/templates',
          icon: <AppstoreOutlined />,
          label: '模板中心'
        },
        {
          key: '/analysis',
          icon: <BarChartOutlined />,
          label: 'AI分析中心'
        },
        {
          key: '/knowledge-base',
          icon: <DatabaseOutlined />,
          label: '知识库'
        },
        {
          key: '/export',
          icon: <DownloadOutlined />,
          label: '导出与模板'
        }
      ]
    },
    {
      key: 'advanced',
      icon: <ExperimentOutlined />,
      label: '高级功能',
      children: [
        {
          key: '/data-pipeline',
          icon: <NodeIndexOutlined />,
          label: '数据处理监控'
        },
        {
          key: '/data-butler',
          icon: <RobotOutlined />,
          label: 'AI数据管家'
        },
        {
          key: '/chart-generation',
          icon: <LineChartOutlined />,
          label: '对话式图表生成'
        },
        {
          key: '/trend-prediction',
          icon: <FundProjectionScreenOutlined />,
          label: '趋势预测分析'
        },
        {
          key: '/test-runner',
          icon: <ExperimentOutlined />,
          label: '🧪 功能测试'
        }
      ]
    }
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



  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          background: designSystem.colors.background.primary,
          boxShadow: designSystem.shadows.lg,
          borderRight: `1px solid ${designSystem.colors.border.light}`,
        }}
      >
        {/* Logo区域 */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            height: '72px',
            padding: collapsed ? '0' : `0 ${designSystem.spacing.lg}`,
            background: `linear-gradient(135deg, ${designSystem.colors.primary} 0%, ${designSystem.colors.secondary} 100%)`,
            color: 'white',
            cursor: 'pointer',
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
          }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          onClick={() => navigate('/workspace')}
        >
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{ 
                  fontSize: '24px', 
                  fontWeight: designSystem.typography.fontWeight.bold,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: designSystem.borderRadius.md,
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                智
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}
              >
                <div style={{
                  fontSize: '28px',
                  fontWeight: designSystem.typography.fontWeight.bold,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: designSystem.borderRadius.md,
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  智
                </div>
                <div>
                  <div style={{ 
                    fontSize: designSystem.typography.fontSize.lg, 
                    fontWeight: designSystem.typography.fontWeight.bold,
                    lineHeight: 1.2
                  }}>
                    智能报告系统
                  </div>
                  <div style={{ 
                    fontSize: designSystem.typography.fontSize.xs,
                    opacity: 0.8,
                    lineHeight: 1
                  }}>
                    Smart Report Platform
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 导航菜单 */}
        <div style={{ padding: `${designSystem.spacing.md} 0` }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: designSystem.typography.fontSize.sm,
            }}
            theme="light"
            inlineIndent={collapsed ? 0 : 24}
          />
        </div>
      </Sider>

      <Layout>
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: `0 ${designSystem.spacing.xl}`,
            background: designSystem.colors.background.primary,
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            boxShadow: designSystem.shadows.sm,
            height: '72px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            {/* 左侧：折叠按钮和欢迎信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.lg }}>
              <Button
                variant="ghost"
                size="md"
                onClick={toggleSidebar}
                style={{
                  color: designSystem.colors.text.secondary,
                  fontSize: '18px',
                  padding: designSystem.spacing.sm,
                  borderRadius: designSystem.borderRadius.md,
                }}
              >
                {isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
              </Button>
              
              <Divider type="vertical" style={{ height: '24px', margin: 0 }} />
              
              <Space>
                {!isMobile && (
                  <>
                    <Text style={{ 
                      color: designSystem.colors.text.secondary,
                      fontSize: designSystem.typography.fontSize.sm 
                    }}>
                      欢迎回来，
                    </Text>
                    <Text strong style={{ 
                      color: designSystem.colors.text.primary,
                      fontSize: designSystem.typography.fontSize.sm 
                    }}>
                      {user?.profile?.full_name || '用户'}
                    </Text>
                  </>
                )}
              </Space>
            </div>

            {/* 右侧：通知和用户信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.md, position: 'relative', zIndex: 101 }}>
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge count={3} size="small" color={designSystem.colors.primary}>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setNotificationVisible(!notificationVisible)}
                      style={{
                        color: designSystem.colors.text.secondary,
                        fontSize: '16px',
                        padding: designSystem.spacing.sm,
                        borderRadius: designSystem.borderRadius.md,
                      }}
                    >
                      <BellOutlined />
                    </Button>
                  </Badge>
                </motion.div>
              </Dropdown>

              <Divider type="vertical" style={{ height: '24px', margin: 0 }} />

              {/* 用户头像和下拉菜单 */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                placement="bottomRight"
                arrow
                overlayStyle={{ zIndex: 1050 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: designSystem.spacing.sm,
                    cursor: 'pointer',
                    padding: designSystem.spacing.sm,
                    borderRadius: designSystem.borderRadius.md,
                    transition: 'all 0.2s ease',
                    border: `1px solid transparent`,
                    position: 'relative',
                    zIndex: 102
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = designSystem.colors.background.secondary
                    e.currentTarget.style.borderColor = designSystem.colors.border.light
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }}
                >
                  <Avatar
                    size={36}
                    style={{ 
                      backgroundColor: designSystem.colors.primary,
                      border: `2px solid ${designSystem.colors.background.primary}`,
                    }}
                  >
                    {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text strong style={{ 
                      fontSize: designSystem.typography.fontSize.sm,
                      color: designSystem.colors.text.primary,
                      lineHeight: 1.2
                    }}>
                      {user?.profile?.full_name || '用户'}
                    </Text>
                    <Text style={{ 
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary,
                      lineHeight: 1
                    }}>
                      系统管理员
                    </Text>
                  </div>
                </motion.div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* 主内容区域 */}
        <Content
          style={{
            margin: designSystem.spacing.xl,
            padding: 0,
            minHeight: 'calc(100vh - 144px)',
            background: designSystem.colors.background.secondary,
            borderRadius: designSystem.borderRadius.lg,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ 
              height: '100%',
              background: designSystem.colors.background.primary,
              borderRadius: designSystem.borderRadius.lg,
              boxShadow: designSystem.shadows.md,
              overflow: 'auto'
            }}
          >
            <div style={{ 
              padding: designSystem.spacing.xl,
              minHeight: '100%'
            }}>
              <Outlet />
            </div>
          </motion.div>
        </Content>
        </Layout>
      
      {/* 移动端抽屉菜单 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: `linear-gradient(135deg, ${designSystem.colors.primary}, ${designSystem.colors.secondary})`,
              borderRadius: designSystem.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              智
            </div>
            <Text strong style={{ color: designSystem.colors.text.primary }}>
              智能报告系统
            </Text>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { 
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            padding: designSystem.spacing.md
          }
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMobileMenuClick}
          items={menuItems}
          style={{
            border: 'none',
            height: '100%'
          }}
        />
      </Drawer>
    </Layout>
  )
}

export default MainLayout