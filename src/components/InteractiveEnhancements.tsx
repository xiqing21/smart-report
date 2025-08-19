import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Tag, Tooltip, Badge, Progress } from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  BookOutlined,
  BookFilled,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  LoadingOutlined,

} from '@ant-design/icons';

// 增强型按钮组件
interface EnhancedButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'glow' | 'pulse' | 'bounce' | 'shake' | 'gradient';
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  loading = false,
  disabled = false,
  icon,
  onClick,
  className = '',
  variant = 'glow'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    glow: {
      hover: { boxShadow: '0 0 20px rgba(24, 144, 255, 0.4)', scale: 1.02 },
      tap: { scale: 0.98 }
    },
    pulse: {
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    },
    bounce: {
      hover: { y: -2 },
      tap: { y: 0 }
    },
    shake: {
      hover: { x: [0, -1, 1, -1, 1, 0] },
      tap: { scale: 0.95 }
    },
    gradient: {
      hover: { 
        background: 'linear-gradient(45deg, #1890ff, #722ed1)',
        scale: 1.02
      },
      tap: { scale: 0.98 }
    }
  };

  return (
    <motion.div
      whileHover={variants[variant].hover}
      whileTap={variants[variant].tap}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}

    >
      <Button
        type={type}
        size={size}
        loading={loading}
        disabled={disabled}
        icon={icon}
        onClick={onClick}
        className={`enhanced-button ${className} ${isHovered ? 'hovered' : ''} ${isPressed ? 'pressed' : ''}`}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// 交互式卡片组件
interface InteractiveCardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  effect?: 'lift' | 'tilt' | 'glow' | 'border' | 'scale';
  loading?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  hoverable = true,
  onClick,
  className = '',
  effect = 'lift',
  loading = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const effects = {
    lift: {
      hover: { y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' },
      tap: { y: -4 }
    },
    tilt: {
      hover: { rotateY: 5, rotateX: 5, scale: 1.02 },
      tap: { rotateY: 0, rotateX: 0, scale: 1 }
    },
    glow: {
      hover: { boxShadow: '0 0 30px rgba(24, 144, 255, 0.3)' },
      tap: { scale: 0.98 }
    },
    border: {
      hover: { borderColor: '#1890ff', borderWidth: 2 },
      tap: { scale: 0.98 }
    },
    scale: {
      hover: { scale: 1.03 },
      tap: { scale: 0.97 }
    }
  };

  return (
    <motion.div
      whileHover={hoverable ? effects[effect].hover : {}}
      whileTap={onClick ? effects[effect].tap : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card
        hoverable={false}
        loading={loading}
        className={`interactive-card ${className} ${isHovered ? 'hovered' : ''}`}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// 点赞按钮组件
interface LikeButtonProps {
  initialLiked?: boolean;
  likeCount?: number;
  onLike?: (liked: boolean) => void;
  size?: 'small' | 'middle' | 'large';
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  initialLiked = false,
  likeCount = 0,
  onLike,
  size = 'middle'
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : prev - 1);
    setIsAnimating(true);
    onLike?.(newLiked);
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.div
      className="like-button-container"
      whileTap={{ scale: 0.9 }}
    >
      <Button
        type="text"
        size={size}
        icon={
          <motion.div
            animate={isAnimating ? {
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            {liked ? (
              <HeartFilled style={{ color: '#ff4d4f' }} />
            ) : (
              <HeartOutlined />
            )}
          </motion.div>
        }
        onClick={handleLike}
      >
        <motion.span
          key={count}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.span>
      </Button>
    </motion.div>
  );
};

// 收藏按钮组件
interface BookmarkButtonProps {
  initialBookmarked?: boolean;
  onBookmark?: (bookmarked: boolean) => void;
  size?: 'small' | 'middle' | 'large';
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  initialBookmarked = false,
  onBookmark,
  size = 'middle'
}) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBookmark = () => {
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    setIsAnimating(true);
    onBookmark?.(newBookmarked);
    
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
    >
      <Button
        type="text"
        size={size}
        icon={
          <motion.div
            animate={isAnimating ? {
              scale: [1, 1.2, 1],
              y: [0, -3, 0]
            } : {}}
            transition={{ duration: 0.4 }}
          >
            {bookmarked ? (
              <BookFilled style={{ color: '#1890ff' }} />
            ) : (
              <BookOutlined />
            )}
          </motion.div>
        }
        onClick={handleBookmark}
      />
    </motion.div>
  );
};

// 评分组件
interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  onChange,
  readonly = false,
  size = 'middle'
}) => {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (newRating: number) => {
    if (readonly) return;
    setRating(newRating);
    onChange?.(newRating);
  };

  const sizeMap = {
    small: 14,
    middle: 16,
    large: 20
  };

  return (
    <div className="rating-container">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <motion.div
            key={star}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onHoverStart={() => !readonly && setHoverRating(star)}
            onHoverEnd={() => !readonly && setHoverRating(0)}
            onClick={() => handleClick(star)}
            style={{ 
              cursor: readonly ? 'default' : 'pointer',
              display: 'inline-block',
              marginRight: 2
            }}
          >
            {filled ? (
              <StarFilled 
                style={{ 
                  color: '#faad14', 
                  fontSize: sizeMap[size]
                }} 
              />
            ) : (
              <StarOutlined 
                style={{ 
                  color: '#d9d9d9', 
                  fontSize: sizeMap[size]
                }} 
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// 状态标签组件
interface StatusTagProps {
  status: 'new' | 'hot' | 'premium' | 'completed' | 'pending' | 'processing';
  animated?: boolean;
}

export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  animated = true
}) => {
  const statusConfig = {
    new: {
      color: '#52c41a',
      icon: <ThunderboltOutlined />,
      text: '新品',
      animation: { scale: [1, 1.1, 1] }
    },
    hot: {
      color: '#ff4d4f',
      icon: <FireOutlined />,
      text: '热门',
      animation: { rotate: [0, 5, -5, 0] }
    },
    premium: {
      color: '#722ed1',
      icon: <CrownOutlined />,
      text: '高级',
      animation: { y: [0, -2, 0] }
    },
    completed: {
      color: '#52c41a',
      icon: <CheckCircleOutlined />,
      text: '已完成',
      animation: { scale: [1, 1.05, 1] }
    },
    pending: {
      color: '#faad14',
      icon: <LoadingOutlined spin />,
      text: '待处理',
      animation: { opacity: [1, 0.7, 1] }
    },
    processing: {
      color: '#1890ff',
      icon: <LoadingOutlined spin />,
      text: '处理中',
      animation: { scale: [1, 1.02, 1] }
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      animate={animated ? config.animation : {}}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        repeatType: 'loop' 
      }}
    >
      <Tag 
        color={config.color} 
        icon={config.icon}
        className="status-tag"
      >
        {config.text}
      </Tag>
    </motion.div>
  );
};

// 通知徽章组件
interface NotificationBadgeProps {
  count?: number;
  dot?: boolean;
  children: React.ReactNode;
  animated?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  dot = false,
  children,
  animated = true
}) => {
  const [isVisible, setIsVisible] = useState(count > 0 || dot);

  useEffect(() => {
    setIsVisible(count > 0 || dot);
  }, [count, dot]);

  return (
    <Badge 
      count={
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                ...(animated ? {
                  y: [0, -2, 0]
                } : {})
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                y: {
                  duration: 1,
                  repeat: Infinity,
                  repeatType: 'loop'
                }
              }}
            >
              {dot ? '' : count}
            </motion.div>
          )}
        </AnimatePresence>
      }
      dot={dot}
    >
      {children}
    </Badge>
  );
};

// 进度指示器组件
interface AnimatedProgressProps {
  percent: number;
  status?: 'normal' | 'active' | 'exception' | 'success';
  showInfo?: boolean;
  strokeColor?: string;
  animated?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  percent,
  status = 'normal',
  showInfo = true,
  strokeColor,
  animated = true
}) => {
  const [currentPercent, setCurrentPercent] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentPercent(percent);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentPercent(percent);
    }
  }, [percent, animated]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Progress
        percent={currentPercent}
        status={status}
        showInfo={showInfo}
        strokeColor={strokeColor}
        className="animated-progress"
      />
    </motion.div>
  );
};

// 悬浮提示增强组件
interface EnhancedTooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'focus' | 'click';
  animated?: boolean;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  title,
  children,
  placement = 'top',
  trigger = 'hover',
  animated = true
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      title={
        animated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.div>
        ) : title
      }
      placement={placement}
      trigger={trigger}
      visible={visible}
      onVisibleChange={setVisible}
    >
      <motion.div
        whileHover={animated ? { scale: 1.02 } : {}}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </Tooltip>
  );
};