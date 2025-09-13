export interface Meal {
  id: string;
  name: string;
  protein: number;
  calories: number;
  fat?: number;
  carbs?: number;
  servingSize: string;
  tags: string[]; // Array of Tag IDs
  emoji?: string;
  user?: string; // Optional User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMealRequest {
  name: string;
  protein: number;
  calories: number;
  fat?: number;
  carbs?: number;
  servingSize: string;
  tags?: string[];
  emoji?: string;
  user?: string;
}

export interface UpdateMealRequest {
  name?: string;
  protein?: number;
  calories?: number;
  fat?: number;
  carbs?: number;
  servingSize?: string;
  tags?: string[];
  emoji?: string;
}

export interface MealResponse {
  id: string;
  name: string;
  protein: number;
  calories: number;
  fat?: number;
  carbs?: number;
  servingSize: string;
  tags: string[];
  emoji?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealSearchParams {
  query?: string;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  minFat?: number;
  maxFat?: number;
  minCarbs?: number;
  maxCarbs?: number;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface MealStats {
  totalMeals: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
}
