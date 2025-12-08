// Plans Storage - AsyncStorage persistence layer
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plan } from '../models/types';
import { defaultPlans } from '../models/defaultPlans';

const PLANS_STORAGE_KEY = '@tiffsy_admin_plans';

/**
 * Load all plans from AsyncStorage
 * If no plans exist, seeds with default plans
 */
export const loadPlans = async (): Promise<Plan[]> => {
  try {
    const storedData = await AsyncStorage.getItem(PLANS_STORAGE_KEY);

    if (storedData) {
      const plans = JSON.parse(storedData) as Plan[];

      // Validate that we have an array with data
      if (Array.isArray(plans) && plans.length > 0) {
        return plans;
      }
    }

    // No valid data found, seed with defaults
    await savePlans(defaultPlans);
    return defaultPlans;
  } catch (error) {
    console.error('Error loading plans:', error);
    // On error, return defaults and try to save them
    try {
      await savePlans(defaultPlans);
    } catch (saveError) {
      console.error('Error seeding default plans:', saveError);
    }
    return defaultPlans;
  }
};

/**
 * Save all plans to AsyncStorage
 */
export const savePlans = async (plans: Plan[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving plans:', error);
    throw error;
  }
};

/**
 * Add a new plan
 */
export const addPlan = async (plans: Plan[], newPlan: Plan): Promise<Plan[]> => {
  const updatedPlans = [...plans, newPlan];
  await savePlans(updatedPlans);
  return updatedPlans;
};

/**
 * Update an existing plan
 */
export const updatePlan = async (plans: Plan[], updatedPlan: Plan): Promise<Plan[]> => {
  const updatedPlans = plans.map(plan =>
    plan.id === updatedPlan.id ? updatedPlan : plan
  );
  await savePlans(updatedPlans);
  return updatedPlans;
};

/**
 * Delete a plan by ID
 */
export const deletePlan = async (plans: Plan[], planId: string): Promise<Plan[]> => {
  const updatedPlans = plans.filter(plan => plan.id !== planId);
  await savePlans(updatedPlans);
  return updatedPlans;
};

/**
 * Toggle a plan's active status
 */
export const togglePlanActive = async (plans: Plan[], planId: string): Promise<Plan[]> => {
  const updatedPlans = plans.map(plan => {
    if (plan.id === planId) {
      return {
        ...plan,
        isActive: !plan.isActive,
        updatedAt: Date.now(),
      };
    }
    return plan;
  });
  await savePlans(updatedPlans);
  return updatedPlans;
};

/**
 * Duplicate a plan with a new ID
 */
export const duplicatePlan = async (plans: Plan[], planId: string, newId: string): Promise<Plan[]> => {
  const originalPlan = plans.find(plan => plan.id === planId);

  if (!originalPlan) {
    throw new Error('Plan not found');
  }

  const now = Date.now();
  const duplicatedPlan: Plan = {
    ...originalPlan,
    id: newId,
    name: `${originalPlan.name} Copy`,
    internalCode: '', // Clear so admin must provide unique code
    isActive: false, // Start as inactive
    createdAt: now,
    updatedAt: now,
  };

  const updatedPlans = [...plans, duplicatedPlan];
  await savePlans(updatedPlans);
  return updatedPlans;
};

/**
 * Reset to default plans (for testing/development)
 */
export const resetToDefaultPlans = async (): Promise<Plan[]> => {
  await savePlans(defaultPlans);
  return defaultPlans;
};

/**
 * Clear all plans from storage
 */
export const clearPlansStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PLANS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing plans storage:', error);
    throw error;
  }
};
