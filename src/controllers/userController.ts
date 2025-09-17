import { Request, Response } from 'express';
import { UserService } from '../services/userService';

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

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/v1/users
  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.userService.getAllUsers(page, limit);

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
      throw new AppError('Failed to fetch users');
    }
  };

  // GET /api/v1/users/:id
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (_) {
      throw new AppError('Failed to fetch user');
    }
  };

  // GET /api/v1/users/email/:email
  public getUserByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (_) {
      throw new AppError('Failed to fetch user by email');
    }
  };

  // POST /api/v1/users
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;

      // Basic validation
      if (!userData.name || !userData.email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required',
        });
        return;
      }

      const newUser = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      });
    } catch (_) {
      if (error instanceof Error) {
        if (
          error.message.includes('already exists') ||
          error.message.includes('already taken')
        ) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      throw new AppError('Failed to create user');
    }
  };

  // PUT /api/v1/users/:id
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      // Users can only update their own profile unless they're admin
      if (currentUser._id.toString() !== id && !this.isAdmin(currentUser)) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile',
        });
        return;
      }

      const updatedUser = await this.userService.updateUser(id, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (_) {
      if (error instanceof Error) {
        if (error.message.includes('already taken')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }
      throw new AppError('Failed to update user');
    }
  };

  // Helper method to check if user is admin
  private isAdmin(user: any): boolean {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [
      'admin@example.com',
    ];
    return adminEmails.includes(user.email);
  }

  // DELETE /api/v1/users/:id
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (_) {
      throw new AppError('Failed to delete user');
    }
  };

  // GET /api/v1/users/search
  public searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q: query, page, limit } = req.query;

      const result = await this.userService.searchUsers({
        query: query as string,
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
      throw new AppError('Failed to search users');
    }
  };

  // GET /api/v1/users/:id/info
  public getUserInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const info = await this.userService.getUserInfo(id);

      res.status(200).json({
        success: true,
        data: info,
      });
    } catch (_) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }
      throw new AppError('Failed to fetch user info');
    }
  };

  // GET /api/v1/users/active
  public getActiveUsers = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const users = await this.userService.getActiveUsers();

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (_) {
      throw new AppError('Failed to fetch active users');
    }
  };
}
