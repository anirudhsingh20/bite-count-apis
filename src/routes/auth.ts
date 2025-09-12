import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// POST /api/v1/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/v1/auth/login - Login user
router.post('/login', authController.login);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// POST /api/v1/auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /api/v1/auth/me - Get current user profile
router.get('/me', authenticate, authController.getMe);

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', authController.resetPassword);

// POST /api/v1/auth/change-password - Change password (authenticated users)
router.post('/change-password', authenticate, authController.changePassword);

export default router;
