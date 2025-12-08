// Plan Utilities - Validation, formatting, sorting, filtering
import {
  Plan,
  PlanFormData,
  ValidationErrors,
  PlanStatusFilter,
  DURATION_OPTIONS,
} from '../models/types';

/**
 * Format currency in INR
 */
export const formatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'Just now';
};

/**
 * Format date for display
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Sort plans: Active first (sorted by name), then Inactive (sorted by name)
 */
export const sortPlans = (plans: Plan[]): Plan[] => {
  return [...plans].sort((a, b) => {
    // First sort by active status (active first)
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

/**
 * Filter plans by search query
 */
export const filterPlansBySearch = (plans: Plan[], query: string): Plan[] => {
  if (!query.trim()) {
    return plans;
  }

  const searchLower = query.toLowerCase().trim();
  return plans.filter(plan =>
    plan.name.toLowerCase().includes(searchLower) ||
    plan.internalCode.toLowerCase().includes(searchLower)
  );
};

/**
 * Filter plans by status
 */
export const filterPlansByStatus = (plans: Plan[], status: PlanStatusFilter): Plan[] => {
  if (status === 'all') {
    return plans;
  }
  return plans.filter(plan => status === 'active' ? plan.isActive : !plan.isActive);
};

/**
 * Combined filter and sort
 */
export const getFilteredAndSortedPlans = (
  plans: Plan[],
  searchQuery: string,
  statusFilter: PlanStatusFilter
): Plan[] => {
  let result = filterPlansByStatus(plans, statusFilter);
  result = filterPlansBySearch(result, searchQuery);
  result = sortPlans(result);
  return result;
};

/**
 * Convert Plan to PlanFormData for editing
 */
export const planToFormData = (plan: Plan): PlanFormData => {
  return {
    name: plan.name,
    internalCode: plan.internalCode,
    basePricePerMeal: plan.basePricePerMeal.toString(),
    durationMinDays: plan.durationMinDays.toString(),
    durationMaxDays: plan.durationMaxDays.toString(),
    allowedDurations: [...plan.allowedDurations],
    shortTagline: plan.shortTagline,
    description: plan.description,
    mealType: plan.mealType,
    targetUser: plan.targetUser,
    customTargetUser: plan.customTargetUser || '',
    supportsAddOns: plan.supportsAddOns,
    packagingRule: plan.packagingRule,
    isActive: plan.isActive,
  };
};

/**
 * Get empty form data for new plan
 */
export const getEmptyFormData = (): PlanFormData => {
  return {
    name: '',
    internalCode: '',
    basePricePerMeal: '',
    durationMinDays: '7',
    durationMaxDays: '60',
    allowedDurations: [7, 14, 30, 60],
    shortTagline: '',
    description: '',
    mealType: 'VEG',
    targetUser: 'STUDENTS',
    customTargetUser: '',
    supportsAddOns: false,
    packagingRule: 'DEFAULT',
    isActive: true,
  };
};

/**
 * Validate plan form data
 */
export const validatePlanForm = (
  formData: PlanFormData,
  existingPlans: Plan[],
  editingPlanId?: string
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name validation
  const trimmedName = formData.name.trim();
  if (!trimmedName) {
    errors.name = 'Plan name is required';
  } else if (trimmedName.length < 3) {
    errors.name = 'Plan name must be at least 3 characters';
  } else if (trimmedName.length > 50) {
    errors.name = 'Plan name must be less than 50 characters';
  }

  // Internal code validation
  const trimmedCode = formData.internalCode.trim().toUpperCase();
  if (!trimmedCode) {
    errors.internalCode = 'Internal code is required';
  } else if (!/^[A-Z0-9_]+$/.test(trimmedCode)) {
    errors.internalCode = 'Only uppercase letters, numbers, and underscores allowed';
  } else if (trimmedCode.length < 3) {
    errors.internalCode = 'Internal code must be at least 3 characters';
  } else if (trimmedCode.length > 30) {
    errors.internalCode = 'Internal code must be less than 30 characters';
  } else {
    // Check uniqueness
    const isDuplicate = existingPlans.some(
      plan => plan.internalCode.toUpperCase() === trimmedCode && plan.id !== editingPlanId
    );
    if (isDuplicate) {
      errors.internalCode = 'This internal code is already in use';
    }
  }

  // Base price validation
  const price = parseFloat(formData.basePricePerMeal);
  if (!formData.basePricePerMeal.trim()) {
    errors.basePricePerMeal = 'Price per meal is required';
  } else if (isNaN(price)) {
    errors.basePricePerMeal = 'Please enter a valid number';
  } else if (price <= 0) {
    errors.basePricePerMeal = 'Price must be greater than 0';
  } else if (price > 5000) {
    errors.basePricePerMeal = 'Price seems too high (max ₹5000)';
  }

  // Duration validation
  const minDays = parseInt(formData.durationMinDays, 10);
  const maxDays = parseInt(formData.durationMaxDays, 10);

  if (!formData.durationMinDays.trim()) {
    errors.durationMinDays = 'Minimum duration is required';
  } else if (isNaN(minDays) || minDays < 1) {
    errors.durationMinDays = 'Minimum duration must be at least 1 day';
  }

  if (!formData.durationMaxDays.trim()) {
    errors.durationMaxDays = 'Maximum duration is required';
  } else if (isNaN(maxDays) || maxDays < 1) {
    errors.durationMaxDays = 'Maximum duration must be at least 1 day';
  } else if (!isNaN(minDays) && maxDays < minDays) {
    errors.durationMaxDays = 'Maximum must be greater than or equal to minimum';
  }

  // Allowed durations validation
  if (formData.allowedDurations.length === 0) {
    errors.allowedDurations = 'Select at least one allowed duration';
  } else {
    // Check that selected durations are within min-max range
    const validDurations = formData.allowedDurations.filter(d => d >= minDays && d <= maxDays);
    if (validDurations.length === 0 && !isNaN(minDays) && !isNaN(maxDays)) {
      errors.allowedDurations = 'Selected durations must be within min-max range';
    }
  }

  // Short tagline validation
  if (formData.shortTagline.trim() && formData.shortTagline.length > 100) {
    errors.shortTagline = 'Tagline must be less than 100 characters';
  }

  // Description validation
  if (formData.description.trim() && formData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Custom target user validation (only when OTHER is selected)
  if (formData.targetUser === 'OTHER' && !formData.customTargetUser.trim()) {
    errors.customTargetUser = 'Please specify the target audience';
  }

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Convert form data to Plan object
 */
export const formDataToPlan = (
  formData: PlanFormData,
  existingPlan?: Plan
): Omit<Plan, 'id'> => {
  const now = Date.now();

  return {
    name: formData.name.trim(),
    internalCode: formData.internalCode.trim().toUpperCase(),
    basePricePerMeal: parseFloat(formData.basePricePerMeal) || 0,
    durationMinDays: parseInt(formData.durationMinDays, 10) || 7,
    durationMaxDays: parseInt(formData.durationMaxDays, 10) || 60,
    allowedDurations: formData.allowedDurations.sort((a, b) => a - b),
    shortTagline: formData.shortTagline.trim(),
    description: formData.description.trim(),
    mealType: formData.mealType,
    targetUser: formData.targetUser,
    customTargetUser: formData.targetUser === 'OTHER' ? formData.customTargetUser.trim() : undefined,
    supportsAddOns: formData.supportsAddOns,
    packagingRule: formData.packagingRule,
    isActive: formData.isActive,
    createdAt: existingPlan?.createdAt || now,
    updatedAt: now,
  };
};

/**
 * Check if form data has changed from original plan
 */
export const hasFormChanged = (formData: PlanFormData, originalPlan?: Plan): boolean => {
  if (!originalPlan) {
    // For new plans, check if any required field has been filled
    return (
      formData.name.trim() !== '' ||
      formData.internalCode.trim() !== '' ||
      formData.basePricePerMeal.trim() !== '' ||
      formData.shortTagline.trim() !== '' ||
      formData.description.trim() !== ''
    );
  }

  const originalFormData = planToFormData(originalPlan);

  return (
    formData.name !== originalFormData.name ||
    formData.internalCode !== originalFormData.internalCode ||
    formData.basePricePerMeal !== originalFormData.basePricePerMeal ||
    formData.durationMinDays !== originalFormData.durationMinDays ||
    formData.durationMaxDays !== originalFormData.durationMaxDays ||
    JSON.stringify(formData.allowedDurations) !== JSON.stringify(originalFormData.allowedDurations) ||
    formData.shortTagline !== originalFormData.shortTagline ||
    formData.description !== originalFormData.description ||
    formData.mealType !== originalFormData.mealType ||
    formData.targetUser !== originalFormData.targetUser ||
    formData.customTargetUser !== originalFormData.customTargetUser ||
    formData.supportsAddOns !== originalFormData.supportsAddOns ||
    formData.packagingRule !== originalFormData.packagingRule ||
    formData.isActive !== originalFormData.isActive
  );
};

/**
 * Get statistics about plans
 */
export const getPlanStats = (plans: Plan[]): {
  total: number;
  active: number;
  inactive: number;
} => {
  const active = plans.filter(p => p.isActive).length;
  return {
    total: plans.length,
    active,
    inactive: plans.length - active,
  };
};
