import { Request, Response } from 'express';
import { TagService } from '../services/tagService';

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

export class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  // GET /api/v1/tags
  public getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.tagService.getAllTags(page, limit);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit
        }
      });
    } catch (error) {
      throw new AppError('Failed to fetch tags');
    }
  };

  // GET /api/v1/tags/:id
  public getTagById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tag = await this.tagService.getTagById(id);
      
      if (!tag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tag
      });
    } catch (error) {
      throw new AppError('Failed to fetch tag');
    }
  };

  // POST /api/v1/tags
  public createTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagData = req.body;
      
      // Basic validation
      if (!tagData.name) {
        res.status(400).json({
          success: false,
          message: 'Tag name is required'
        });
        return;
      }

      if (tagData.name.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Tag name must be at least 2 characters long'
        });
        return;
      }

      if (tagData.name.length > 50) {
        res.status(400).json({
          success: false,
          message: 'Tag name cannot exceed 50 characters'
        });
        return;
      }

      // Validate color format if provided
      if (tagData.color && !/^#[0-9A-Fa-f]{6}$/.test(tagData.color)) {
        res.status(400).json({
          success: false,
          message: 'Color must be a valid hex color code (e.g., #FF5733)'
        });
        return;
      }

      const newTag = await this.tagService.createTag(tagData);
      
      res.status(201).json({
        success: true,
        data: newTag,
        message: 'Tag created successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message
          });
          return;
        }
        if (error.message.includes('validation failed')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }
      throw new AppError('Failed to create tag');
    }
  };

  // PUT /api/v1/tags/:id
  public updateTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Validate name length if provided
      if (updateData.name) {
        if (updateData.name.length < 2) {
          res.status(400).json({
            success: false,
            message: 'Tag name must be at least 2 characters long'
          });
          return;
        }
        if (updateData.name.length > 50) {
          res.status(400).json({
            success: false,
            message: 'Tag name cannot exceed 50 characters'
          });
          return;
        }
      }

      // Validate color format if provided
      if (updateData.color && !/^#[0-9A-Fa-f]{6}$/.test(updateData.color)) {
        res.status(400).json({
          success: false,
          message: 'Color must be a valid hex color code (e.g., #FF5733)'
        });
        return;
      }
      
      const updatedTag = await this.tagService.updateTag(id, updateData);
      
      if (!updatedTag) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedTag,
        message: 'Tag updated successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            success: false,
            message: error.message
          });
          return;
        }
        if (error.message.includes('validation failed')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
          return;
        }
      }
      throw new AppError('Failed to update tag');
    }
  };

  // DELETE /api/v1/tags/:id
  public deleteTag = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.tagService.deleteTag(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tag deleted successfully'
      });
    } catch (error) {
      throw new AppError('Failed to delete tag');
    }
  };

  // GET /api/v1/tags/search
  public searchTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        q: query, 
        category,
        isActive,
        page, 
        limit 
      } = req.query;
      
      const result = await this.tagService.searchTags({
        query: query as string,
        category: category as string,
        isActive: isActive ? isActive === 'true' : undefined,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10
      });
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          pages: result.pages,
          total: result.total,
          limit: parseInt(limit as string) || 10
        }
      });
    } catch (error) {
      throw new AppError('Failed to search tags');
    }
  };

  // GET /api/v1/tags/stats
  public getTagStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.tagService.getTagStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw new AppError('Failed to fetch tag statistics');
    }
  };

  // GET /api/v1/tags/active
  public getActiveTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const tags = await this.tagService.getActiveTags();
      
      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      throw new AppError('Failed to fetch active tags');
    }
  };

  // GET /api/v1/tags/category/:category
  public getTagsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const tags = await this.tagService.getTagsByCategory(category);
      
      res.status(200).json({
        success: true,
        data: tags
      });
    } catch (error) {
      throw new AppError('Failed to fetch tags by category');
    }
  };

  // GET /api/v1/tags/:id/info
  public getTagInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const info = await this.tagService.getTagInfo(id);
      
      res.status(200).json({
        success: true,
        data: info
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Tag not found'
        });
        return;
      }
      throw new AppError('Failed to fetch tag info');
    }
  };
}
