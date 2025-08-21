// 创建测试账号的脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestAccount() {
  try {
    console.log('正在创建测试账号...')
    
    // 创建测试用户
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: 'test@demo.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: '测试用户'
      }
    })

    if (signUpError) {
      console.error('创建用户失败:', signUpError.message)
      return
    }

    console.log('✅ 测试账号创建成功!')
    console.log('📧 邮箱: test@demo.com')
    console.log('🔑 密码: 123456')
    console.log('👤 用户ID:', user.user.id)

    // 创建用户档案
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.user.id,
        full_name: '测试用户',
        bio: '这是一个演示账号',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.warn('创建用户档案失败:', profileError.message)
    } else {
      console.log('✅ 用户档案创建成功!')
    }

  } catch (error) {
    console.error('创建测试账号时出错:', error.message)
  }
}

// 创建管理员账号
async function createAdminAccount() {
  try {
    console.log('正在创建管理员账号...')
    
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: 'admin@demo.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: '系统管理员',
        role: 'admin'
      }
    })

    if (signUpError) {
      console.error('创建管理员失败:', signUpError.message)
      return
    }

    console.log('✅ 管理员账号创建成功!')
    console.log('📧 邮箱: admin@demo.com')
    console.log('🔑 密码: admin123')
    console.log('👤 用户ID:', user.user.id)

    // 创建管理员档案
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.user.id,
        full_name: '系统管理员',
        bio: '系统管理员账号',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.warn('创建管理员档案失败:', profileError.message)
    } else {
      console.log('✅ 管理员档案创建成功!')
    }

  } catch (error) {
    console.error('创建管理员账号时出错:', error.message)
  }
}

async function main() {
  console.log('🚀 开始创建演示账号...\n')
  
  await createTestAccount()
  console.log('\n' + '='.repeat(50) + '\n')
  await createAdminAccount()
  
  console.log('\n🎉 所有演示账号创建完成!')
  console.log('\n📝 演示账号信息:')
  console.log('普通用户: test@demo.com / 123456')
  console.log('管理员: admin@demo.com / admin123')
  console.log('\n🌐 访问地址: http://localhost:5173')
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error('脚本执行失败:', err)
    process.exit(1)
  })
}