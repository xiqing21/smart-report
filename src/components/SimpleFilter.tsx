import React from 'react'
import { Space, Button, Dropdown, Input, Badge } from 'antd'
import { FilterOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { designSystem } from '@/styles/design-system'

interface FilterOption {
  key: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface SimpleFilterProps {
  categories: FilterOption[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  showSearch?: boolean
  showCounts?: boolean
  compact?: boolean
  className?: string
  style?: React.CSSProperties
}

const SimpleFilter: React.FC<SimpleFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = '搜索...',
  showSearch = true,
  showCounts = false,
  compact = false,
  className,
  style
}) => {
  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory)
  const activeFiltersCount = selectedCategory !== 'all' ? 1 : 0

  // 移动端下拉菜单项
  const dropdownItems = categories.map(category => ({
    key: category.key,
    label: (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${designSystem.spacing.xs}px ${designSystem.spacing.sm}px`,
        minWidth: '120px'
      }}>
        <Space size="small">
          {category.icon}
          <span style={{
            color: selectedCategory === category.key 
              ? designSystem.colors.primary 
              : designSystem.colors.text.primary,
            fontWeight: selectedCategory === category.key 
              ? designSystem.typography.fontWeight.semibold 
              : designSystem.typography.fontWeight.normal
          }}>
            {category.label}
          </span>
        </Space>
        {showCounts && category.count !== undefined && (
          <Badge 
            count={category.count} 
            size="small"
            style={{ 
              backgroundColor: selectedCategory === category.key 
                ? designSystem.colors.primary 
                : designSystem.colors.text.secondary 
            }}
          />
        )}
      </div>
    ),
    onClick: () => onCategoryChange(category.key)
  }))

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designSystem.spacing.md,
        flexWrap: compact ? 'nowrap' : 'wrap',
        ...style
      }}
    >
      {/* 搜索框 */}
      {showSearch && onSearchChange && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          style={{ minWidth: compact ? '200px' : '280px' }}
        >
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: designSystem.colors.text.secondary }} />}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            style={{
              borderRadius: designSystem.borderRadius.md,
              border: `1px solid ${designSystem.colors.border.light}`,
              backgroundColor: designSystem.colors.background.primary
            }}
          />
        </motion.div>
      )}

      {/* 桌面端分类按钮 */}
      {!compact && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: designSystem.spacing.sm,
          flexWrap: 'wrap'
        }}>
          <AnimatePresence>
            {categories.slice(0, 6).map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Button
                  type={selectedCategory === category.key ? 'primary' : 'default'}
                  size="middle"
                  onClick={() => onCategoryChange(category.key)}
                  style={{
                    borderRadius: designSystem.borderRadius.md,
                    border: selectedCategory === category.key 
                      ? `1px solid ${designSystem.colors.primary}`
                      : `1px solid ${designSystem.colors.border.light}`,
                    backgroundColor: selectedCategory === category.key 
                      ? designSystem.colors.primary
                      : designSystem.colors.background.primary,
                    color: selectedCategory === category.key 
                      ? '#fff'
                      : designSystem.colors.text.primary,
                    fontWeight: selectedCategory === category.key 
                      ? designSystem.typography.fontWeight.semibold
                      : designSystem.typography.fontWeight.normal,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Space size="small">
                    {category.icon}
                    <span>{category.label}</span>
                    {showCounts && category.count !== undefined && (
                      <Badge 
                        count={category.count} 
                        size="small"
                        style={{ 
                          backgroundColor: selectedCategory === category.key 
                            ? 'rgba(255,255,255,0.3)'
                            : designSystem.colors.text.secondary 
                        }}
                      />
                    )}
                  </Space>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* 更多选项 */}
          {categories.length > 6 && (
            <Dropdown
              menu={{ items: dropdownItems.slice(6) }}
              trigger={['click']}
              placement="bottomLeft"
            >
              <Button
                style={{
                  borderRadius: designSystem.borderRadius.md,
                  border: `1px solid ${designSystem.colors.border.light}`,
                  backgroundColor: designSystem.colors.background.primary
                }}
              >
                更多 <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </div>
      )}

      {/* 移动端紧凑模式 */}
      {compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm }}>
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={['click']}
            placement="bottomLeft"
          >
            <Button
              style={{
                borderRadius: designSystem.borderRadius.md,
                border: `1px solid ${designSystem.colors.border.light}`,
                backgroundColor: designSystem.colors.background.primary,
                minWidth: '120px'
              }}
            >
              <Space>
                <FilterOutlined />
                <span>{selectedCategoryData?.label || '全部'}</span>
                {activeFiltersCount > 0 && (
                  <Badge count={activeFiltersCount} size="small" />
                )}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      )}

      {/* 活跃筛选器指示 */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="link"
              size="small"
              onClick={() => onCategoryChange('all')}
              style={{
                color: designSystem.colors.text.secondary,
                fontSize: designSystem.typography.fontSize.xs,
                padding: `${designSystem.spacing.xs}px ${designSystem.spacing.sm}px`,
                height: 'auto',
                borderRadius: designSystem.borderRadius.sm
              }}
            >
              清除筛选 ({activeFiltersCount})
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SimpleFilter