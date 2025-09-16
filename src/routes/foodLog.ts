import { Router } from 'express';
import { FoodLogController } from '../controllers/foodLogController';

const router = Router();
const foodLogController = new FoodLogController();

// Basic CRUD operations
// POST /api/v1/food-logs - Create new food log entry
router.post('/', foodLogController.createFoodLog);

// POST /api/v1/food-logs/bulk - Create multiple food log entries at once
router.post('/bulk', foodLogController.createBulkFoodLog);

// GET /api/v1/food-logs/:id - Get food log by ID
router.get('/:id', foodLogController.getFoodLogById);

// PUT /api/v1/food-logs/:id - Update food log
router.put('/:id', foodLogController.updateFoodLog);

// DELETE /api/v1/food-logs/:id - Delete food log
router.delete('/:id', foodLogController.deleteFoodLog);

// User-specific operations
// GET /api/v1/food-logs/user/:userId - Get all food logs for a user
router.get('/user/:userId', foodLogController.getFoodLogsByUser);

// GET /api/v1/food-logs/recent/:userId - Get recent food logs for a user
router.get('/recent/:userId', foodLogController.getRecentFoodLogs);

// Search and filter operations
// GET /api/v1/food-logs/search - Search food logs with filters
router.get('/search', foodLogController.searchFoodLogs);

// GET /api/v1/food-logs/meal-type/:userId/:mealType - Get food logs by meal type
router.get('/meal-type/:userId/:mealType', foodLogController.getFoodLogsByMealType);

// Nutrition tracking and analytics
// GET /api/v1/food-logs/daily-nutrition/:userId - Get daily nutrition summary
router.get('/daily-nutrition/:userId', foodLogController.getDailyNutritionSummary);

// GET /api/v1/food-logs/nutrition-range/:userId - Get nutrition summary for date range
router.get('/nutrition-range/:userId', foodLogController.getNutritionSummaryRange);

// GET /api/v1/food-logs/weekly-trend/:userId - Get weekly nutrition trend
router.get('/weekly-trend/:userId', foodLogController.getWeeklyNutritionTrend);

// GET /api/v1/food-logs/monthly-trend/:userId - Get monthly nutrition trend
router.get('/monthly-trend/:userId', foodLogController.getMonthlyNutritionTrend);

// Statistics
// GET /api/v1/food-logs/stats/:userId - Get food log statistics
router.get('/stats/:userId', foodLogController.getFoodLogStats);

// Utility endpoints
// GET /api/v1/food-logs/meal-types - Get available meal types
router.get('/meal-types', foodLogController.getMealTypes);

export default router;
