import React from 'react'
import { motion } from 'framer-motion'
import { InboxOutlined } from '@ant-design/icons'
import { designSystem } from '@/styles/design-system'
import Button from './Button'

interface EmptyProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const Empty: React.FC<EmptyProps> = ({
  icon,
  title = '暂无数据',
  description,
  action,
  className = '',
  style
}) => {
  const emptyVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 0.6,
      transition: { delay: 0.2, duration: 0.5 }
    }
  }

  return (
    <motion.div
      variants={emptyVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4 }}
      className={`smart-empty ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${designSystem.spacing[12]} ${designSystem.spacing[6]}`,
        textAlign: 'center',
        color: designSystem.colors.text.tertiary,
        ...style
      }}
    >
      <motion.div
        variants={iconVariants}
        className="smart-empty-icon"
        style={{
          fontSize: '48px',
          marginBottom: designSystem.spacing[4],
          opacity: 0.6
        }}
      >
        {icon || <InboxOutlined />}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="smart-empty-title"
        style={{
          fontSize: designSystem.typography.fontSize.base,
          fontWeight: designSystem.typography.fontWeight.medium,
          margin: `0 0 ${designSystem.spacing[2]} 0`,
          color: designSystem.colors.text.secondary
        }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="smart-empty-description"
          style={{
            fontSize: designSystem.typography.fontSize.sm,
            lineHeight: designSystem.typography.lineHeight.relaxed,
            margin: `0 0 ${designSystem.spacing[6]} 0`,
            color: designSystem.colors.text.tertiary,
            maxWidth: '400px'
          }}
        >
          {description}
        </motion.p>
      )}
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

export default Empty