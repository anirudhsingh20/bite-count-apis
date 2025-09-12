import { Request, Response } from 'express';

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
  // GET /api/v1/meals/types - Get available meal types
  public getMealTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const mealTypes = [
        'breakfast',
        'lunch', 
        'snack',
        'dinner',
      ];

      res.status(200).json({
        success: true,
        data: mealTypes,
        message: 'Meal types retrieved successfully'
      });
    } catch (error) {
      throw new AppError('Failed to get meal types');
    }
  };
}
