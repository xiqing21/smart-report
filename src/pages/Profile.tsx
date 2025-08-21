import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Save, Camera, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

// 个人资料表单验证模式
const profileSchema = z.object({
  fullName: z.string().min(1, '请输入姓名'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional()
})

// 密码更新表单验证模式
const passwordSchema = z.object({
  currentPassword: z.string().min(6, '当前密码至少6个字符'),
  newPassword: z.string().min(6, '新密码至少6个字符'),
  confirmPassword: z.string().min(6, '确认密码至少6个字符')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const { user, updateProfile, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
      phone: '',
      website: '',
      location: ''
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // 加载用户数据
  useEffect(() => {
    if (user?.profile) {
      profileForm.reset({
        fullName: user.profile.full_name || '',
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
        website: user.profile.website || '',
        location: user.profile.location || ''
      })
    }
  }, [user?.profile, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      await updateProfile({
        full_name: data.fullName,
        bio: data.bio,
        phone: data.phone,
        website: data.website,
        location: data.location
      })
      toast.success('个人资料更新成功！')
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true)
    try {
      const { error } = await updatePassword({
        password: data.newPassword,
        confirmPassword: data.confirmPassword
      })
      
      if (error) {
        toast.error(error.message || '密码更新失败')
        return
      }
      toast.success('密码更新成功！')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.message || '密码更新失败，请重试')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || '退出登录失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
          <p className="mt-2 text-gray-600">管理您的账户信息和偏好设置</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* 用户头像和基本信息 */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900">
                  {user?.profile?.full_name || '未设置姓名'}
                </h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                {user?.created_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    加入于 {formatDate(user.created_at)}
                  </p>
                )}
              </div>

              {/* 导航菜单 */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4 mr-3" />
                  个人信息
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Lock className="w-4 h-4 mr-3" />
                  密码安全
                </button>
              </nav>

              {/* 退出登录按钮 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  退出登录
                </button>
              </div>
            </motion.div>
          </div>

          {/* 主内容区域 */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-white rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {activeTab === 'profile' ? (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">个人信息</h2>
                    <p className="text-gray-600">更新您的个人资料信息</p>
                  </div>

                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 姓名 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          姓名 *
                        </label>
                        <input
                          {...profileForm.register('fullName')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        {profileForm.formState.errors.fullName && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      {/* 邮箱 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          邮箱地址
                        </label>
                        <input
                          value={user?.email || ''}
                          type="email"
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">邮箱地址无法修改</p>
                      </div>

                      {/* 电话 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          电话号码
                        </label>
                        <input
                          {...profileForm.register('phone')}
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      {/* 网站 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          网站
                        </label>
                        <input
                          {...profileForm.register('website')}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      {/* 位置 */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          位置
                        </label>
                        <input
                          {...profileForm.register('location')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* 个人简介 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        个人简介
                      </label>
                      <textarea
                        {...profileForm.register('bio')}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="简单介绍一下自己..."
                      />
                      {profileForm.formState.errors.bio && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.formState.errors.bio.message}
                        </p>
                      )}
                    </div>

                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? '保存中...' : '保存更改'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">密码安全</h2>
                    <p className="text-gray-600">更新您的登录密码</p>
                  </div>

                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    {/* 当前密码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        当前密码 *
                      </label>
                      <input
                        {...passwordForm.register('currentPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    {/* 新密码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        新密码 *
                      </label>
                      <input
                        {...passwordForm.register('newPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    {/* 确认新密码 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        确认新密码 *
                      </label>
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* 密码要求提示 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">密码要求：</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 至少6个字符</li>
                        <li>• 建议包含大小写字母、数字和特殊字符</li>
                        <li>• 避免使用常见密码</li>
                      </ul>
                    </div>

                    {/* 更新密码按钮 */}
                    <div className="flex justify-end">
                      <motion.button
                        type="submit"
                        disabled={passwordLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {passwordLoading ? '更新中...' : '更新密码'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile