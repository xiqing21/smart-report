import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface LoginForm {
  username: string
  password: string
  remember: boolean
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleLogin = async (_values: LoginForm) => {
    setLoading(true)
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('登录成功！')
      navigate('/dashboard')
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌展示区域 */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* 品牌内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                <span className="text-3xl font-bold">智</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">智能报告生成系统</h1>
              <p className="text-xl text-blue-100">AI-Powered Report Generation</p>
            </div>

            {/* 特性介绍 */}
            <div className="space-y-6 max-w-md">
              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">AI智能分析</h3>
                  <p className="text-blue-100 text-sm">基于人工智能的数据分析和报告生成</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">📊</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">可视化图表</h3>
                  <p className="text-blue-100 text-sm">丰富的图表类型，直观展示数据洞察</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">高效协作</h3>
                  <p className="text-blue-100 text-sm">团队协作编辑，实时同步更新</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 右侧登录表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 移动端Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-white">智</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">智能报告生成系统</h1>
          </div>

          {/* 登录表单卡片 */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h2>
              <p className="text-gray-600">请登录您的账户以继续使用</p>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="用户名"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                  className="rounded-lg"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <div className="flex items-center justify-between">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住我</Checkbox>
                  </Form.Item>
                  <Button type="link" className="p-0 text-blue-600 hover:text-blue-700">
                    忘记密码？
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-12 text-lg font-medium rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 border-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>

            {/* 注册链接 */}
            <div className="text-center mt-6">
              <span className="text-gray-600">还没有账户？</span>
              <Button type="link" className="p-0 ml-1 text-blue-600 hover:text-blue-700">
                立即注册
              </Button>
            </div>
          </motion.div>

          {/* 底部信息 */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 智能报告生成系统. 保留所有权利.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login