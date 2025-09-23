/**
 * 错误处理工具函数
 */

export interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showLoading?: (message: string) => void
  hideLoading?: () => void
  showSuccess?: (message: string) => void
  showError?: (message: string) => void
}

/**
 * 包装异步操作，提供统一的加载状态和错误处理
 */
export const withAsyncHandler = async <T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<T | null> => {
  const {
    loadingMessage = '处理中...',
    successMessage,
    errorMessage = '操作失败，请重试',
    showLoading,
    hideLoading,
    showSuccess,
    showError
  } = options

  try {
    if (showLoading && loadingMessage) {
      showLoading(loadingMessage)
    }

    const result = await operation()

    if (showSuccess && successMessage) {
      showSuccess(successMessage)
    }

    return result
  } catch (error) {
    console.error('异步操作失败:', error)
    
    if (showError) {
      const message = error instanceof Error ? error.message : errorMessage
      showError(message)
    }

    return null
  } finally {
    if (hideLoading) {
      hideLoading()
    }
  }
}

/**
 * 重试机制
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}

/**
 * 防抖异步操作
 */
export const debounceAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId)
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

/**
 * 验证表单数据
 */
export const validateFormData = (data: Record<string, any>, rules: Record<string, (value: any) => string | null>): string[] => {
  const errors: string[] = []
  
  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field])
    if (error) {
      errors.push(error)
    }
  })
  
  return errors
}

/**
 * 常用验证规则
 */
export const validationRules = {
  required: (fieldName: string) => (value: any) => 
    !value || (typeof value === 'string' && value.trim() === '') 
      ? `${fieldName}不能为空` 
      : null,
      
  minLength: (fieldName: string, min: number) => (value: string) => 
    !value || value.length < min 
      ? `${fieldName}至少需要${min}个字符` 
      : null,
      
  maxLength: (fieldName: string, max: number) => (value: string) => 
    value && value.length > max 
      ? `${fieldName}不能超过${max}个字符` 
      : null,
      
  email: (value: string) => 
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
      ? '请输入有效的邮箱地址' 
      : null
}