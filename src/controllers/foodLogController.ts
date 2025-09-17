import { Request, Response } from 'express';
import {
  CreateBulkFoodLogRequest,
  CreateFoodLogRequest,
  UpdateFoodLogRequest,
} from '../models/FoodLog';
import { FoodLogService } from '../services/foodLogService';

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

export class FoodLogController {
  private foodLogService: FoodLogService;

  constructor() {
    this.foodLogService = new FoodLogService();
  }

  // POST /api/v1/food-logs
  public createFoodLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const foodLogData: CreateFoodLogRequest = req.body;

      // Basic validation
      if (
        !foodLogData.user ||
        !foodLogData.meal ||
        !foodLogData.mealType ||
        foodLogData.quantity === undefined
      ) {
        res.status(400).json({
          success: false,
          message: 'User, meal, meal type, and quantity are required',
        });
        return;
      }

      // Validate meal type
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(foodLogData.mealType)) {
        res.status(400).json({
          success: false,
          message: 'Meal type must be one of: breakfast, lunch, dinner, snack',
        });
        return;
      }

      // Validate quantity
      if (foodLogData.quantity <= 0 || foodLogData.quantity > 100) {
        res.status(400).json({
          success: false,
          message: 'Quantity must be between 0.1 and 100',
        });
        return;
      }

      // Validate notes length if provided
      if (foodLogData.notes && foodLogData.notes.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Notes cannot exceed 500 characters',
        });
        return;
      }

      const newFoodLog = await this.foodLogService.createFoodLog(foodLogData);

      res.status(201).json({
        success: true,
        data: newFoodLog,
        message: 'Food log created successfully',
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
      throw new AppError('Failed to create food log');
    }
  };

  // POST /api/v1/food-logs/bulk
  public createBulkFoodLog = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const bulkLogData: CreateBulkFoodLogRequest = req.body;

      // Basic validation
      if (!bulkLogData.user || !bulkLogData.mealType || !bulkLogData.items) {
        res.status(400).json({
          success: false,
          message: 'User, meal type, and items are required',
        });
        return;
      }

      // Validate meal type
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(bulkLogData.mealType)) {
        res.status(400).json({
          success: false,
          message: 'Meal type must be one of: breakfast, lunch, dinner, snack',
        });
        return;
      }

      // Validate items array
      if (!Array.isArray(bulkLogData.items) || bulkLogData.items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Items must be a non-empty array',
        });
        return;
      }

      if (bulkLogData.items.length > 20) {
        res.status(400).json({
          success: false,
          message: 'Cannot log more than 20 items at once',
        });
        return;
      }

      // Validate each item
      for (let i = 0; i < bulkLogData.items.length; i++) {
        const item = bulkLogData.items[i];

        if (!item.meal || item.quantity === undefined) {
          res.status(400).json({
            success: false,
            message: `Item ${i + 1}: meal and quantity are required`,
          });
          return;
        }

        if (item.quantity <= 0 || item.quantity > 100) {
          res.status(400).json({
            success: false,
            message: `Item ${i + 1}: quantity must be between 0.1 and 100`,
          });
          return;
        }

        if (item.notes && item.notes.length > 500) {
          res.status(400).json({
            success: false,
            message: `Item ${i + 1}: notes cannot exceed 500 characters`,
          });
          return;
        }
      }

      // Validate general notes length if provided
      if (bulkLogData.notes && bulkLogData.notes.length > 500) {
        res.status(400).json({
          success: false,
          message: 'General notes cannot exceed 500 characters',
        });
        return;
      }

      const result = await this.foodLogService.createBulkFoodLog(bulkLogData);

      res.status(201).json(result);
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
      throw new AppError('Failed to create bulk food log');
    }
  };

  // GET /api/v1/food-logs/:id
  public getFoodLogById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const foodLog = await this.foodLogService.getFoodLogById(id);

      if (!foodLog) {
        res.status(404).json({
          success: false,
          message: 'Food log not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: foodLog,
      });
    } catch (_) {
      throw new AppError('Failed to fetch food log');
    }
  };

  // PUT /api/v1/food-logs/:id
  public updateFoodLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateFoodLogRequest = req.body;

      // Validate meal type if provided
      if (updateData.mealType) {
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        if (!validMealTypes.includes(updateData.mealType)) {
          res.status(400).json({
            success: false,
            message:
              'Meal type must be one of: breakfast, lunch, dinner, snack',
          });
          return;
        }
      }

      // Validate quantity if provided
      if (updateData.quantity !== undefined) {
        if (updateData.quantity <= 0 || updateData.quantity > 100) {
          res.status(400).json({
            success: false,
            message: 'Quantity must be between 0.1 and 100',
          });
          return;
        }
      }

      // Validate notes length if provided
      if (updateData.notes && updateData.notes.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Notes cannot exceed 500 characters',
        });
        return;
      }

      const updatedFoodLog = await this.foodLogService.updateFoodLog(
        id,
        updateData
      );

      if (!updatedFoodLog) {
        res.status(404).json({
          success: false,
          message: 'Food log not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedFoodLog,
        message: 'Food log updated successfully',
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
      throw new AppError('Failed to update food log');
    }
  };

  // DELETE /api/v1/food-logs/:id
  public deleteFoodLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.foodLogService.deleteFoodLog(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Food log not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Food log deleted successfully',
      });
    } catch (_) {
      throw new AppError('Failed to delete food log');
    }
  };

  // GET /api/v1/food-logs/user/:userId
  public getFoodLogsByUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 200;
      const startDate = req.query.startDate
        ? parseInt(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? parseInt(req.query.endDate as string)
        : undefined;

      // Validate date parameters
      if (req.query.startDate && (isNaN(startDate!) || startDate! < 0)) {
        res.status(400).json({
          success: false,
          message: 'Invalid start date format. Expected epoch timestamp.',
        });
        return;
      }

      if (req.query.endDate && (isNaN(endDate!) || endDate! < 0)) {
        res.status(400).json({
          success: false,
          message: 'Invalid end date format. Expected epoch timestamp.',
        });
        return;
      }

      if (startDate && endDate && startDate > endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date must be before end date',
        });
        return;
      }

      const result = await this.foodLogService.getFoodLogsByUser(
        userId,
        page,
        limit,
        startDate,
        endDate
      );
      const response = {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getFoodLogsByUser controller:', error);
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user food logs',
      });
    }
  };

  // GET /api/v1/food-logs/search
  public searchFoodLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId, mealType, startDate, endDate, page, limit } = req.query;

      const searchParams = {
        userId: userId as string,
        mealType: mealType as
          | 'breakfast'
          | 'lunch'
          | 'dinner'
          | 'snack'
          | undefined,
        startDate: startDate ? parseInt(startDate as string) : undefined,
        endDate: endDate ? parseInt(endDate as string) : undefined,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      };

      const result = await this.foodLogService.searchFoodLogs(searchParams);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit: searchParams.limit,
        },
      });
    } catch (_) {
      throw new AppError('Failed to search food logs');
    }
  };

  // GET /api/v1/food-logs/daily-nutrition/:userId
  public getDailyNutritionSummary = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const targetDate = date ? parseInt(date as string) : Date.now();

      if (isNaN(targetDate) || targetDate < 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected epoch timestamp.',
        });
        return;
      }

      const summary = await this.foodLogService.getDailyNutritionSummary(
        userId,
        targetDate
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (_) {
      throw new AppError('Failed to fetch daily nutrition summary');
    }
  };

  // GET /api/v1/food-logs/nutrition-range/:userId
  public getNutritionSummaryRange = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const start = parseInt(startDate as string);
      const end = parseInt(endDate as string);

      if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Expected epoch timestamps.',
        });
        return;
      }

      if (start > end) {
        res.status(400).json({
          success: false,
          message: 'Start date must be before end date',
        });
        return;
      }

      const summaries = await this.foodLogService.getNutritionSummaryRange(
        userId,
        start,
        end
      );

      res.status(200).json({
        success: true,
        data: summaries,
      });
    } catch (_) {
      throw new AppError('Failed to fetch nutrition summary range');
    }
  };

  // GET /api/v1/food-logs/meal-type/:userId/:mealType
  public getFoodLogsByMealType = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId, mealType } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(mealType)) {
        res.status(400).json({
          success: false,
          message:
            'Invalid meal type. Must be one of: breakfast, lunch, dinner, snack',
        });
        return;
      }

      const result = await this.foodLogService.getFoodLogsByMealType(
        userId,
        mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
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
      throw new AppError('Failed to fetch food logs by meal type');
    }
  };

  // GET /api/v1/food-logs/recent/:userId
  public getRecentFoodLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;

      const foodLogs = await this.foodLogService.getRecentFoodLogs(
        userId,
        limit
      );

      res.status(200).json({
        success: true,
        data: foodLogs,
      });
    } catch (_) {
      throw new AppError('Failed to fetch recent food logs');
    }
  };

  // GET /api/v1/food-logs/stats/:userId
  public getFoodLogStats = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const stats = await this.foodLogService.getFoodLogStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (_) {
      throw new AppError('Failed to fetch food log statistics');
    }
  };

  // GET /api/v1/food-logs/weekly-trend/:userId
  public getWeeklyNutritionTrend = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const weeks = parseInt(req.query.weeks as string) || 4;

      const trend = await this.foodLogService.getWeeklyNutritionTrend(
        userId,
        weeks
      );

      res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (_) {
      throw new AppError('Failed to fetch weekly nutrition trend');
    }
  };

  // GET /api/v1/food-logs/monthly-trend/:userId
  public getMonthlyNutritionTrend = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const months = parseInt(req.query.months as string) || 6;

      const trend = await this.foodLogService.getMonthlyNutritionTrend(
        userId,
        months
      );

      res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (_) {
      throw new AppError('Failed to fetch monthly nutrition trend');
    }
  };

  // GET /api/v1/food-logs/meal-types
  public getMealTypes = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: ['breakfast', 'lunch', 'dinner', 'snack'],
    });
  };
}
