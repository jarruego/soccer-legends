/**
 * Sistema de Temas - Variables globales de diseño
 *
 * Centraliza colores, espacios, tamaños de fuente y constantes
 * para toda la aplicación
 */

export const Colors = {
  // Primarios
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E40AF',

  // Verdes (éxito, activo)
  success: '#10B981',
  successLight: '#D1FAE5',

  // Ámbar (advertencia)
  warning: '#F59E0B',

  // Púrpura
  purple: '#8B5CF6',

  // Rojo (error, eliminar)
  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorDark: '#991B1B',

  // Neutros
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Fondos
  background: '#F2F4F8',
  backgroundAlt: '#F9FAFB',

  // Específicos de estados
  statusPending: '#FEF3C7',
  statusActive: '#D0F0FF',
  statusFinished: '#D1FAE5',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
};

export const FontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};

export const FontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  // Web
  web: {
    sm: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0px 8px 16px rgba(0, 0, 0, 0.1)',
  },
  // Native
  native: {
    sm: {
      shadowColor: '#000000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  },
};

export const Layout = {
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 24,
  screenPaddingVerticalSmall: 16,
  headerHeight: 60,
  headerPaddingTop: 40, // iOS safe area
};
