import React from 'react'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

interface CardProps {
  children: React.ReactNode
  title?: string
  extra?: React.ReactNode
  hoverable?: boolean
  loading?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  extra,
  hoverable = false,
  loading = false,
  className = '',
  style,
  onClick
}) => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hoverable ? {
      y: -4,
      boxShadow: designSystem.shadows.lg
    } : {}
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`smart-card ${className}`}
      style={{
        background: designSystem.colors.background.primary,
        borderRadius: designSystem.borderRadius.md,
        boxShadow: designSystem.shadows.base,
        padding: designSystem.spacing[6],
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onClick={onClick}
    >
      {(title || extra) && (
        <div className="smart-card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: designSystem.spacing[4],
          paddingBottom: designSystem.spacing[4],
          borderBottom: `1px solid ${designSystem.colors.border.light}`
        }}>
          {title && (
            <h3 className="smart-card-title" style={{
              fontSize: designSystem.typography.fontSize.lg,
              fontWeight: designSystem.typography.fontWeight.semibold,
              color: designSystem.colors.text.primary,
              margin: 0
            }}>
              {title}
            </h3>
          )}
          {extra && (
            <div className="smart-card-extra" style={{
              color: designSystem.colors.text.tertiary,
              fontSize: designSystem.typography.fontSize.sm
            }}>
              {extra}
            </div>
          )}
        </div>
      )}
      
      <div className="smart-card-body" style={{
        color: designSystem.colors.text.secondary,
        lineHeight: designSystem.typography.lineHeight.normal
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: designSystem.spacing[8]
          }}>
            <div className="smart-spinner" />
            <span style={{ marginLeft: designSystem.spacing[2] }}>加载中...</span>
          </div>
        ) : children}
      </div>
    </motion.div>
  )
}

export default Card