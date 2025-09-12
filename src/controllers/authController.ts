import { Request, Response } from 'express';
import User from '../models/UserSchema';
import { AuthUtils } from '../utils/auth';

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

export class AuthController {
  // POST /api/v1/auth/register
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });

      await user.save();

      // Generate tokens
      const token = AuthUtils.generateToken(user);
      const refreshToken = AuthUtils.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token,
          refreshToken
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Registration failed: ${error.message}`);
      }
      throw new AppError('Registration failed');
    }
  };

  // POST /api/v1/auth/login
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Find user and include password for comparison
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check password
      const isPasswordValid = await (user as any).comparePassword(password);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Generate tokens
      const token = AuthUtils.generateToken(user);
      const refreshToken = AuthUtils.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
          refreshToken
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Login failed: ${error.message}`);
      }
      throw new AppError('Login failed');
    }
  };

  // POST /api/v1/auth/refresh
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // Verify refresh token
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      
      // Get user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Generate new tokens
      const newToken = AuthUtils.generateToken(user);
      const newRefreshToken = AuthUtils.generateRefreshToken(user);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  };

  // POST /api/v1/auth/logout
  public logout = async (req: Request, res: Response): Promise<void> => {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  };

  // GET /api/v1/auth/me
  public getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      // User is attached to request by auth middleware
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      throw new AppError('Failed to get user profile');
    }
  };

  // POST /api/v1/auth/forgot-password
  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate password reset token
      const resetToken = AuthUtils.generatePasswordResetToken(user);
      
      // In a real app, you would send this token via email
      // For now, we'll just return it (remove this in production!)
      res.status(200).json({
        success: true,
        message: 'Password reset token generated',
        data: {
          resetToken // Remove this in production!
        }
      });
    } catch (error) {
      throw new AppError('Failed to process password reset request');
    }
  };

  // POST /api/v1/auth/reset-password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({
          success: false,
          message: 'Token and password are required'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Verify reset token
      const decoded = AuthUtils.verifyPasswordResetToken(token);
      
      // Get user
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired token'
        });
        return;
      }

      // Update password (will be hashed by pre-save middleware)
      user.password = password;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  };

  // POST /api/v1/auth/change-password
  public changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
        return;
      }

      // Get user with password for comparison
      const userWithPassword = await User.findById(user._id).select('+password');
      
      if (!userWithPassword) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await (userWithPassword as any).comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      // Update password (will be hashed by pre-save middleware)
      userWithPassword.password = newPassword;
      await userWithPassword.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Password change failed: ${error.message}`);
      }
      throw new AppError('Password change failed');
    }
  };
}
