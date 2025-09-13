export interface Meal {
  id: string;
  name: string;
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMealRequest {
  name: string;
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
}

export interface UpdateMealRequest {
  name?: string;
  protein?: number;
  calories?: number;
  fat?: number;
  carbs?: number;
}

export interface MealResponse {
  id: string;
  name: string;
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
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
