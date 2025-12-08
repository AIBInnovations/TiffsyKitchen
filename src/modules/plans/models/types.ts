// Plans & Pricing Types

export type MealType = 'VEG' | 'VEG_PLUS_ADDONS' | 'ROTATING_MENU';

export type TargetUser = 'STUDENTS' | 'WORKING' | 'FITNESS' | 'OTHER';

export type PackagingRule = 'DEFAULT' | 'STEEL_FOR_PLANS_OVER_14_VOUCHERS' | 'DISPOSABLE_ONLY';

export type PlanStatusFilter = 'all' | 'active' | 'inactive';

export interface Plan {
  id: string;
  name: string;
  internalCode: string;
  basePricePerMeal: number;
  durationMinDays: number;
  durationMaxDays: number;
  allowedDurations: number[];
  shortTagline: string;
  description: string;
  mealType: MealType;
  targetUser: TargetUser;
  customTargetUser?: string; // Used when targetUser is 'OTHER'
  supportsAddOns: boolean;
  packagingRule: PackagingRule;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PlanFormData {
  name: string;
  internalCode: string;
  basePricePerMeal: string;
  durationMinDays: string;
  durationMaxDays: string;
  allowedDurations: number[];
  shortTagline: string;
  description: string;
  mealType: MealType;
  targetUser: TargetUser;
  customTargetUser: string;
  supportsAddOns: boolean;
  packagingRule: PackagingRule;
  isActive: boolean;
}

export interface ValidationErrors {
  name?: string;
  internalCode?: string;
  basePricePerMeal?: string;
  durationMinDays?: string;
  durationMaxDays?: string;
  allowedDurations?: string;
  shortTagline?: string;
  description?: string;
  mealType?: string;
  targetUser?: string;
  customTargetUser?: string;
  packagingRule?: string;
}

// Display labels for meal types
export const mealTypeLabels: Record<MealType, string> = {
  VEG: 'Veg only',
  VEG_PLUS_ADDONS: 'Veg + Add-ons',
  ROTATING_MENU: 'Rotating menu',
};

// Display labels for target users
export const targetUserLabels: Record<TargetUser, string> = {
  STUDENTS: 'Students',
  WORKING: 'Working individuals',
  FITNESS: 'Fitness enthusiasts',
  OTHER: 'Other',
};

// Display labels for packaging rules
export const packagingRuleLabels: Record<PackagingRule, string> = {
  DEFAULT: 'Default packaging',
  STEEL_FOR_PLANS_OVER_14_VOUCHERS: 'Steel dabba for 14+ vouchers',
  DISPOSABLE_ONLY: 'Disposable only',
};

// Helper text for packaging rules
export const packagingRuleHelpers: Record<PackagingRule, string> = {
  DEFAULT: 'Standard packaging based on order preferences.',
  STEEL_FOR_PLANS_OVER_14_VOUCHERS: 'Steel dabba containers will be used for plans with more than 14 vouchers, promoting sustainability.',
  DISPOSABLE_ONLY: 'Only disposable containers will be used for all orders under this plan.',
};

// Available duration options
export const DURATION_OPTIONS = [7, 14, 30, 60] as const;
