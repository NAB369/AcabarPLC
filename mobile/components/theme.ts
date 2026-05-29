export const theme = {
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    successBg: '#D1FAE5',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  typography: {
    h1: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
    h2: { fontSize: 20, fontWeight: '600', color: '#0F172A' },
    h3: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
    body: { fontSize: 16, color: '#334155' },
    caption: { fontSize: 14, color: '#64748B' },
  }
} as const;
