import { Request, Response } from 'express';
import { MealService } from '../services/mealService';
import { CreateMealRequest, UpdateMealRequest } from '../models/Meal';

class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class MealController {
  private mealService: MealService;

  constructor() {
    this.mealService = new MealService();
  }

  // GET /api/v1/meals
  public getAllMeals = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.mealService.getAllMeals(page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals');
    }
  };

  // GET /api/v1/meals/:id
  public getMealById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const meal = await this.mealService.getMealById(id);

      if (!meal) {
        res.status(404).json({
          success: false,
          message: 'Meal not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: meal,
      });
    } catch (_) {
      throw new AppError('Failed to fetch meal');
    }
  };

  // POST /api/v1/meals
  public createMeal = async (req: Request, res: Response): Promise<void> => {
    try {
      const mealData: CreateMealRequest = req.body;

      // Basic validation
      if (
        !mealData.name ||
        mealData.protein === undefined ||
        mealData.calories === undefined ||
        !mealData.servingSize
      ) {
        res.status(400).json({
          success: false,
          message: 'Name, protein, calories, and serving size are required',
        });
        return;
      }

      // Validate numeric values
      if (mealData.protein < 0 || mealData.calories < 0) {
        res.status(400).json({
          success: false,
          message: 'Protein and calories cannot be negative',
        });
        return;
      }

      // Validate optional fat and carbs if provided
      if (mealData.fat !== undefined && mealData.fat < 0) {
        res.status(400).json({
          success: false,
          message: 'Fat cannot be negative',
        });
        return;
      }

      if (mealData.carbs !== undefined && mealData.carbs < 0) {
        res.status(400).json({
          success: false,
          message: 'Carbs cannot be negative',
        });
        return;
      }

      // Validate emoji if provided
      if (mealData.emoji) {
        const emojiRegex =
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        if (!emojiRegex.test(mealData.emoji)) {
          res.status(400).json({
            success: false,
            message: 'Emoji must be a valid emoji character',
          });
          return;
        }
      }

      // Tags are validated by the schema (must be valid ObjectIds)

      const newMeal = await this.mealService.createMeal(mealData);

      res.status(201).json({
        success: true,
        data: newMeal,
        message: 'Meal created successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('validation failed')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      throw new AppError('Failed to create meal');
    }
  };

  // PUT /api/v1/meals/:id
  public updateMeal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateMealRequest = req.body;

      // Validate numeric values if provided
      if (updateData.protein !== undefined && updateData.protein < 0) {
        res.status(400).json({
          success: false,
          message: 'Protein cannot be negative',
        });
        return;
      }
      if (updateData.calories !== undefined && updateData.calories < 0) {
        res.status(400).json({
          success: false,
          message: 'Calories cannot be negative',
        });
        return;
      }
      if (updateData.fat !== undefined && updateData.fat < 0) {
        res.status(400).json({
          success: false,
          message: 'Fat cannot be negative',
        });
        return;
      }
      if (updateData.carbs !== undefined && updateData.carbs < 0) {
        res.status(400).json({
          success: false,
          message: 'Carbs cannot be negative',
        });
        return;
      }

      // Validate emoji if provided
      if (updateData.emoji) {
        const emojiRegex =
          /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
        if (!emojiRegex.test(updateData.emoji)) {
          res.status(400).json({
            success: false,
            message: 'Emoji must be a valid emoji character',
          });
          return;
        }
      }

      // Tags are validated by the schema (must be valid ObjectIds)

      const updatedMeal = await this.mealService.updateMeal(id, updateData);

      if (!updatedMeal) {
        res.status(404).json({
          success: false,
          message: 'Meal not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedMeal,
        message: 'Meal updated successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('validation failed')) {
          res.status(400).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      throw new AppError('Failed to update meal');
    }
  };

  // DELETE /api/v1/meals/:id
  public deleteMeal = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.mealService.deleteMeal(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Meal not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Meal deleted successfully',
      });
    } catch (_) {
      throw new AppError('Failed to delete meal');
    }
  };

  // GET /api/v1/meals/search
  public searchMeals = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        q: query,
        minCalories,
        maxCalories,
        minProtein,
        maxProtein,
        minFat,
        maxFat,
        minCarbs,
        maxCarbs,
        tags,
        page,
        limit,
      } = req.query;

      const result = await this.mealService.searchMeals({
        query: query as string,
        minCalories: minCalories ? parseInt(minCalories as string) : undefined,
        maxCalories: maxCalories ? parseInt(maxCalories as string) : undefined,
        minProtein: minProtein ? parseInt(minProtein as string) : undefined,
        maxProtein: maxProtein ? parseInt(maxProtein as string) : undefined,
        minFat: minFat ? parseInt(minFat as string) : undefined,
        maxFat: maxFat ? parseInt(maxFat as string) : undefined,
        minCarbs: minCarbs ? parseInt(minCarbs as string) : undefined,
        maxCarbs: maxCarbs ? parseInt(maxCarbs as string) : undefined,
        tags: tags
          ? Array.isArray(tags)
            ? tags.map(t => String(t))
            : [String(tags)]
          : undefined,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit: parseInt(limit as string) || 10,
        },
      });
    } catch (_) {
      throw new AppError('Failed to search meals');
    }
  };

  // GET /api/v1/meals/stats
  public getMealStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.mealService.getMealStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (_) {
      throw new AppError('Failed to fetch meal statistics');
    }
  };

  // GET /api/v1/meals/calories/:min/:max
  public getMealsByCalorieRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { min, max } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const minCalories = parseInt(min);
      const maxCalories = parseInt(max);

      if (isNaN(minCalories) || isNaN(maxCalories)) {
        res.status(400).json({
          success: false,
          message: 'Invalid calorie range values',
        });
        return;
      }

      const result = await this.mealService.getMealsByCalorieRange(
        minCalories,
        maxCalories,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals by calorie range');
    }
  };

  // GET /api/v1/meals/protein/:min/:max
  public getMealsByProteinRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { min, max } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const minProtein = parseInt(min);
      const maxProtein = parseInt(max);

      if (isNaN(minProtein) || isNaN(maxProtein)) {
        res.status(400).json({
          success: false,
          message: 'Invalid protein range values',
        });
        return;
      }

      const result = await this.mealService.getMealsByProteinRange(
        minProtein,
        maxProtein,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals by protein range');
    }
  };

  // GET /api/v1/meals/fat/:min/:max
  public getMealsByFatRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { min, max } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const minFat = parseInt(min);
      const maxFat = parseInt(max);

      if (isNaN(minFat) || isNaN(maxFat)) {
        res.status(400).json({
          success: false,
          message: 'Invalid fat range values',
        });
        return;
      }

      const result = await this.mealService.getMealsByFatRange(
        minFat,
        maxFat,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals by fat range');
    }
  };

  // GET /api/v1/meals/carbs/:min/:max
  public getMealsByCarbsRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { min, max } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const minCarbs = parseInt(min);
      const maxCarbs = parseInt(max);

      if (isNaN(minCarbs) || isNaN(maxCarbs)) {
        res.status(400).json({
          success: false,
          message: 'Invalid carbs range values',
        });
        return;
      }

      const result = await this.mealService.getMealsByCarbsRange(
        minCarbs,
        maxCarbs,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals by carbs range');
    }
  };

  // GET /api/v1/meals/:id/info
  public getMealInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const info = await this.mealService.getMealInfo(id);

      res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Meal not found',
        });
        return;
      }
      throw new AppError('Failed to fetch meal info');
    }
  };

  // GET /api/v1/meals/tags
  public getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await this.mealService.getAllTags();

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (_) {
      throw new AppError('Failed to fetch tags');
    }
  };

  // GET /api/v1/meals/tags/:tags
  public getMealsByTags = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { tags } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Split tags by comma and trim whitespace
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (tagArray.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one tag is required',
        });
        return;
      }

      const result = await this.mealService.getMealsByTags(
        tagArray,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to fetch meals by tags');
    }
  };

  public getMealsByUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.mealService.getMealsByUser(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to get meals by user');
    }
  };
}
