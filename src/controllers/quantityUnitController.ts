import { Request, Response } from 'express';
import { QuantityUnitService } from '../services/quantityUnitService';
import {
  CreateQuantityUnitRequest,
  UpdateQuantityUnitRequest,
  QuantityUnitSearchParams,
} from '../models/QuantityUnit';

const quantityUnitService = new QuantityUnitService();

export class QuantityUnitController {
  public async createQuantityUnit(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateQuantityUnitRequest = req.body;

      // Validate required fields
      if (!data.name || !data.shortName || data.defaultValue === undefined || 
          data.incrementValue === undefined) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, shortName, defaultValue, incrementValue',
        });
        return;
      }

      // Validate data types
      if (typeof data.name !== 'string' || typeof data.shortName !== 'string' ||
          typeof data.defaultValue !== 'number' || typeof data.incrementValue !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Invalid data types for required fields',
        });
        return;
      }

      // Validate numeric values
      if (data.defaultValue < 0 || data.incrementValue < 0.1) {
        res.status(400).json({
          success: false,
          message: 'defaultValue must be >= 0 and incrementValue must be >= 0.1',
        });
        return;
      }


      const quantityUnit = await quantityUnitService.createQuantityUnit(data);

      res.status(201).json({
        success: true,
        data: quantityUnit,
        message: 'Quantity unit created successfully',
      });
    } catch (error) {
      console.error('Error creating quantity unit:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create quantity unit',
      });
    }
  }

  public async getQuantityUnitById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Quantity unit ID is required',
        });
        return;
      }

      const quantityUnit = await quantityUnitService.getQuantityUnitById(id);

      if (!quantityUnit) {
        res.status(404).json({
          success: false,
          message: 'Quantity unit not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quantityUnit,
      });
    } catch (error) {
      console.error('Error fetching quantity unit:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch quantity unit',
      });
    }
  }

  public async updateQuantityUnit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateQuantityUnitRequest = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Quantity unit ID is required',
        });
        return;
      }

      // Validate data types if provided
      if (data.name !== undefined && typeof data.name !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Name must be a string',
        });
        return;
      }

      if (data.shortName !== undefined && typeof data.shortName !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Short name must be a string',
        });
        return;
      }

      if (data.defaultValue !== undefined && (typeof data.defaultValue !== 'number' || data.defaultValue < 0)) {
        res.status(400).json({
          success: false,
          message: 'Default value must be a number >= 0',
        });
        return;
      }

      if (data.incrementValue !== undefined && (typeof data.incrementValue !== 'number' || data.incrementValue < 0.1)) {
        res.status(400).json({
          success: false,
          message: 'Increment value must be a number >= 0.1',
        });
        return;
      }


      const updatedUnit = await quantityUnitService.updateQuantityUnit(id, data);

      if (!updatedUnit) {
        res.status(404).json({
          success: false,
          message: 'Quantity unit not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUnit,
        message: 'Quantity unit updated successfully',
      });
    } catch (error) {
      console.error('Error updating quantity unit:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update quantity unit',
      });
    }
  }

  public async deleteQuantityUnit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Quantity unit ID is required',
        });
        return;
      }

      const deleted = await quantityUnitService.deleteQuantityUnit(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Quantity unit not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Quantity unit deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting quantity unit:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete quantity unit',
      });
    }
  }

  public async getAllQuantityUnits(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid page or limit parameters',
        });
        return;
      }

      const result = await quantityUnitService.getAllQuantityUnits(page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit,
        },
      });
    } catch (error) {
      console.error('Error fetching quantity units:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch quantity units',
      });
    }
  }

  public async searchQuantityUnits(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        shortName,
        page = 1,
        limit = 10,
      } = req.query;

      const searchParams: QuantityUnitSearchParams = {
        name: name as string,
        shortName: shortName as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      };

      if ((searchParams.page || 1) < 1 || (searchParams.limit || 10) < 1 || (searchParams.limit || 10) > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid page or limit parameters',
        });
        return;
      }

      const result = await quantityUnitService.searchQuantityUnits(searchParams);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: searchParams.limit,
        },
      });
    } catch (error) {
      console.error('Error searching quantity units:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search quantity units',
      });
    }
  }


  public async getQuantityUnitByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Unit name is required',
        });
        return;
      }

      const quantityUnit = await quantityUnitService.getQuantityUnitByName(name);

      if (!quantityUnit) {
        res.status(404).json({
          success: false,
          message: 'Quantity unit not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quantityUnit,
      });
    } catch (error) {
      console.error('Error fetching quantity unit by name:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch quantity unit by name',
      });
    }
  }

  public async getQuantityUnitByShortName(req: Request, res: Response): Promise<void> {
    try {
      const { shortName } = req.params;

      if (!shortName) {
        res.status(400).json({
          success: false,
          message: 'Unit short name is required',
        });
        return;
      }

      const quantityUnit = await quantityUnitService.getQuantityUnitByShortName(shortName);

      if (!quantityUnit) {
        res.status(404).json({
          success: false,
          message: 'Quantity unit not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: quantityUnit,
      });
    } catch (error) {
      console.error('Error fetching quantity unit by short name:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch quantity unit by short name',
      });
    }
  }

  public async getQuantityUnitStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await quantityUnitService.getQuantityUnitStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching quantity unit stats:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch quantity unit statistics',
      });
    }
  }
}
