import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Meal document
export interface IMeal extends Document {
  name: string;
  protein: number;
  calories: number;
  fat?: number;
  carbs?: number;
  servingSize: string;
  tags: mongoose.Types.ObjectId[];
  emoji?: string;
  user?: mongoose.Types.ObjectId;
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
    required: false,
    min: [0, 'Fat content cannot be negative'],
    max: [1000, 'Fat content cannot exceed 1000g'],
    default: undefined
  },
  carbs: {
    type: Number,
    required: false,
    min: [0, 'Carbohydrate content cannot be negative'],
    max: [1000, 'Carbohydrate content cannot exceed 1000g'],
    default: undefined
  },
  servingSize: {
    type: String,
    required: [true, 'Serving size is required'],
    trim: true,
    minlength: [1, 'Serving size must be at least 1 character long'],
    maxlength: [50, 'Serving size cannot exceed 50 characters'],
    index: true
  },
  tags: {
    type: [Schema.Types.ObjectId],
    ref: 'Tag',
    required: false,
    default: [],
    validate: {
      validator: function(tags: any[]) {
        // Each tag should be a valid ObjectId
        return tags.every((tag: any) => mongoose.Types.ObjectId.isValid(tag));
      },
      message: 'All tags must be valid Tag IDs'
    }
  },
  emoji: {
    type: String,
    required: false,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters'],
    validate: {
      validator: function(emoji: string) {
        if (!emoji) return true; // Optional field
        // Basic emoji validation - check if it contains emoji characters
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        return emojiRegex.test(emoji);
      },
      message: 'Must be a valid emoji character'
    }
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    validate: {
      validator: function(userId: any) {
        if (!userId) return true; // Optional field
        return mongoose.Types.ObjectId.isValid(userId);
      },
      message: 'User must be a valid User ID'
    }
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
mealSchema.index({ servingSize: 1 }); // Index for serving size searches
mealSchema.index({ tags: 1 }); // Index for tag searches
mealSchema.index({ user: 1 }); // Index for user searches
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
    (this as any).name = (this as any).name.trim();
    
    // Round numeric values to 2 decimal places
    (this as any).protein = Math.round((this as any).protein * 100) / 100;
    (this as any).calories = Math.round((this as any).calories * 100) / 100;
    if ((this as any).fat !== undefined) {
      (this as any).fat = Math.round((this as any).fat * 100) / 100;
    }
    if ((this as any).carbs !== undefined) {
      (this as any).carbs = Math.round((this as any).carbs * 100) / 100;
    }

    // Validate tag IDs
    if ((this as any).tags && Array.isArray((this as any).tags)) {
      (this as any).tags = (this as any).tags.filter((tag: any) => mongoose.Types.ObjectId.isValid(tag));
    }
    
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
  findByTags(tags: string[], page?: number, limit?: number): Promise<IMeal[]>;
  getAllTags(): Promise<string[]>;
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

// Static method to find meals by tags
mealSchema.statics.findByTags = function(tags: string[], page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    tags: { $in: tags } 
  })
  .populate('tags', 'name category color')
  .sort({ name: 1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get all unique tags
mealSchema.statics.getAllTags = function() {
  return this.distinct('tags');
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
  const info: any = {
    id: this._id,
    name: this.name,
    protein: this.protein,
    calories: this.calories,
    servingSize: this.servingSize,
    tags: this.tags || [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
  
  // Only include fat and carbs if they are defined
  if (this.fat !== undefined) {
    info.fat = this.fat;
  }
  if (this.carbs !== undefined) {
    info.carbs = this.carbs;
  }
  if (this.emoji !== undefined) {
    info.emoji = this.emoji;
  }
  if (this.user !== undefined) {
    info.user = this.user;
  }
  
  return info;
};

// Create and export the model
const Meal = mongoose.model<IMeal, IMealModel>('Meal', mealSchema);

export default Meal;
