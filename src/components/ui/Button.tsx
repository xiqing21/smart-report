import React from 'react'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonType = 'button' | 'submit' | 'reset'

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  className = '',
  style,
  onClick
}) => {
  const getVariantStyles = (variant: ButtonVariant) => {
    const baseStyles = {
      border: '1px solid transparent',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: designSystem.colors.primary[500],
          color: designSystem.colors.text.inverse,
          borderColor: designSystem.colors.primary[500]
        }
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: designSystem.colors.background.primary,
          color: designSystem.colors.primary[500],
          borderColor: designSystem.colors.border.default
        }
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: designSystem.colors.primary[500],
          borderColor: designSystem.colors.primary[500]
        }
      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: designSystem.colors.primary[500],
          border: 'none'
        }
      default:
        return baseStyles
    }
  }

  const getSizeStyles = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return {
          padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
          fontSize: designSystem.typography.fontSize.xs,
          borderRadius: designSystem.borderRadius.sm
        }
      case 'lg':
        return {
          padding: `${designSystem.spacing[3]} ${designSystem.spacing[6]}`,
          fontSize: designSystem.typography.fontSize.base,
          borderRadius: designSystem.borderRadius.md
        }
      default: // md
        return {
          padding: `${designSystem.spacing[2]} ${designSystem.spacing[4]}`,
          fontSize: designSystem.typography.fontSize.sm,
          borderRadius: designSystem.borderRadius.base
        }
    }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: disabled || loading ? 1 : 1.02 },
    tap: { scale: disabled || loading ? 1 : 0.98 }
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    onClick?.(event)
  }

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.15 }}
      type={type}
      disabled={disabled || loading}
      className={`smart-button smart-button-${variant} smart-button-${size} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: designSystem.typography.fontFamily.primary,
        fontWeight: designSystem.typography.fontWeight.medium,
        lineHeight: designSystem.typography.lineHeight.tight,
        textDecoration: 'none',
        userSelect: 'none',
        gap: icon ? designSystem.spacing[2] : 0,
        ...getVariantStyles(variant),
        ...getSizeStyles(size),
        ...style
      }}
      onClick={handleClick}
    >
      {loading && (
        <div className="smart-spinner" style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'smart-spin 1s linear infinite'
        }} />
      )}
      {!loading && icon && icon}
      {children}
    </motion.button>
  )
}

export default Button