import React from 'react'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

type StatusType = 'success' | 'warning' | 'error' | 'processing' | 'default'

interface StatusProps {
  type: StatusType
  text?: string
  showDot?: boolean
  className?: string
  style?: React.CSSProperties
}

const Status: React.FC<StatusProps> = ({
  type,
  text,
  showDot = true,
  className = '',
  style
}) => {
  const getStatusConfig = (type: StatusType) => {
    switch (type) {
      case 'success':
        return {
          color: designSystem.colors.success,
          text: text || '成功'
        }
      case 'warning':
        return {
          color: designSystem.colors.warning,
          text: text || '警告'
        }
      case 'error':
        return {
          color: designSystem.colors.error,
          text: text || '错误'
        }
      case 'processing':
        return {
          color: designSystem.colors.info,
          text: text || '处理中'
        }
      default:
        return {
          color: designSystem.colors.text.tertiary,
          text: text || '默认'
        }
    }
  }

  const config = getStatusConfig(type)

  const dotVariants = {
    processing: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1]
    }
  }

  return (
    <div
      className={`smart-status smart-status-${type} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showDot ? designSystem.spacing[2] : 0,
        fontSize: designSystem.typography.fontSize.sm,
        color: config.color,
        ...style
      }}
    >
      {showDot && (
        <motion.div
          className="smart-status-dot"
          variants={dotVariants}
          animate={type === 'processing' ? 'processing' : undefined}
          transition={{
            duration: 1.5,
            repeat: type === 'processing' ? Infinity : 0,
            ease: 'easeInOut'
          }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: config.color,
            flexShrink: 0
          }}
        />
      )}
      <span>{config.text}</span>
    </div>
  )
}

export default Status