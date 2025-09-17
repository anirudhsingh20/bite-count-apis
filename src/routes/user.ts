import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// GET /api/v1/users - Get all users (admin only)
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

// GET /api/v1/users/:id - Get user by ID (authenticated users)
router.get('/:id', authenticate, userController.getUserById);

// GET /api/v1/users/email/:email - Get user by email (admin only)
router.get(
  '/email/:email',
  authenticate,
  requireAdmin,
  userController.getUserByEmail
);

// POST /api/v1/users - Create new user (admin only)
router.post('/', authenticate, requireAdmin, userController.createUser);

// PUT /api/v1/users/:id - Update user (authenticated users can update their own profile)
router.put('/:id', authenticate, userController.updateUser);

// DELETE /api/v1/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

// GET /api/v1/users/search - Search users (admin only)
router.get('/search', authenticate, requireAdmin, userController.searchUsers);

// GET /api/v1/users/:id/info - Get user detailed info (authenticated users)
router.get('/:id/info', authenticate, userController.getUserInfo);

// GET /api/v1/users/active - Get active users (admin only)
router.get(
  '/active',
  authenticate,
  requireAdmin,
  userController.getActiveUsers
);

export default router;
