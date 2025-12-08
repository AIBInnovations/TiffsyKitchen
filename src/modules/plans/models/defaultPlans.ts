// Default Plans - Seed data based on SRS
import { Plan } from './types';

const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;

export const defaultPlans: Plan[] = [
  {
    id: 'plan_basic_saver_001',
    name: 'Basic Saver',
    internalCode: 'BASIC_SAVER',
    basePricePerMeal: 59,
    durationMinDays: 7,
    durationMaxDays: 60,
    allowedDurations: [7, 14, 30, 60],
    shortTagline: 'Affordable meals for everyday savings',
    description: 'Our most budget-friendly option, perfect for students and PG residents. Enjoy wholesome vegetarian meals at an unbeatable price. Simple, nutritious, and reliable daily tiffin service.',
    mealType: 'VEG',
    targetUser: 'STUDENTS',
    supportsAddOns: false,
    packagingRule: 'DEFAULT',
    isActive: true,
    createdAt: oneDayAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: 'plan_balanced_daily_002',
    name: 'Balanced Daily',
    internalCode: 'BALANCED_DAILY',
    basePricePerMeal: 79,
    durationMinDays: 7,
    durationMaxDays: 60,
    allowedDurations: [7, 14, 30, 60],
    shortTagline: 'Complete nutrition for busy professionals',
    description: 'Designed for working individuals who need balanced, satisfying meals. Includes vegetarian options with the flexibility to add extras. Quality ingredients and consistent taste you can count on.',
    mealType: 'VEG_PLUS_ADDONS',
    targetUser: 'WORKING',
    supportsAddOns: true,
    packagingRule: 'STEEL_FOR_PLANS_OVER_14_VOUCHERS',
    isActive: true,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
  },
  {
    id: 'plan_premium_combo_003',
    name: 'Premium Combo',
    internalCode: 'PREMIUM_COMBO',
    basePricePerMeal: 99,
    durationMinDays: 7,
    durationMaxDays: 60,
    allowedDurations: [7, 14, 30, 60],
    shortTagline: 'Rotating gourmet menu for food enthusiasts',
    description: 'Our premium offering with a rotating menu that keeps things exciting. Perfect for fitness enthusiasts and those who appreciate variety. Features carefully curated dishes with macro-balanced nutrition.',
    mealType: 'ROTATING_MENU',
    targetUser: 'FITNESS',
    supportsAddOns: true,
    packagingRule: 'STEEL_FOR_PLANS_OVER_14_VOUCHERS',
    isActive: true,
    createdAt: oneDayAgo,
    updatedAt: oneDayAgo,
  },
];

// Generate a unique ID for new plans
export const generatePlanId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `plan_${timestamp}_${randomPart}`;
};
