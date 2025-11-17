// Gemini-inspired Dark Theme
export const theme = {
  colors: {
    // Primary backgrounds
    background: '#0A0A0A',
    backgroundSecondary: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceHover: '#242424',
    surfaceActive: '#2E2E2E',
    
    // Accent colors with glow
    accent: '#89B4FA',
    accentHover: '#A6C8FF',
    accentMuted: '#6B8FB8',
    accentGlow: 'rgba(137, 180, 250, 0.35)',
    
    // Text colors
    text: '#F0F2F5',
    textSecondary: '#A0A6AC',
    textMuted: '#6B7280',
    
    // Semantic colors with glow
    success: '#4ADE80',
    successGlow: 'rgba(74, 222, 128, 0.35)',
    warning: '#FBBF24',
    warningGlow: 'rgba(251, 191, 36, 0.35)',
    error: '#EF5350',
    errorGlow: 'rgba(239, 83, 80, 0.35)',
    info: '#60A5FA',
    infoGlow: 'rgba(96, 165, 250, 0.35)',
    
    // Borders and dividers
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(137, 180, 250, 0.3)',
    divider: 'rgba(255, 255, 255, 0.06)',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.88)',
    overlayHover: 'rgba(0, 0, 0, 0.92)',
    overlayLight: 'rgba(0, 0, 0, 0.6)',
    
    // Book card specific
    cardBackground: '#1A1A1A',
    cardHover: '#1E1E1E',
  },
  
  // Elevation system (using box-shadow and background lightness)
  elevation: {
    low: '0 1px 3px rgba(0, 0, 0, 0.4)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    high: '0 8px 16px rgba(0, 0, 0, 0.6)',
    popup: '0 12px 24px rgba(0, 0, 0, 0.7)',
  },
  
  // Typography
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    reading: 'Georgia, "Times New Roman", serif',
    mono: '"SF Mono", "Cascadia Code", Consolas, monospace',
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Spacing system (based on 8px grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    medium: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
  },
};

// CSS Variables for dynamic theming
export const cssVariables = `
  :root {
    /* Colors */
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-accent: ${theme.colors.accent};
    --color-text: ${theme.colors.text};
    --color-text-secondary: ${theme.colors.textSecondary};
    --color-border: ${theme.colors.border};
    
    /* Spacing */
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    
    /* Typography */
    --font-primary: ${theme.fonts.primary};
    --font-reading: ${theme.fonts.reading};
    
    /* Transitions */
    --transition-fast: ${theme.transitions.fast};
    --transition-medium: ${theme.transitions.medium};
  }
`;
