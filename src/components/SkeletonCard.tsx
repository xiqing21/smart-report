import React from 'react'
import { Card, Skeleton, Space } from 'antd'
import { motion } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

interface SkeletonCardProps {
  loading?: boolean
  children?: React.ReactNode
  rows?: number
  showAvatar?: boolean
  showActions?: boolean
  className?: string
  style?: React.CSSProperties
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  loading = true,
  children,
  rows = 3,
  showAvatar = false,
  showActions = true,
  className,
  style
}) => {
  if (!loading && children) {
    return <>{children}</>
  }

  const cardStyle: React.CSSProperties = {
    border: `1px solid ${designSystem.colors.border.light}`,
    borderRadius: designSystem.borderRadius.lg,
    height: '100%',
    ...style
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={className}
        style={cardStyle}
        bodyStyle={{
          padding: designSystem.spacing.lg,
          height: '100%'
        }}
      >
        {/* 标题骨架 */}
        <div style={{ marginBottom: designSystem.spacing.md }}>
          <Skeleton.Input
            active
            size="small"
            style={{
              width: '60%',
              height: '20px',
              marginBottom: designSystem.spacing.xs
            }}
          />
          <Space size="small" style={{ marginTop: designSystem.spacing.xs }}>
            <Skeleton.Button
              active
              size="small"
              style={{
                width: '60px',
                height: '22px',
                borderRadius: designSystem.borderRadius.sm
              }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{
                width: '50px',
                height: '22px',
                borderRadius: designSystem.borderRadius.sm
              }}
            />
          </Space>
        </div>

        {/* 内容骨架 */}
        <div style={{ marginBottom: designSystem.spacing.md }}>
          <Skeleton
            active
            avatar={showAvatar}
            paragraph={{
              rows,
              width: ['100%', '90%', '70%']
            }}
            title={false}
          />
        </div>

        {/* 底部元数据和操作骨架 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <Space size="small">
            <Skeleton.Button
              active
              size="small"
              style={{
                width: '80px',
                height: '16px'
              }}
            />
            <Skeleton.Button
              active
              size="small"
              style={{
                width: '60px',
                height: '16px'
              }}
            />
          </Space>
          
          {showActions && (
            <Space size="small">
              <Skeleton.Button
                active
                size="small"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: designSystem.borderRadius.sm
                }}
              />
              <Skeleton.Button
                active
                size="small"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: designSystem.borderRadius.sm
                }}
              />
              <Skeleton.Button
                active
                size="small"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: designSystem.borderRadius.sm
                }}
              />
            </Space>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// 列表骨架屏组件
export const SkeletonCardList: React.FC<{
  count?: number
  loading?: boolean
  children?: React.ReactNode
}> = ({ count = 6, loading = true, children }) => {
  if (!loading && children) {
    return <>{children}</>
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: designSystem.spacing.lg
    }}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} loading={loading} />
      ))}
    </div>
  )
}

export default SkeletonCard