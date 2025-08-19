import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from 'antd';
import type { CardProps, ButtonProps } from 'antd';

// 动画变体配置
const animationVariants = {
  // 淡入动画
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  },
  
  // 从下方滑入
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  },
  
  // 从右侧滑入
  slideRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  },
  
  // 缩放进入
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  
  // 弹跳进入
  bounceIn: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { opacity: 1, scale: 1 }
  },
  
  // 旋转进入
  rotateIn: {
    hidden: { opacity: 0, rotate: -180 },
    visible: { opacity: 1, rotate: 0 }
  },
  
  // 列表项动画
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },
  

};

// 动画卡片组件
interface AnimatedCardProps extends CardProps {
  animation?: keyof typeof animationVariants;
  delay?: number;
  hover?: boolean;
  tap?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  animation = 'slideUp',
  delay = 0,
  hover = true,
  tap = true,
  className = '',
  ...props
}) => {
  const motionProps: any = {
    initial: 'hidden',
    animate: 'visible',
    variants: animationVariants[animation],
    className: `${className} ${hover ? 'hover-lift' : ''}`,
    transition: { delay }
  };

  if (hover) {
    motionProps.whileHover = { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } };
  }

  if (tap) {
    motionProps.whileTap = { scale: 0.98, transition: { duration: 0.1 } };
  }

  return (
    <motion.div {...motionProps}>
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

// 动画按钮组件
interface AnimatedButtonProps extends ButtonProps {
  animation?: keyof typeof animationVariants;
  delay?: number;
  glow?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animation = 'scaleIn',
  delay = 0,
  glow = false,
  className = '',
  ...props
}) => {
  const buttonClass = [
    className,
    glow ? 'btn-glow' : '',
    'transition-all duration-200 ease-out'
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animationVariants[animation]}
      transition={{ 
        delay, 
        duration: animation === 'bounceIn' ? 0.6 : animation === 'rotateIn' ? 0.5 : animation === 'scaleIn' ? 0.3 : 0.4,
        ease: "easeOut",
        ...(animation === 'bounceIn' && { type: 'spring', bounce: 0.4 })
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
    >
      <Button className={buttonClass} {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

// 列表动画容器
interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  stagger?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  stagger = 0.1
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial="hidden"
          animate="visible"
          variants={animationVariants.listItem}
          transition={{
            delay: index * stagger,
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// 页面过渡动画
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// 模态框动画
interface AnimatedModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose?: () => void;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  visible,
  onClose
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 模态框内容 */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-full overflow-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// 数字计数动画
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration, ease: 'easeOut' }}
        >
          {Math.round(value)}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
};

// 进度条动画
interface AnimatedProgressProps {
  percent: number;
  className?: string;
  color?: string;
  height?: number;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  percent,
  className = '',
  color = '#1890ff',
  height = 8
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`} style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
};

// 加载动画
interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  color = '#1890ff',
  className = ''
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="border-2 border-current border-t-transparent rounded-full"
        style={{
          width: size,
          height: size,
          borderColor: `${color} transparent ${color} ${color}`,
        }}
      />
    </motion.div>
  );
};

// 脉冲动画
interface PulseAnimationProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  className = '',
  duration = 2
}) => {
  return (
    <motion.div
      className={className}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};

// 打字机效果
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

export default {
  AnimatedCard,
  AnimatedButton,
  AnimatedList,
  PageTransition,
  AnimatedModal,
  AnimatedCounter,
  AnimatedProgress,
  LoadingSpinner,
  PulseAnimation,
  Typewriter
};