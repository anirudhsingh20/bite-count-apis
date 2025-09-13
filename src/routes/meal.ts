import { Router } from 'express';
import { MealController } from '../controllers/mealController';

const router = Router();
const mealController = new MealController();

// Basic CRUD operations
// GET /api/v1/meals - Get all meals with pagination
router.get('/', mealController.getAllMeals);

// GET /api/v1/meals/:id - Get meal by ID
router.get('/:id', mealController.getMealById);

// POST /api/v1/meals - Create new meal
router.post('/', mealController.createMeal);

// PUT /api/v1/meals/:id - Update meal
router.put('/:id', mealController.updateMeal);

// DELETE /api/v1/meals/:id - Delete meal
router.delete('/:id', mealController.deleteMeal);

// Search and filter operations
// GET /api/v1/meals/search - Search meals with filters
router.get('/search', mealController.searchMeals);

// GET /api/v1/meals/stats - Get meal statistics
router.get('/stats', mealController.getMealStats);

// Range-based queries
// GET /api/v1/meals/calories/:min/:max - Get meals by calorie range
router.get('/calories/:min/:max', mealController.getMealsByCalorieRange);

// GET /api/v1/meals/protein/:min/:max - Get meals by protein range
router.get('/protein/:min/:max', mealController.getMealsByProteinRange);

// GET /api/v1/meals/fat/:min/:max - Get meals by fat range
router.get('/fat/:min/:max', mealController.getMealsByFatRange);

// GET /api/v1/meals/carbs/:min/:max - Get meals by carbs range
router.get('/carbs/:min/:max', mealController.getMealsByCarbsRange);

// Additional info endpoints
// GET /api/v1/meals/:id/info - Get detailed meal info
router.get('/:id/info', mealController.getMealInfo);

export default router;
