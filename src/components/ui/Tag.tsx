import React from 'react'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

type TagColor = 'primary' | 'success' | 'warning' | 'error' | 'default'
type TagSize = 'sm' | 'md'

interface TagProps {
  children: React.ReactNode
  color?: TagColor
  size?: TagSize
  closable?: boolean
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClose?: () => void
}

const Tag: React.FC<TagProps> = ({
  children,
  color = 'default',
  size = 'md',
  closable = false,
  icon,
  className = '',
  style,
  onClose
}) => {
  const getColorStyles = (color: TagColor) => {
    switch (color) {
      case 'primary':
        return {
          backgroundColor: designSystem.colors.primary[50],
          color: designSystem.colors.primary[600],
          borderColor: designSystem.colors.primary[200]
        }
      case 'success':
        return {
          backgroundColor: '#f6ffed',
          color: designSystem.colors.success,
          borderColor: '#b7eb8f'
        }
      case 'warning':
        return {
          backgroundColor: '#fffbe6',
          color: designSystem.colors.warning,
          borderColor: '#ffe58f'
        }
      case 'error':
        return {
          backgroundColor: '#fff2f0',
          color: designSystem.colors.error,
          borderColor: '#ffccc7'
        }
      default:
        return {
          backgroundColor: designSystem.colors.gray[100],
          color: designSystem.colors.text.secondary,
          borderColor: designSystem.colors.border.light
        }
    }
  }

  const getSizeStyles = (size: TagSize) => {
    switch (size) {
      case 'sm':
        return {
          padding: `${designSystem.spacing[1]} ${designSystem.spacing[2]}`,
          fontSize: designSystem.typography.fontSize.xs,
          borderRadius: designSystem.borderRadius.sm
        }
      default: // md
        return {
          padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
          fontSize: designSystem.typography.fontSize.sm,
          borderRadius: designSystem.borderRadius.base
        }
    }
  }

  const tagVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }

  return (
    <motion.span
      variants={tagVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className={`smart-tag smart-tag-${color} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: designSystem.typography.fontFamily.primary,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.tight,
        border: '1px solid',
        gap: icon || closable ? designSystem.spacing[1] : 0,
        ...getColorStyles(color),
        ...getSizeStyles(size),
        ...style
      }}
    >
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {closable && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'currentColor',
            opacity: 0.7,
            fontSize: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7'
          }}
        >
          ×
        </motion.button>
      )}
    </motion.span>
  )
}

export default Tag