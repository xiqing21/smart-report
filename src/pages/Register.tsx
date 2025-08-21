import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, User, Github } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

// 注册表单验证模式
const registerSchema = z.object({
  fullName: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string().min(6, '确认密码至少6个字符'),
  terms: z.boolean().refine(val => val === true, '请同意服务条款和隐私政策')
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const { signUp, signInWithProvider } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      const { error } = await signUp({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName
      })
      
      if (error) {
        toast.error(error.message || '注册失败，请重试')
        return
      }
      
      toast.success('注册成功！请检查邮箱验证链接')
      navigate('/login')
    } catch (error: any) {
      toast.error('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await signInWithProvider('google')
    } catch (error: any) {
      toast.error(error.message || 'Google注册失败')
    }
  }

  const handleGithubRegister = async () => {
    try {
      await signInWithProvider('github')
    } catch (error: any) {
      toast.error(error.message || 'GitHub注册失败')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌展示区域 */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden"
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
              <h1 className="text-4xl font-bold mb-2">加入智能报告生成系统</h1>
              <p className="text-xl text-green-100">开启您的智能办公之旅</p>
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
                  <span className="text-xl">🚀</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">快速上手</h3>
                  <p className="text-green-100 text-sm">简单注册，即刻体验AI智能报告生成</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🔒</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">安全可靠</h3>
                  <p className="text-green-100 text-sm">企业级安全保障，数据隐私无忧</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">💡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">智能高效</h3>
                  <p className="text-green-100 text-sm">AI驱动的智能分析，提升工作效率</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 右侧注册表单区域 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* 移动端Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl font-bold text-white">智</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">智能报告生成系统</h1>
          </div>

          {/* 注册表单卡片 */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">创建账户</h2>
              <p className="text-gray-600">填写信息以创建您的账户</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 姓名输入 */}
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="姓名"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* 邮箱输入 */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="邮箱地址"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* 密码输入 */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="密码"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* 确认密码输入 */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="确认密码"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* 服务条款 */}
              <div>
                <label className="flex items-start">
                  <input
                    {...register('terms')}
                    type="checkbox"
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    我同意
                    <Link to="/terms" className="text-green-600 hover:text-green-700 mx-1">服务条款</Link>
                    和
                    <Link to="/privacy" className="text-green-600 hover:text-green-700 mx-1">隐私政策</Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
                )}
              </div>

              {/* 注册按钮 */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '注册中...' : '创建账户'}
              </motion.button>

              {/* 分割线 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或者使用</span>
                </div>
              </div>

              {/* 第三方注册 */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={handleGoogleRegister}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleGithubRegister}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </motion.button>
              </div>
            </form>

            {/* 登录链接 */}
            <div className="text-center mt-6">
              <span className="text-gray-600">已有账户？</span>
              <Link
                to="/login"
                className="ml-1 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                立即登录
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

export default Register