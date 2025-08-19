# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Smart Report Generation System** built for State Grid Corporation of China. It's a React + TypeScript + Vite application focused on automated report generation with AI-powered data analysis capabilities.

## Architecture & Structure

### Tech Stack
- **Frontend**: React 19.1.1 + TypeScript
- **Build Tool**: Vite 7.1.2 with React plugin
- **UI Framework**: Ant Design 5.27.0
- **Styling**: Tailwind CSS + CSS modules
- **Animation**: Framer Motion 12.23.12
- **Routing**: React Router DOM 7.8.1

### Key Features
- **Report Generation**: Automated report creation with templates
- **AI Analysis**: AI-powered data insights and anomaly detection
- **Dashboard**: Interactive analytics and progress tracking
- **Template Management**: Pre-built and custom report templates
- **Collaboration**: Team-based report editing and sharing

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── AdvancedAnimations.tsx    # Animated statistics and lists
│   ├── AnimatedComponents.tsx    # Animation utilities
│   ├── InteractiveEnhancements.tsx # Interactive cards and status tags
│   └── ResponsiveContainer.tsx   # Responsive layout helpers
├── pages/              # Route-based page components
│   ├── Dashboard.tsx           # Main dashboard with stats and quick actions
│   ├── Reports.tsx             # Report management and listing
│   ├── ReportEditor.tsx        # Rich report editing interface
│   ├── Templates.tsx           # Template management
│   ├── AIAnalysis.tsx          # AI-powered data analysis
│   └── Login.tsx               # Authentication page
├── layouts/            # Application layouts
│   └── MainLayout.tsx         # Primary layout with sidebar navigation
├── router/             # Routing configuration
│   └── index.tsx             # React Router setup
├── styles/             # Global styles and variables
│   ├── global.css            # Global CSS
│   └── variables.css         # CSS custom properties
└── utils/              # Utility functions and helpers
```

## Development Commands

### Basic Commands
```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run build  # includes tsc -b

# Linting
npm run lint

# Preview production build
npm run preview
```

### Advanced Development
- **Type Checking**: Uses TypeScript with strict mode (`tsconfig.app.json`)
- **Linting**: ESLint with TypeScript support (`eslint.config.js`)
- **Hot Module Replacement**: Vite's HMR for fast development
- **Environment Variables**: Uses Vite's env system (`.env` files)

## Key Components & Patterns

### Animation System
- **AdvancedAnimations**: Animated statistics, lists, and avatars
- **InteractiveEnhancements**: Interactive cards with hover effects
- **Framer Motion**: Used throughout for smooth transitions and micro-interactions

### UI/UX Patterns
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Ant Design Integration**: Consistent design system with AntD components
- **Color Scheme**: Blue-to-purple gradient theme with professional styling
- **Micro-interactions**: Hover effects, loading states, and smooth transitions

### State Management
- **React Router**: URL-based state management
- **Local State**: Component-level state with React hooks
- **Ant Design**: Form state and validation

## Business Context

This system addresses State Grid's reporting challenges:
- **Manual Data Processing**: Reduces 40% time spent on data preparation
- **Calculation Errors**: Eliminates Excel formula mistakes
- **Template Standardization**: Provides consistent report formats
- **AI Insights**: Automated anomaly detection and predictive analysis

## Key Integration Points

### Current Focus Areas
1. **Report Templates**: Standardized report formats for different business units
2. **Data Sources**: Integration with State Grid's existing systems
3. **AI Analysis**: Machine learning models for data insights
4. **Collaboration Features**: Multi-user editing and approval workflows

### Future Considerations
- Backend API integration for real data
- Authentication system integration
- File export capabilities (PDF, Excel)
- Advanced analytics dashboards
- Mobile responsive optimization