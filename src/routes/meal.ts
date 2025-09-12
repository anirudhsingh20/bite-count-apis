import { Router } from 'express';
import { MealController } from '../controllers/mealController';

const router = Router();
const mealController = new MealController();

// GET /api/v1/meals/types - Get available meal types
router.get('/types', mealController.getMealTypes);

export default router;
