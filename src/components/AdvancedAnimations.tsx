import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import { Card, Statistic, Avatar, List, Timeline, Steps } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';

// 数字滚动动画组件
interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  onComplete?: () => void;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  onComplete
}) => {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeOutQuart;
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, start, end, duration, onComplete]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    if (separator && num >= 1000) {
      return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return fixed;
  };

  return (
    <span ref={ref}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

// 统计卡片动画组件
interface AnimatedStatisticProps {
  title: string;
  value: number;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  valueStyle?: React.CSSProperties;
  trend?: 'up' | 'down';
  trendValue?: number;
  delay?: number;
}

export const AnimatedStatistic: React.FC<AnimatedStatisticProps> = ({
  title,
  value,
  precision = 0,
  prefix,
  suffix,
  valueStyle,
  trend,
  trendValue,
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          delay: delay,
          ease: 'easeOut'
        }
      });
    }
  }, [isInView, controls, delay]);

  const trendIcon = trend === 'up' ? (
    <ArrowUpOutlined style={{ color: '#52c41a' }} />
  ) : trend === 'down' ? (
    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
  ) : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={controls}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
      }}
      transition={{ duration: 0.2 }}
    >
      <Card className="animated-statistic-card">
        <Statistic
          title={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {title}
            </motion.div>
          }
          value={value}
          precision={precision}
          valueStyle={{
            ...valueStyle,
            fontWeight: 'bold'
          }}
          prefix={
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.4, type: 'spring' }}
            >
              {prefix}
            </motion.span>
          }
          suffix={
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.6 }}
            >
              {suffix}
            </motion.span>
          }
          formatter={(val) => (
            <CountUp 
              end={Number(val)} 
              decimals={precision}
              duration={1.5}
            />
          )}
        />
        {trend && trendValue && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.8 }}
            style={{ 
              marginTop: 8, 
              fontSize: 12,
              color: trend === 'up' ? '#52c41a' : '#ff4d4f'
            }}
          >
            {trendIcon} {trendValue}%
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

// 列表项动画组件
interface AnimatedListProps {
  dataSource: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  staggerDelay?: number;
  animationType?: 'slideUp' | 'slideRight' | 'fade' | 'scale';
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  dataSource,
  renderItem,
  staggerDelay = 0.1,
  animationType = 'slideUp'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const animations = {
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 }
    },
    slideRight: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 }
    }
  };

  const animation = animations[animationType];

  return (
    <div ref={ref}>
      <List
        dataSource={dataSource}
        renderItem={(item, index) => (
          <motion.div
            initial={animation.initial}
            animate={isInView ? animation.animate : animation.initial}
            transition={{
              duration: 0.5,
              delay: index * staggerDelay,
              ease: 'easeOut'
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        )}
      />
    </div>
  );
};

// 时间轴动画组件
interface AnimatedTimelineProps {
  items: {
    time: string;
    title: string;
    description?: string;
    status?: 'pending' | 'processing' | 'completed' | 'error';
  }[];
  mode?: 'left' | 'alternate' | 'right';
}

export const AnimatedTimeline: React.FC<AnimatedTimelineProps> = ({
  items,
  mode = 'left'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'error':
        return <ClockCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  return (
    <div ref={ref}>
      <Timeline mode={mode}>
        {items.map((item, index) => ({
          key: index,
          dot: (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.2,
                type: 'spring'
              }}
            >
              {getStatusIcon(item.status)}
            </motion.div>
          ),
          children: (
            <motion.div
              initial={{ opacity: 0, x: mode === 'right' ? 30 : -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: mode === 'right' ? 30 : -30 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2 + 0.1,
                ease: 'easeOut'
              }}
            >
              <div style={{ marginBottom: 4, color: '#8c8c8c', fontSize: 12 }}>
                {item.time}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.title}
              </div>
              {item.description && (
                <div style={{ color: '#595959' }}>
                  {item.description}
                </div>
              )}
            </motion.div>
          )
        }))}
      </Timeline>
    </div>
  );
};

// 步骤条动画组件
interface AnimatedStepsProps {
  current: number;
  steps: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }[];
  direction?: 'horizontal' | 'vertical';
  animated?: boolean;
}

export const AnimatedSteps: React.FC<AnimatedStepsProps> = ({
  current,
  steps,
  direction = 'horizontal',
  animated = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [animatedCurrent, setAnimatedCurrent] = useState(0);

  useEffect(() => {
    if (!isInView || !animated) {
      setAnimatedCurrent(current);
      return;
    }

    let step = 0;
    const timer = setInterval(() => {
      if (step <= current) {
        setAnimatedCurrent(step);
        step++;
      } else {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [current, isInView, animated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Steps
        current={animatedCurrent}
        direction={direction}
        items={steps.map((step, index) => ({
          ...step,
          icon: (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: index <= animatedCurrent ? 1.1 : 0.8,
                opacity: index <= animatedCurrent ? 1 : 0.5
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {step.icon}
            </motion.div>
          )
        }))}
      />
    </motion.div>
  );
};

// 用户头像动画组件
interface AnimatedAvatarProps {
  src?: string;
  size?: number | 'large' | 'small' | 'default';
  icon?: React.ReactNode;
  online?: boolean;
  typing?: boolean;
  delay?: number;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  src,
  size = 'default',
  icon = <UserOutlined />,
  online = false,
  typing = false,
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        duration: 0.4,
        delay: delay,
        type: 'spring',
        stiffness: 200
      }}
      whileHover={{ scale: 1.1 }}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <Avatar
        src={src}
        size={size}
        icon={icon}
        style={{
          border: online ? '2px solid #52c41a' : '2px solid transparent',
          transition: 'border-color 0.3s'
        }}
      />
      
      {/* 在线状态指示器 */}
      <AnimatePresence>
        {online && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              backgroundColor: '#52c41a',
              borderRadius: '50%',
              border: '2px solid white'
            }}
          />
        )}
      </AnimatePresence>
      
      {/* 输入状态指示器 */}
      <AnimatePresence>
        {typing && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: '#1890ff',
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ color: 'white', fontSize: 8 }}
            >
              ⌨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 页面加载动画组件
interface PageLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  loading,
  children,
  loadingText = '加载中...'
}) => {
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #1890ff, #722ed1)',
              marginBottom: 20
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ color: 'white', fontSize: 16 }}
          >
            {loadingText}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};