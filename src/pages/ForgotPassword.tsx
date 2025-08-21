import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

// 密码重置表单验证模式
const forgotPasswordSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    try {
      await resetPassword({ email: data.email })
      setEmailSent(true)
      toast.success('密码重置邮件已发送！')
    } catch (error: any) {
      toast.error(error.message || '发送重置邮件失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    const email = getValues('email')
    if (!email) {
      toast.error('请先输入邮箱地址')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await resetPassword({ email })
      
      if (error) {
        toast.error(error.message || '发送重置邮件失败，请重试')
        return
      }
      toast.success('重置邮件已重新发送！')
    } catch (error: any) {
      toast.error(error.message || '重新发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌展示区域 */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden"
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
              <h1 className="text-4xl font-bold mb-2">找回您的账户</h1>
              <p className="text-xl text-purple-100">重新获得系统访问权限</p>
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
                  <span className="text-xl">🔐</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">安全重置</h3>
                  <p className="text-purple-100 text-sm">通过邮箱验证安全重置密码</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">快速恢复</h3>
                  <p className="text-purple-100 text-sm">几分钟内即可重新访问您的账户</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🛡️</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">隐私保护</h3>
                  <p className="text-purple-100 text-sm">您的个人信息始终受到保护</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 右侧密码重置表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 移动端Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-white">智</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">智能报告生成系统</h1>
          </div>

          {/* 返回按钮 */}
          <motion.button
            onClick={() => navigate('/login')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
            whileHover={{ x: -2 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回登录
          </motion.button>

          {/* 密码重置表单卡片 */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {!emailSent ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">忘记密码？</h2>
                  <p className="text-gray-600">输入您的邮箱地址，我们将发送重置链接</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 邮箱输入 */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="邮箱地址"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* 发送重置邮件按钮 */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '发送中...' : '发送重置邮件'}
                  </motion.button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">邮件已发送</h2>
                  <p className="text-gray-600">
                    我们已向 <span className="font-medium text-gray-900">{getValues('email')}</span> 发送了密码重置链接
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">接下来的步骤：</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>检查您的邮箱收件箱</li>
                      <li>点击邮件中的重置链接</li>
                      <li>设置新密码</li>
                      <li>使用新密码登录</li>
                    </ol>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">没有收到邮件？</p>
                    <motion.button
                      onClick={handleResendEmail}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-purple-600 hover:text-purple-700 font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? '重新发送中...' : '重新发送邮件'}
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {/* 登录链接 */}
            <div className="text-center mt-6">
              <span className="text-gray-600">记起密码了？</span>
              <Link
                to="/login"
                className="ml-1 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                返回登录
              </Link>
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

export default ForgotPassword