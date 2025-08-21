import React, { useState } from 'react'

import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  remember: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { signIn, signInWithProvider } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const { error } = await signIn({
        email: data.email,
        password: data.password,
        remember: data.remember
      })
      
      if (error) {
        toast.error(error.message || '登录失败，请检查邮箱和密码')
        return
      }
      
      toast.success('登录成功！')
      navigate('/dashboard')
    } catch (error) {
      toast.error('登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithProvider('google')
    } catch (error: any) {
      toast.error(error.message || 'Google登录失败')
    }
  }

  const handleGithubLogin = async () => {
    try {
      await signInWithProvider('github')
    } catch (error: any) {
      toast.error(error.message || 'GitHub登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 p-6">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row bg-white dark:bg-gray-800/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        {/* 左侧品牌展示区域 */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-between text-white relative"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background shapes */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />
          
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">智</span>
              </div>
              <h1 className="text-3xl font-bold">智能报告系统</h1>
            </motion.div>
            <motion.p 
              className="text-lg text-blue-100 max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              AI 驱动的智能分析，将数据转化为富有洞察力的报告。
            </motion.p>
          </div>
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm border border-white/30">
              <p className="text-sm italic">"这个工具让我们的报告撰写效率提升了50%，数据可视化效果非常出色！"</p>
              <p className="text-right font-semibold mt-4">- 某满意客户</p>
            </div>
          </motion.div>
        </motion.div>

        {/* 右侧登录表单区域 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">欢迎回来</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">请登录您的账户</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 邮箱输入 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">邮箱地址</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
                )}
              </motion.div>

              {/* 密码输入 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                )}
              </motion.div>

              {/* 记住我和忘记密码 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    {...register('remember')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  记住我
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  忘记密码？
                </Link>
              </div>

              {/* 登录按钮 */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </motion.button>

              {/* 分割线 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">或者使用</span>
                </div>
              </div>

              {/* 第三方登录 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                  aria-label="使用 Google 登录"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="20" height="20" preserveAspectRatio="xMidYMid meet">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Google</span>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleGithubLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-black transition-all duration-200"
                  aria-label="使用 GitHub 登录"
                >
                  <Github className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">GitHub</span>
                </motion.button>
              </div>
            </form>

            {/* 注册链接 */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                还没有账户？{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  立即注册
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login