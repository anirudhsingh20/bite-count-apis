import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Meal document
export interface IMeal extends Document {
  name: string;
  protein: number;
  calories: number;
  fat: number;
  carbs: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const mealSchema = new Schema<IMeal>({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
    minlength: [2, 'Meal name must be at least 2 characters long'],
    maxlength: [100, 'Meal name cannot exceed 100 characters'],
    index: true // For faster searches by name
  },
  protein: {
    type: Number,
    required: [true, 'Protein content is required'],
    min: [0, 'Protein content cannot be negative'],
    max: [1000, 'Protein content cannot exceed 1000g']
  },
  calories: {
    type: Number,
    required: [true, 'Calorie content is required'],
    min: [0, 'Calorie content cannot be negative'],
    max: [10000, 'Calorie content cannot exceed 10000 calories']
  },
  fat: {
    type: Number,
    required: [true, 'Fat content is required'],
    min: [0, 'Fat content cannot be negative'],
    max: [1000, 'Fat content cannot exceed 1000g']
  },
  carbs: {
    type: Number,
    required: [true, 'Carbohydrate content is required'],
    min: [0, 'Carbohydrate content cannot be negative'],
    max: [1000, 'Carbohydrate content cannot exceed 1000g']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  versionKey: false // Disable __v field
});

// Indexes for better query performance
mealSchema.index({ name: 1 }); // Index for name searches
mealSchema.index({ calories: 1 }); // Index for calorie range queries
mealSchema.index({ protein: 1 }); // Index for protein range queries
mealSchema.index({ fat: 1 }); // Index for fat range queries
mealSchema.index({ carbs: 1 }); // Index for carbs range queries
mealSchema.index({ name: 'text' }); // Text index for full-text search

// Ensure virtual fields are serialized
mealSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    return ret;
  }
});

// Pre-save middleware for data validation and normalization
mealSchema.pre('save', async function(next) {
  try {
    // Normalize name (trim and title case)
    this.name = this.name.trim();
    
    // Round numeric values to 2 decimal places
    this.protein = Math.round(this.protein * 100) / 100;
    this.calories = Math.round(this.calories * 100) / 100;
    this.fat = Math.round(this.fat * 100) / 100;
    this.carbs = Math.round(this.carbs * 100) / 100;
    
    next();
  } catch (error) {
    console.error('❌ Error in meal pre-save middleware:', error);
    next(error as Error);
  }
});

// Define static methods interface
interface IMealModel extends mongoose.Model<IMeal> {
  searchByName(query: string, page?: number, limit?: number): Promise<IMeal[]>;
  findByCalorieRange(minCalories: number, maxCalories: number, page?: number, limit?: number): Promise<IMeal[]>;
  findByProteinRange(minProtein: number, maxProtein: number, page?: number, limit?: number): Promise<IMeal[]>;
  findByFatRange(minFat: number, maxFat: number, page?: number, limit?: number): Promise<IMeal[]>;
  findByCarbsRange(minCarbs: number, maxCarbs: number, page?: number, limit?: number): Promise<IMeal[]>;
  getMealStats(): Promise<any>;
}

// Define instance methods interface
interface IMealDocument extends IMeal {
  getMealInfo(): any;
}

// Static method to search meals by name
mealSchema.statics.searchByName = function(query: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    name: { $regex: query, $options: 'i' } 
  })
  .sort({ name: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to find meals by calorie range
mealSchema.statics.findByCalorieRange = function(minCalories: number, maxCalories: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    calories: { $gte: minCalories, $lte: maxCalories } 
  })
  .sort({ calories: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to find meals by protein range
mealSchema.statics.findByProteinRange = function(minProtein: number, maxProtein: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    protein: { $gte: minProtein, $lte: maxProtein } 
  })
  .sort({ protein: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to find meals by fat range
mealSchema.statics.findByFatRange = function(minFat: number, maxFat: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    fat: { $gte: minFat, $lte: maxFat } 
  })
  .sort({ fat: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to find meals by carbs range
mealSchema.statics.findByCarbsRange = function(minCarbs: number, maxCarbs: number, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    carbs: { $gte: minCarbs, $lte: maxCarbs } 
  })
  .sort({ carbs: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get meal statistics
mealSchema.statics.getMealStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalMeals: { $sum: 1 },
        totalCalories: { $sum: '$calories' },
        totalProtein: { $sum: '$protein' },
        totalFat: { $sum: '$fat' },
        totalCarbs: { $sum: '$carbs' },
        averageCalories: { $avg: '$calories' },
        averageProtein: { $avg: '$protein' },
        averageFat: { $avg: '$fat' },
        averageCarbs: { $avg: '$carbs' }
      }
    }
  ]);
};

// Instance method to get meal's basic info
mealSchema.methods.getMealInfo = function() {
  return {
    id: this._id,
    name: this.name,
    protein: this.protein,
    calories: this.calories,
    fat: this.fat,
    carbs: this.carbs,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Create and export the model
const Meal = mongoose.model<IMeal, IMealModel>('Meal', mealSchema);

export default Meal;
