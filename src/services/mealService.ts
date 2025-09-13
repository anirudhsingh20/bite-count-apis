import Meal, { IMeal } from '../models/MealSchema';
import { CreateMealRequest, UpdateMealRequest, MealSearchParams } from '../models/Meal';

export class MealService {
  public async getAllMeals(page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.find()
        .populate('tags', 'name category color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments()
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealById(id: string): Promise<IMeal | null> {
    try {
      const meal = await Meal.findById(id)
        .populate('tags', 'name category color')
        .lean();
      return meal;
    } catch (error) {
      throw new Error('Invalid meal ID format');
    }
  }

  public async createMeal(data: CreateMealRequest): Promise<IMeal> {
    try {
      const mealData: any = {
        name: data.name.trim(),
        protein: data.protein,
        calories: data.calories,
        servingSize: data.servingSize.trim(),
        tags: data.tags || [],
        emoji: data.emoji?.trim()
      };

      // Only include user if provided
      if (data.user) {
        mealData.user = data.user;
      }

      // Only include fat and carbs if they are provided
      if (data.fat !== undefined) {
        mealData.fat = data.fat;
      }
      if (data.carbs !== undefined) {
        mealData.carbs = data.carbs;
      }

      const newMeal = new Meal(mealData);
      const savedMeal = await newMeal.save();
      return savedMeal.toObject();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create meal: ${error.message}`);
      }
      throw new Error('Failed to create meal');
    }
  }

  public async updateMeal(id: string, data: UpdateMealRequest): Promise<IMeal | null> {
    try {
      const updateData: any = { ...data };
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }
      if (updateData.servingSize) {
        updateData.servingSize = updateData.servingSize.trim();
      }
      if (updateData.emoji) {
        updateData.emoji = updateData.emoji.trim();
      }
      // User field is handled by the schema validation
      // Tags are already validated by the schema

      const updatedMeal = await Meal.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate('tags', 'name category color')
      .lean();
      
      return updatedMeal;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update meal: ${error.message}`);
      }
      throw new Error('Failed to update meal');
    }
  }

  public async deleteMeal(id: string): Promise<boolean> {
    try {
      const result = await Meal.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Failed to delete meal');
    }
  }

  public async searchMeals(params: MealSearchParams): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const { 
      query = '', 
      minCalories, 
      maxCalories, 
      minProtein, 
      maxProtein, 
      minFat, 
      maxFat, 
      minCarbs, 
      maxCarbs, 
      tags,
      page = 1, 
      limit = 10 
    } = params;
    const skip = (page - 1) * limit;
    
    let searchQuery: any = {};
    
    // Text search by name
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }

    // Calorie range filter
    if (minCalories !== undefined || maxCalories !== undefined) {
      searchQuery.calories = {};
      if (minCalories !== undefined) searchQuery.calories.$gte = minCalories;
      if (maxCalories !== undefined) searchQuery.calories.$lte = maxCalories;
    }

    // Protein range filter
    if (minProtein !== undefined || maxProtein !== undefined) {
      searchQuery.protein = {};
      if (minProtein !== undefined) searchQuery.protein.$gte = minProtein;
      if (maxProtein !== undefined) searchQuery.protein.$lte = maxProtein;
    }

    // Fat range filter
    if (minFat !== undefined || maxFat !== undefined) {
      searchQuery.fat = {};
      if (minFat !== undefined) searchQuery.fat.$gte = minFat;
      if (maxFat !== undefined) searchQuery.fat.$lte = maxFat;
    }

    // Carbs range filter
    if (minCarbs !== undefined || maxCarbs !== undefined) {
      searchQuery.carbs = {};
      if (minCarbs !== undefined) searchQuery.carbs.$gte = minCarbs;
      if (maxCarbs !== undefined) searchQuery.carbs.$lte = maxCarbs;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }

    const [data, total] = await Promise.all([
      Meal.find(searchQuery)
        .populate('tags', 'name category color')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments(searchQuery)
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealStats(): Promise<any> {
    try {
      const stats = await Meal.getMealStats();
      return stats[0] || {
        totalMeals: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        averageCalories: 0,
        averageProtein: 0,
        averageFat: 0,
        averageCarbs: 0
      };
    } catch (error) {
      throw new Error('Failed to get meal statistics');
    }
  }

  public async getMealsByCalorieRange(minCalories: number, maxCalories: number, page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.find({ calories: { $gte: minCalories, $lte: maxCalories } })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments({ calories: { $gte: minCalories, $lte: maxCalories } })
    ]); 

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealsByProteinRange(minProtein: number, maxProtein: number, page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.find({ protein: { $gte: minProtein, $lte: maxProtein } })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments({ protein: { $gte: minProtein, $lte: maxProtein } })
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealsByFatRange(minFat: number, maxFat: number, page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.find({ fat: { $gte: minFat, $lte: maxFat } })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments({ fat: { $gte: minFat, $lte: maxFat } })
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealsByCarbsRange(minCarbs: number, maxCarbs: number, page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.find({ carbs: { $gte: minCarbs, $lte: maxCarbs } })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Meal.countDocuments({ carbs: { $gte: minCarbs, $lte: maxCarbs } })
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getMealInfo(mealId: string): Promise<any> {
    try {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        throw new Error('Meal not found');
      }

      const info = await (meal as any).getMealInfo();
      return info;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get meal info: ${error.message}`);
      }
      throw new Error('Failed to get meal info');
    }
  }

  public async getMealsByTags(tags: string[], page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Meal.findByTags(tags, page, limit)
        .then(results => results.map(result => result.toObject())),
      Meal.countDocuments({ tags: { $in: tags } })
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getAllTags(): Promise<any[]> {
    try {
      // Import Tag model dynamically to avoid circular dependency
      const Tag = (await import('../models/TagSchema')).default;
      const tags = await Tag.find({ isActive: true })
        .select('name category color')
        .sort({ name: 1 })
        .lean();
      return tags;
    } catch (error) {
      throw new Error('Failed to get all tags');
    }
  }

  public async getTagsByCategory(category: string): Promise<any[]> {
    try {
      // Import Tag model dynamically to avoid circular dependency
      const Tag = (await import('../models/TagSchema')).default;
      const tags = await Tag.find({ 
        category: { $regex: category, $options: 'i' },
        isActive: true 
      })
        .select('name category color')
        .sort({ name: 1 })
        .lean();
      return tags;
    } catch (error) {
      throw new Error('Failed to get tags by category');
    }
  }

  public async getMealsByUser(userId: string, page: number = 1, limit: number = 10): Promise<{ data: IMeal[], total: number, page: number, pages: number }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        Meal.find({ user: userId })
          .populate('tags', 'name category color')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Meal.countDocuments({ user: userId })
      ]);

      return {
        data,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error('Failed to get meals by user');
    }
  }
}
