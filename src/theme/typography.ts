import { TextStyle } from 'react-native';

export const typography = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  } as TextStyle,
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,

  // Caption
  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  } as TextStyle,

  // Button text
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  buttonSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,

  // Tab text
  tab: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  } as TextStyle,
};

export type TypographyKey = keyof typeof typography;
