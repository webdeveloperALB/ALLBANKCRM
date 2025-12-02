export const designSystem = {
  colors: {
    primary: {
      main: '#0a7f8f',
      light: '#0d9fb3',
      lighter: '#14bfd8',
      dark: '#086670',
      darker: '#064e56',
      darkest: '#04363c',
    },
    secondary: {
      ocean: '#0a5f6d',
      deepOcean: '#083d47',
      midnight: '#062832',
      slate: '#0f3d45',
    },
    accent: {
      coral: '#ff9a76',
      mint: '#4ecdc4',
      gold: '#ffd93d',
      sky: '#6bcfff',
    },
    neutral: {
      white: '#ffffff',
      gray50: '#f8fafb',
      gray100: '#f1f5f7',
      gray200: '#e2e8eb',
      gray300: '#cbd5d9',
      gray400: '#9fb1b8',
      gray500: '#708a93',
      gray600: '#4d6570',
      gray700: '#354752',
      gray800: '#243039',
      gray900: '#1a2329',
      black: '#0d1216',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0a7f8f 0%, #14bfd8 100%)',
      ocean: 'linear-gradient(135deg, #083d47 0%, #0a7f8f 100%)',
      hero: 'linear-gradient(135deg, #04363c 0%, #0a7f8f 50%, #14bfd8 100%)',
      dark: 'linear-gradient(135deg, #062832 0%, #083d47 100%)',
    },
    status: {
      success: '#10b981',
      warning: '#ffd93d',
      error: '#ff9a76',
    },
  },

  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    lineHeights: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  spacing: {
    containerMaxWidth: '80rem',
    sectionPadding: {
      y: '4rem',
      x: '1.5rem',
    },
    cardPadding: '2rem',
    gap: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    teal: '0 10px 30px -5px rgba(10, 127, 143, 0.3)',
  },
};

export const componentStyles = {
  button: {
    primary: 'bg-white text-[#0a7f8f] px-10 py-5 rounded-full font-bold text-lg hover:bg-[#f1f5f7] transition-all hover:scale-105 shadow-lg',
    secondary: 'text-white font-semibold border-2 border-white rounded-full px-8 py-3 hover:bg-white hover:text-[#0a7f8f] transition-all duration-300',
    teal: 'bg-[#0a7f8f] hover:bg-[#086670] text-white py-3 px-8 rounded-full text-base font-medium transition-all shadow-md hover:shadow-lg',
    outline: 'text-[#0a7f8f] font-semibold border-2 border-[#0a7f8f] rounded-full px-8 py-3 hover:bg-[#0a7f8f] hover:text-white transition-all duration-300',
  },

  card: {
    default: 'bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all',
    ocean: 'bg-gradient-to-br from-[#083d47] to-[#0a5f6d] rounded-lg p-8 hover:shadow-xl transition-all',
    light: 'bg-[#f8fafb] rounded-lg p-8 hover:bg-white hover:shadow-md transition-all',
    interactive: 'bg-[#0f3d45] rounded-lg p-8 hover:bg-[#0a5f6d] transition-all',
  },

  heading: {
    h1: 'text-6xl font-black leading-tight',
    h2: 'text-5xl font-bold',
    h3: 'text-4xl font-bold',
    h4: 'text-3xl font-bold',
    h5: 'text-2xl font-bold',
    h6: 'text-xl font-bold',
  },

  text: {
    body: 'text-base leading-relaxed',
    small: 'text-sm leading-relaxed',
    large: 'text-lg leading-relaxed',
  },
};
