// 智能报告系统 - 统一设计系统配置

// 颜色系统
export const colors = {
  // 主色调 - 深空蓝紫渐变系
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // 主色 - 深空紫
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b'
  },
  
  // 辅助色 - 极光绿
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // 辅助色 - 极光绿
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  
  // 功能色 - 优化为更现代的色彩
  success: '#10b981', // 翡翠绿
  warning: '#f59e0b', // 琥珀黄
  error: '#ef4444',   // 珊瑚红
  info: '#3b82f6',    // 天空蓝
  
  // 中性色 - 优化为更柔和的灰度
  gray: {
    50: '#f8fafc',   // 雾白
    100: '#f1f5f9',  // 轻灰
    200: '#e2e8f0',  // 珍珠灰
    300: '#cbd5e1',  // 银灰
    400: '#94a3b8',  // 中灰
    500: '#64748b',  // 石板灰
    600: '#475569',  // 深石板灰
    700: '#334155',  // 炭灰
    800: '#1e293b',  // 深炭灰
    900: '#0f172a',  // 极深灰
    950: '#020617'   // 墨黑
  },
  
  // 背景色 - 优化为更现代的渐变背景
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient_light: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    // 新增玻璃拟态背景色
    glass: 'rgba(255, 255, 255, 0.05)',
    glass_hover: 'rgba(255, 255, 255, 0.1)',
    glass_strong: 'rgba(255, 255, 255, 0.15)'
  },
  
  // 文本色 - 适配新的中性色
  text: {
    primary: '#0f172a',
    secondary: '#334155',
    tertiary: '#64748b',
    inverse: '#ffffff',
    disabled: '#94a3b8'
  },
  
  // 边框色 - 适配新的中性色
  border: {
    light: '#e2e8f0',
    default: '#cbd5e1',
    dark: '#94a3b8'
  }
}

// 字体系统
export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    // 新增更现代的字体选项
    modern: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    elegant: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
}

// 间距系统
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
}

// 圆角系统
export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px'
}

// 阴影系统 - 优化为更柔和的阴影
export const shadows = {
  sm: '0 1px 2px 0 rgba(99, 102, 241, 0.05)',
  base: '0 1px 3px 0 rgba(99, 102, 241, 0.1), 0 1px 2px 0 rgba(99, 102, 241, 0.06)',
  md: '0 4px 6px -1px rgba(99, 102, 241, 0.1), 0 2px 4px -1px rgba(99, 102, 241, 0.06)',
  lg: '0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(99, 102, 241, 0.05)',
  xl: '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)',
  '2xl': '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(99, 102, 241, 0.06)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)'
}

// 动画系统
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

// 断点系统
export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px'
}

// Z-index 层级
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
}

// 组件尺寸
export const sizes = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '48px',
  xl: '56px'
}

// 导出完整的设计系统
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  sizes
}

export default designSystem