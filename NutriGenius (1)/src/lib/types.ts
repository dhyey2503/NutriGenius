
export interface UserProfile {
  dietaryRestrictions: string;
  healthGoals: string;
  medicalConditions: string;
  preferences: string;
}

export interface MealItemNutition {
  itemName: string;
  quantity?: string; // Added quantity
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  sugar?: string;
}

export interface MealWithNutrition {
  mealTitle: string;
  items: MealItemNutition[];
}

export interface DailyMealPlanWithNutrition {
  dayTitle: string;
  meals: MealWithNutrition[];
}

export type StructuredMealPlan = DailyMealPlanWithNutrition[];

// Kept for backward compatibility or for simpler displays if needed,
// but primary usage should shift to StructuredMealPlan
export type RawMealPlan = string;
