import React from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedContainerProps {
  children: ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce'
  duration?: number
  delay?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  tap?: boolean
}

const animations: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
}

const hoverEffects = {
  scale: { scale: 1.02 },
  lift: { y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  glow: { boxShadow: "0 0 20px rgba(24, 144, 255, 0.3)" }
}

const tapEffect = { scale: 0.98 }

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeIn',
  duration = 0.3,
  delay = 0,
  className,
  style,
  onClick,
  hover = false,
  tap = false
}) => {
  const animationVariants = animations[animation]
  
  return (
    <motion.div
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? hoverEffects.lift : undefined}
      whileTap={tap ? tapEffect : undefined}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// 列表动画容器
interface AnimatedListProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  staggerDelay = 0.1,
  className
}) => {
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// 页面过渡动画
interface PageTransitionProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'right'
}) => {
  const transition = {
    left: {
      initial: { x: -100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 100, opacity: 0 }
    },
    right: {
      initial: { x: 100, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -100, opacity: 0 }
    },
    up: {
      initial: { y: -100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 }
    },
    down: {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -100, opacity: 0 }
    }
  }[direction]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        {...transition}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// 加载动画
export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#1890ff'
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}20`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%'
      }}
    />
  )
}

// 脉冲动画
export const PulseAnimation: React.FC<{ children: ReactNode; color?: string }> = ({
  children,
  color = '#1890ff'
}) => {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}40`,
          `0 0 0 10px ${color}00`,
          `0 0 0 0 ${color}00`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }}
      style={{ borderRadius: '50%' }}
    >
      {children}
    </motion.div>
  )
}