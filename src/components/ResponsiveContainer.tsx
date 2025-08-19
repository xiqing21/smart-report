import React from 'react';
import { Grid } from 'antd';
import { motion } from 'framer-motion';

const { useBreakpoint } = Grid;

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  mobileFullWidth?: boolean;
  mobilePadding?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  animate = true,
  mobileFullWidth = true,
  mobilePadding = true
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const containerClass = [
    className,
    isMobile && mobileFullWidth ? 'mobile-full-width' : '',
    isMobile && mobilePadding ? 'mobile-padding' : ''
  ].filter(Boolean).join(' ');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (animate) {
    return (
      <motion.div
        className={containerClass}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={containerClass}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;