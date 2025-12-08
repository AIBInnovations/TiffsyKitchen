export const spacing = {
  // Base spacing units
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Component specific
  screenPadding: 16,
  cardPadding: 16,
  inputPadding: 12,
  buttonPadding: 14,

  // Border radius
  borderRadiusSm: 6,
  borderRadiusMd: 8,
  borderRadiusLg: 12,
  borderRadiusXl: 16,
  borderRadiusFull: 9999,

  // Icon sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,

  // Avatar sizes
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 48,
  avatarXl: 64,

  // Card dimensions
  cardMinHeight: 80,
  listItemHeight: 72,
};

export type SpacingKey = keyof typeof spacing;
