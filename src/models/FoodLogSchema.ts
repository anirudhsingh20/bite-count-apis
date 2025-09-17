import mongoose, { Document, Schema } from 'mongoose';

// Interface for the FoodLog document
export interface IFoodLog extends Document {
  user: mongoose.Types.ObjectId;
  meal: mongoose.Types.ObjectId;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  logDate: number; // Date for which the food is being logged (epoch timestamp)
  loggedAt: number; // When the log entry was created (epoch timestamp)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const foodLogSchema = new Schema<IFoodLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    meal: {
      type: Schema.Types.ObjectId,
      ref: 'Meal',
      required: [true, 'Meal is required'],
      index: true,
    },
    mealType: {
      type: String,
      required: [true, 'Meal type is required'],
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'snack'],
        message: 'Meal type must be one of: breakfast, lunch, dinner, snack',
      },
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be at least 0.1'],
      max: [100, 'Quantity cannot exceed 100 servings'],
    },
    logDate: {
      type: Number,
      required: [true, 'Log date is required'],
      default: () => Date.now(),
      index: true,
    },
    loggedAt: {
      type: Number,
      required: [true, 'Logged at date is required'],
      default: () => Date.now(),
      index: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Disable __v field
  }
);

// Compound indexes for better query performance
foodLogSchema.index({ user: 1, logDate: -1 }); // For user's food log history by log date
foodLogSchema.index({ user: 1, mealType: 1, logDate: -1 }); // For meal type filtering by log date
foodLogSchema.index({ logDate: 1 }); // For date range queries by log date
foodLogSchema.index({ user: 1, loggedAt: -1 }); // For user's food log history by creation time

// Static method to get daily nutrition summary
foodLogSchema.statics.getDailyNutritionSummary = async function (
  userId: string,
  date: number
): Promise<any> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayEpoch = startOfDay.getTime();

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayEpoch = endOfDay.getTime();

  const logs = await this.find({
    user: userId,
    logDate: { $gte: startOfDayEpoch, $lte: endOfDayEpoch },
  }).populate('meal', 'name calories protein fat carbs servingSize');

  const summary = {
    date: startOfDay.toISOString().split('T')[0],
    totalCalories: 0,
    totalProtein: 0,
    totalFat: 0,
    totalCarbs: 0,
    mealBreakdown: {
      breakfast: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
      lunch: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
      dinner: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
      snack: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
    },
    totalItems: 0,
  };

  logs.forEach((log: any) => {
    const meal = log.meal as any;
    const multiplier = log.quantity;

    const calories = (meal.calories || 0) * multiplier;
    const protein = (meal.protein || 0) * multiplier;
    const fat = (meal.fat || 0) * multiplier;
    const carbs = (meal.carbs || 0) * multiplier;

    // Add to totals
    summary.totalCalories += calories;
    summary.totalProtein += protein;
    summary.totalFat += fat;
    summary.totalCarbs += carbs;
    summary.totalItems += 1;

    // Add to meal breakdown
    const mealType = log.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
    summary.mealBreakdown[mealType].calories += calories;
    summary.mealBreakdown[mealType].protein += protein;
    summary.mealBreakdown[mealType].fat += fat;
    summary.mealBreakdown[mealType].carbs += carbs;
    summary.mealBreakdown[mealType].items += 1;
  });

  return summary;
};

// Static method to get nutrition summary for date range
foodLogSchema.statics.getNutritionSummaryRange = async function (
  userId: string,
  startDate: number,
  endDate: number
): Promise<any[]> {
  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfDayEpoch = startOfDay.getTime();

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfDayEpoch = endOfDay.getTime();

  const logs = await this.find({
    user: userId,
    logDate: { $gte: startOfDayEpoch, $lte: endOfDayEpoch },
  }).populate('meal', 'name calories protein fat carbs servingSize');

  // Group by date
  const dailySummaries: { [key: string]: any } = {};

  logs.forEach((log: any) => {
    const date = new Date(log.logDate).toISOString().split('T')[0];

    if (!dailySummaries[date]) {
      dailySummaries[date] = {
        date,
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        mealBreakdown: {
          breakfast: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
          lunch: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
          dinner: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
          snack: { calories: 0, protein: 0, fat: 0, carbs: 0, items: 0 },
        },
        totalItems: 0,
      };
    }

    const meal = log.meal as any;
    const multiplier = log.quantity;

    const calories = (meal.calories || 0) * multiplier;
    const protein = (meal.protein || 0) * multiplier;
    const fat = (meal.fat || 0) * multiplier;
    const carbs = (meal.carbs || 0) * multiplier;

    // Add to totals
    dailySummaries[date].totalCalories += calories;
    dailySummaries[date].totalProtein += protein;
    dailySummaries[date].totalFat += fat;
    dailySummaries[date].totalCarbs += carbs;
    dailySummaries[date].totalItems += 1;

    // Add to meal breakdown
    const mealType = log.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack';
    dailySummaries[date].mealBreakdown[mealType].calories += calories;
    dailySummaries[date].mealBreakdown[mealType].protein += protein;
    dailySummaries[date].mealBreakdown[mealType].fat += fat;
    dailySummaries[date].mealBreakdown[mealType].carbs += carbs;
    dailySummaries[date].mealBreakdown[mealType].items += 1;
  });

  return Object.values(dailySummaries).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// Instance method to get nutrition info for this log entry
foodLogSchema.methods.getNutritionInfo = async function () {
  await this.populate('meal', 'name calories protein fat carbs servingSize');
  const meal = this.meal as any;
  const multiplier = this.quantity;

  return {
    name: meal.name,
    servingSize: meal.servingSize,
    quantity: this.quantity,
    totalCalories: (meal.calories || 0) * multiplier,
    totalProtein: (meal.protein || 0) * multiplier,
    totalFat: (meal.fat || 0) * multiplier,
    totalCarbs: (meal.carbs || 0) * multiplier,
    mealType: this.mealType,
    logDate: this.logDate,
    loggedAt: this.loggedAt,
    notes: this.notes,
  };
};

const FoodLog = mongoose.model<IFoodLog>('FoodLog', foodLogSchema);

export default FoodLog;
