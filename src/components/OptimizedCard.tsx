import React from 'react'
import { Card as AntCard, Space, Typography, Tag, Button } from 'antd'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'
import {
  EditOutlined,
  CopyOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  StarOutlined,
  FireOutlined,
  TagOutlined
} from '@ant-design/icons'

const { Text, Title } = Typography

interface ActionItem {
  label: string
  type?: 'primary' | 'ghost' | 'default'
  icon?: string | React.ReactNode
  danger?: boolean
  onClick: () => void
}

interface OptimizedCardProps {
  title: string
  description?: string
  status?: {
    type: 'success' | 'warning' | 'error' | 'info' | 'default'
    text: string
    icon?: React.ReactNode
  } | string
  tags?: string[]
  priority?: 'high' | 'medium' | 'low'
  category?: string
  actions?: (React.ReactNode | ActionItem)[]
  metadata?: {
    author?: string
    date?: string
    updateTime?: string
    views?: number
    shares?: number
  } | Array<{ label: string; value: string | number; icon?: string }>
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  hoverable?: boolean
  loading?: boolean
}

const OptimizedCard: React.FC<OptimizedCardProps> = ({
  title,
  description,
  status,
  tags = [],
  priority,
  actions = [],
  metadata,
  onClick,
  className,
  style,
  children,
  hoverable = true,
  loading = false
}) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return designSystem.colors.error
      case 'medium':
        return designSystem.colors.warning
      case 'low':
        return designSystem.colors.success
      default:
        return 'transparent'
    }
  }

  const getStatusColor = (type?: string) => {
    switch (type) {
      case 'success':
        return designSystem.colors.success
      case 'warning':
        return designSystem.colors.warning
      case 'error':
        return designSystem.colors.error
      case 'info':
        return designSystem.colors.info
      default:
        return designSystem.colors.text.secondary
    }
  }

  const getIconByName = (iconName?: string) => {
    switch (iconName) {
      case 'edit':
        return <EditOutlined />
      case 'copy':
        return <CopyOutlined />
      case 'share':
        return <ShareAltOutlined />
      case 'delete':
        return <DeleteOutlined />
      case 'plus':
        return <PlusOutlined />
      case 'eye':
        return <EyeOutlined />
      case 'star':
        return <StarOutlined />
      case 'fire':
        return <FireOutlined />
      case 'tag':
        return <TagOutlined />
      default:
        return null
    }
  }

  const renderAction = (action: React.ReactNode | ActionItem, index: number) => {
    if (React.isValidElement(action)) {
      return action
    }
    
    const actionItem = action as ActionItem
    const icon = typeof actionItem.icon === 'string' ? getIconByName(actionItem.icon) : actionItem.icon
    
    return (
      <Button
        key={index}
        type={actionItem.type || 'default'}
        size="small"
        icon={icon}
        danger={actionItem.danger}
        onClick={actionItem.onClick}
        style={{
          fontSize: designSystem.typography.fontSize.xs,
          borderRadius: designSystem.borderRadius.sm
        }}
      >
        {actionItem.label}
      </Button>
    )
  }

  const normalizeStatus = () => {
    if (typeof status === 'string') {
      return {
        type: status as 'success' | 'warning' | 'error' | 'info' | 'default',
        text: status
      }
    }
    return status
  }

  const normalizedStatus = normalizeStatus()

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${designSystem.colors.border.light}`,
    borderRadius: designSystem.borderRadius.lg,
    borderLeft: priority ? `4px solid ${getPriorityColor(priority)}` : undefined,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    height: '100%',
    ...style
  }

  const cardContent = (
    <AntCard
      loading={loading}
      className={className}
      style={cardStyle}
      bodyStyle={{
        padding: designSystem.spacing.lg,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick}
    >
      {/* 卡片头部 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: designSystem.spacing.md
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 标题和状态 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designSystem.spacing.sm,
            marginBottom: designSystem.spacing.xs
          }}>
            {normalizedStatus?.icon}
            <Title
              level={5}
              style={{
                margin: 0,
                color: designSystem.colors.text.primary,
                fontSize: designSystem.typography.fontSize.md,
                fontWeight: designSystem.typography.fontWeight.semibold,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={title}
            >
              {title}
            </Title>
          </div>

          {/* 状态和标签 */}
          <Space size="small" wrap>
            {normalizedStatus && (
              <Tag
                color={normalizedStatus.type}
                style={{
                  margin: 0,
                  fontSize: designSystem.typography.fontSize.xs,
                  borderRadius: designSystem.borderRadius.sm
                }}
              >
                {normalizedStatus.text}
              </Tag>
            )}
            {tags.slice(0, 2).map((tag, index) => (
              <Tag
                key={index}
                style={{
                  margin: 0,
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.text.secondary,
                  backgroundColor: designSystem.colors.background.secondary,
                  border: 'none',
                  borderRadius: designSystem.borderRadius.sm
                }}
              >
                {tag}
              </Tag>
            ))}
            {tags.length > 2 && (
              <Tag
                style={{
                  margin: 0,
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.text.secondary,
                  backgroundColor: designSystem.colors.background.secondary,
                  border: 'none',
                  borderRadius: designSystem.borderRadius.sm
                }}
              >
                +{tags.length - 2}
              </Tag>
            )}
          </Space>
        </div>
      </div>

      {/* 描述内容 */}
      {description && (
        <div style={{
          flex: 1,
          marginBottom: designSystem.spacing.md
        }}>
          <Text
            style={{
              color: designSystem.colors.text.secondary,
              fontSize: designSystem.typography.fontSize.sm,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {description}
          </Text>
        </div>
      )}

      {/* 自定义内容 */}
      {children && (
        <div style={{
          flex: 1,
          marginBottom: designSystem.spacing.md
        }}>
          {children}
        </div>
      )}

      {/* 元数据和操作 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto'
      }}>
        {/* 元数据 */}
        {metadata && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space size="small" wrap>
              {Array.isArray(metadata) ? (
                metadata.map((item, index) => (
                  <Text key={index} style={{
                    fontSize: designSystem.typography.fontSize.xs,
                    color: designSystem.colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {item.icon && getIconByName(item.icon)}
                    {item.label}: {item.value}
                  </Text>
                ))
              ) : (
                <>
                  {metadata.author && (
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      {metadata.author}
                    </Text>
                  )}
                  {(metadata.date || metadata.updateTime) && (
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      {metadata.date || metadata.updateTime}
                    </Text>
                  )}
                  {metadata.views !== undefined && (
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      {metadata.views} 浏览
                    </Text>
                  )}
                  {metadata.shares !== undefined && (
                    <Text style={{
                      fontSize: designSystem.typography.fontSize.xs,
                      color: designSystem.colors.text.secondary
                    }}>
                      {metadata.shares} 分享
                    </Text>
                  )}
                </>
              )}
            </Space>
          </div>
        )}

        {/* 操作按钮 */}
        {actions && actions.length > 0 && (
          <div style={{ marginLeft: designSystem.spacing.md }}>
            <Space size="small">
              {actions.slice(0, 3).map((action, index) => renderAction(action, index))}
            </Space>
          </div>
        )}
      </div>
    </AntCard>
  )

  if (hoverable && !loading) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}

export default OptimizedCard