/**
 * Estilos comunes reutilizables
 *
 * Componentes base que se usan en múltiples pantallas
 * (Cards, Inputs, Headers, etc.)
 */

import { Platform, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows, Layout } from './theme';

export const commonStyles = StyleSheet.create({
  // ==================== CONTAINERS ====================
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== SCROLL VIEWS ====================
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Layout.screenPaddingVertical,
  },

  scrollContentSmall: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingVertical: Layout.screenPaddingVerticalSmall,
  },

  scrollContentMin: {
    minHeight: '100%',
  },

  // ==================== CARDS ====================
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.md,
    ...(Platform.OS === 'web' ? {} : Shadows.native.md),
  } as any,

  cardSmall: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...(Platform.OS === 'web' ? {} : Shadows.native.sm),
  } as any,

  // ==================== HEADERS ====================
  header: {
    paddingTop: Platform.OS === 'web' ? Spacing.lg : Layout.headerPaddingTop,
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {} : Shadows.native.sm),
  } as any,

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  // ==================== TYPOGRAPHY ====================
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.gray900,
    marginBottom: Spacing.xl,
  },

  title2: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.gray900,
  },

  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.gray500,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  subtitle2: {
    fontSize: FontSizes.base,
    color: Colors.gray500,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },

  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },

  labelSmall: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.gray500,
    marginBottom: Spacing.xs,
  },

  text: {
    fontSize: FontSizes.base,
    color: Colors.gray900,
  },

  textMuted: {
    fontSize: FontSizes.base,
    color: Colors.gray500,
  },

  textSmall: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },

  textSemibold: {
    fontWeight: FontWeights.semibold,
  },

  textBold: {
    fontWeight: FontWeights.bold,
  },

  error: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  // ==================== INPUTS ====================
  input: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    color: Colors.gray900,
  },

  inputLarge: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: FontSizes.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
    color: Colors.gray900,
  },

  inputError: {
    borderColor: Colors.error,
  },

  inputFocused: {
    borderColor: Colors.primary,
  },

  // Special for PIN input
  inputPin: {
    borderWidth: 2,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: Colors.gray50,
    color: Colors.gray900,
    marginBottom: Spacing.md,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
  },

  // ==================== BUTTONS ====================
  buttonBase: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  buttonSmall: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== BADGES ====================
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeGreen: {
    backgroundColor: Colors.successLight,
  },

  badgeAmber: {
    backgroundColor: Colors.statusPending,
  },

  badgeBlue: {
    backgroundColor: Colors.statusActive,
  },

  // ==================== BOXES ====================
  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: Spacing.lg,
  },

  successBox: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },

  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },

  // ==================== DIVIDERS ====================
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: Spacing.md,
  },

  // ==================== FLEX HELPERS ====================
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  // ==================== EMPTY STATES ====================
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },

  // ==================== LOADING ====================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.gray500,
  },

  // ==================== LINK ====================
  link: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  linkText: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.base,
  },

  linkSmall: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
  },

  // ==================== BACK BUTTON ====================
  backButton: {
    marginBottom: Spacing.lg,
  },

  backButtonText: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.base,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  // ==================== INPUT GROUPS ====================
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },

  currencyIcon: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.gray500,
    marginRight: Spacing.xs,
  },

  inputWithIconInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.gray900,
  },

  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  stepButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepButtonText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
  },

  inputCenter: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    textAlign: 'center',
    color: Colors.gray900,
  },

  // ==================== SUCCESS STATES ====================
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {} : Shadows.native.md),
  } as any,

  successIcon: {
    fontSize: FontSizes['4xl'],
    marginBottom: Spacing.lg,
  },

  successTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    color: Colors.gray900,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },

  // ==================== INFO BOXES ====================
  gameInfo: {
    width: '100%',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  gameInfoLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontWeight: FontWeights.medium,
  },

  gameInfoValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.gray900,
    marginTop: Spacing.xs,
  },

  //  ==================== PIN BOX ====================
  pinBox: {
    width: '100%',
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },

  pinLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeights.medium,
  },

  pinValue: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
    marginVertical: Spacing.sm,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
  },

  pinHint: {
    fontSize: FontSizes.sm,
    color: Colors.primaryDark,
    marginTop: Spacing.sm,
  },

  // ==================== GAME CARDS ====================
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...(Platform.OS === 'web' ? {} : Shadows.native.sm),
  } as any,

  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  gameTitleContainer: {
    flex: 1,
  },

  gameName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
  },

  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.md,
  },

  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },

  gameDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },

  gameInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },

  gameInfoItem: {
    flex: 1,
  },

  gameInfoPin: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
  },

  // ==================== GAME BUTTONS ====================
  gameButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  gameButton: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewButton: {
    backgroundColor: Colors.primaryLight,
  },

  viewButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primaryDark,
  },

  leaveButton: {
    backgroundColor: Colors.errorLight,
  },

  leaveButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.errorDark,
  },

  // ==================== LOADING & EMPTY ====================
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spacer: {
    flex: 1,
  },

  emptyButton: {
    width: 200,
  },

  // ==================== TRANSACTION STYLES ====================
  playersList: {
    gap: Spacing.md,
  },

  playerButton: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },

  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  playerAvatarText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
  },

  playerDetails: {
    flex: 1,
  },

  playerName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
  },

  playerBalance: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginTop: Spacing.xs,
  },

  selectArrow: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  // ==================== FLOW INDICATOR ====================
  flowIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  flowStep: {
    alignItems: 'center',
    flex: 1,
  },

  flowStepLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: FontWeights.medium,
    marginBottom: Spacing.md,
  },

  flowAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  flowAvatarText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
  },

  flowName: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
    marginTop: Spacing.sm,
  },

  flowArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },

  arrowText: {
    fontSize: FontSizes.xl,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },

  // ==================== FORMS ====================
  formSection: {
    marginTop: Spacing.md,
  },

  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },

  currencySymbol: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.gray500,
    marginRight: Spacing.xs,
  },

  amountInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
  },

  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },

  // ==================== SUMMARY ====================
  summaryBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },

  summaryLabel: {
    fontSize: FontSizes.xs,
    color: Colors.primaryDark,
    fontWeight: FontWeights.medium,
  },

  summaryAmount: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.primaryDark,
    marginTop: Spacing.sm,
  },

  summarySubtext: {
    fontSize: FontSizes.xs,
    color: Colors.primaryDark,
    marginTop: Spacing.md,
  },

  cancelButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },

  cancelButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },

  // ==================== ERROR ====================
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },

  errorTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },

  cardTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.gray500,
    marginBottom: Spacing.md,
  },

  balanceBox: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  balanceLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: FontWeights.medium,
  },

  balanceValue: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    color: Colors.success,
    marginTop: Spacing.xs,
  },

  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.gray900,
    marginBottom: Spacing.md,
  },
});

/**
 * Helper para crear estilos con sombra según plataforma
 */
export const getShadow = (intensity: 'sm' | 'md' | 'lg' = 'md') => {
  return Platform.select({
    web: Shadows.web[intensity] as any,
    native: Shadows.native[intensity],
  });
};
