import FoodLog from './FoodLogSchema';

export interface FoodLog {
  _id: string;
  user: string;
  meal: string; // Reference to Meal ID
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // check and update ... make sure to use this in all the places where meal type is used
  quantity: number; // How many servings
  logDate: number; // Date for which the food is being logged (epoch timestamp)
  loggedAt: number; // When the log entry was created (epoch timestamp)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoodLogRequest {
  user: string;
  meal: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  logDate?: number; // Date for which the food is being logged (epoch timestamp)
  loggedAt?: number; // When the log entry was created (epoch timestamp)
  notes?: string;
}

export interface UpdateFoodLogRequest {
  meal?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity?: number;
  logDate?: number; // Date for which the food is being logged (epoch timestamp)
  loggedAt?: number; // When the log entry was created (epoch timestamp)
  notes?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  mealBreakdown: {
    breakfast: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      items: number;
    };
    lunch: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      items: number;
    };
    dinner: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      items: number;
    };
    snack: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      items: number;
    };
  };
  totalItems: number;
}

export interface FoodLogSearchParams {
  userId?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  startDate?: number; // Epoch timestamp
  endDate?: number; // Epoch timestamp
  page?: number;
  limit?: number;
}

export interface BulkFoodLogItem {
  meal: string; // Reference to Meal ID
  quantity: number; // How many servings
  notes?: string;
}

export interface CreateBulkFoodLogRequest {
  user: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: BulkFoodLogItem[];
  logDate?: number; // Date for which the food is being logged (epoch timestamp)
  loggedAt?: number; // When the log entry was created (epoch timestamp)
  notes?: string; // General notes for the entire bulk log
}

export interface BulkFoodLogResponse {
  success: boolean;
  data: {
    createdLogs: FoodLog[];
    updatedLogs: FoodLog[];
    allLogs: FoodLog[];
    totalItems: number;
    newItems: number;
    updatedItems: number;
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    logDate: number; // Date for which the food is being logged (epoch timestamp)
    loggedAt: number; // When the log entry was created (epoch timestamp)
  };
  message: string;
}
