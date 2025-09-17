import FoodLog, { IFoodLog } from '../models/FoodLogSchema';
import {
  CreateFoodLogRequest,
  UpdateFoodLogRequest,
  FoodLogSearchParams,
  DailyNutritionSummary,
  CreateBulkFoodLogRequest,
  BulkFoodLogResponse,
} from '../models/FoodLog';
import { startOfDay } from 'date-fns';

export class FoodLogService {
  // Helper method to find existing food log for same meal and log date
  private async findExistingFoodLog(
    userId: string,
    mealId: string,
    logDate: number,
    mealType?: string
  ): Promise<IFoodLog | null> {
    try {
      const query: any = {
        user: userId,
        meal: mealId,
        logDate: logDate,
      };

      // Only include meal type if specified
      if (mealType) {
        query.mealType = mealType;
      }

      const existingLog = await FoodLog.findOne(query);

      return existingLog;
    } catch (_) {
      return null;
    }
  }

  // Helper method to update existing food log quantity
  private async updateFoodLogQuantity(
    logId: string,
    newQuantity: number,
    notes?: string
  ): Promise<IFoodLog | null> {
    try {
      const updateData: any = { quantity: newQuantity };
      if (notes !== undefined) {
        updateData.notes = notes.trim();
      }

      const updatedLog = await FoodLog.findByIdAndUpdate(logId, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .populate('user', 'name email')
        .lean();

      return updatedLog;
    } catch (error) {
      throw new Error(
        `Failed to update food log quantity: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async createFoodLog(data: CreateFoodLogRequest): Promise<IFoodLog> {
    try {
      const logDate = data.logDate || startOfDay(new Date()).getTime();

      // Check if a food log already exists for the same meal, log date, and meal type
      const existingLog = await this.findExistingFoodLog(
        data.user,
        data.meal,
        logDate,
        data.mealType
      );

      if (existingLog) {
        // Update existing log with new quantity (replace, don't add)
        const updatedLog = await this.updateFoodLogQuantity(
          (existingLog._id as any).toString(),
          data.quantity,
          data.notes
        );

        if (!updatedLog) {
          throw new Error('Failed to update existing food log');
        }

        return updatedLog;
      } else {
        // Create new food log entry
        const foodLogData = {
          user: data.user,
          meal: data.meal,
          mealType: data.mealType,
          quantity: data.quantity,
          logDate: logDate,
          loggedAt: data.loggedAt || Date.now(),
          notes: data.notes?.trim(),
        };

        const newFoodLog = new FoodLog(foodLogData);
        const savedFoodLog = await newFoodLog.save();

        // Populate the meal data for response
        await savedFoodLog.populate(
          'meal',
          'name calories protein fat carbs servingSize emoji'
        );

        return savedFoodLog;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create food log: ${error.message}`);
      }
      throw new Error('Failed to create food log');
    }
  }

  public async createBulkFoodLog(
    data: CreateBulkFoodLogRequest
  ): Promise<BulkFoodLogResponse> {
    try {
      // Validate input
      if (!data.items || data.items.length === 0) {
        throw new Error('At least one food item is required');
      }

      if (data.items.length > 20) {
        throw new Error('Cannot log more than 20 items at once');
      }

      const logDate = data.logDate || startOfDay(new Date()).getTime();
      const loggedAt = data.loggedAt || Date.now();

      // Step 1: Batch find all existing food logs for the given meals, log date, and meal type
      const mealIds = data.items.map(item => item.meal);
      const existingLogs = await FoodLog.find({
        user: data.user,
        meal: { $in: mealIds },
        logDate: logDate,
        mealType: data.mealType,
      });

      // Create a map for quick lookup of existing logs by meal ID
      const existingLogsMap = new Map();
      existingLogs.forEach(log => {
        const mealId = log.meal.toString();
        existingLogsMap.set(mealId, log);
      });

      // Step 2: Separate items into updates and creates
      const itemsToUpdate: Array<{ item: any; existingLog: IFoodLog }> = [];
      const itemsToCreate: any[] = [];

      data.items.forEach(item => {
        const existingLog = existingLogsMap.get(item.meal);
        if (existingLog) {
          itemsToUpdate.push({ item, existingLog });
        } else {
          itemsToCreate.push(item);
        }
      });

      // Step 3: Batch update existing logs
      const updatedLogs: IFoodLog[] = [];
      if (itemsToUpdate.length > 0) {
        const updatePromises = itemsToUpdate.map(
          async ({ item, existingLog }) => {
            try {
              const updateData: any = { quantity: item.quantity };
              if (item.notes?.trim() || data.notes?.trim()) {
                updateData.notes = item.notes?.trim() || data.notes?.trim();
              }

              const updatedLog = await FoodLog.findByIdAndUpdate(
                existingLog._id,
                updateData,
                { new: true, runValidators: true }
              );

              if (!updatedLog) {
                throw new Error(
                  `Failed to update food log for meal ${item.meal}`
                );
              }

              return updatedLog;
            } catch (error) {
              throw new Error(
                `Failed to update food log for meal ${item.meal}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }
        );

        const updateResults = await Promise.all(updatePromises);
        const validUpdates = updateResults.filter(
          log => log !== null
        ) as IFoodLog[];

        // Populate the updated logs
        if (validUpdates.length > 0) {
          const populatedUpdates = await FoodLog.find({
            _id: { $in: validUpdates.map(log => log._id) },
          })
            .populate(
              'meal',
              'name calories protein fat carbs servingSize emoji'
            )
            .populate('user', 'name email');

          updatedLogs.push(...populatedUpdates);
        }
      }

      // Step 4: Batch create new logs
      const createdLogs: IFoodLog[] = [];
      if (itemsToCreate.length > 0) {
        const newLogsData = itemsToCreate.map(item => ({
          user: data.user,
          meal: item.meal,
          mealType: data.mealType,
          quantity: item.quantity,
          logDate: logDate,
          loggedAt: loggedAt,
          notes: item.notes?.trim() || data.notes?.trim(),
        }));

        const newLogs = await FoodLog.insertMany(newLogsData);

        // Populate the meal data for all new logs
        const populatedLogs = await FoodLog.find({
          _id: { $in: newLogs.map(log => log._id) },
        })
          .populate('meal', 'name calories protein fat carbs servingSize emoji')
          .populate('user', 'name email');

        createdLogs.push(...populatedLogs);
      }

      // Step 5: Calculate nutrition totals
      const allLogs = [...createdLogs, ...updatedLogs];
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      allLogs.forEach(log => {
        const meal = log.meal as any;
        const multiplier = log.quantity;
        totalCalories += (meal.calories || 0) * multiplier;
        totalProtein += (meal.protein || 0) * multiplier;
        totalFat += (meal.fat || 0) * multiplier;
        totalCarbs += (meal.carbs || 0) * multiplier;
      });

      const totalProcessedItems = createdLogs.length + updatedLogs.length;

      return {
        success: true,
        data: {
          createdLogs: createdLogs as any,
          updatedLogs: updatedLogs as any,
          allLogs: allLogs as any,
          totalItems: totalProcessedItems,
          newItems: createdLogs.length,
          updatedItems: updatedLogs.length,
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          mealType: data.mealType,
          logDate,
          loggedAt,
        },
        message: `Successfully processed ${totalProcessedItems} food items (${createdLogs.length} new, ${updatedLogs.length} updated)`,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create bulk food log: ${error.message}`);
      }
      throw new Error('Failed to create bulk food log');
    }
  }

  public async getFoodLogById(id: string): Promise<IFoodLog | null> {
    try {
      const foodLog = await FoodLog.findById(id)
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .populate('user', 'name email')
        .lean();
      return foodLog;
    } catch (_) {
      throw new Error('Invalid food log ID format');
    }
  }

  public async updateFoodLog(
    id: string,
    data: UpdateFoodLogRequest
  ): Promise<IFoodLog | null> {
    try {
      const updateData: any = { ...data };
      if (updateData.notes) {
        updateData.notes = updateData.notes.trim();
      }

      const updatedFoodLog = await FoodLog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .populate('user', 'name email')
        .lean();

      return updatedFoodLog;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update food log: ${error.message}`);
      }
      throw new Error('Failed to update food log');
    }
  }

  public async deleteFoodLog(id: string): Promise<boolean> {
    try {
      const result = await FoodLog.findByIdAndDelete(id);
      return !!result;
    } catch (_) {
      throw new Error('Failed to delete food log');
    }
  }

  public async getFoodLogsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
    startDate?: number,
    endDate?: number
  ): Promise<{ data: IFoodLog[]; total: number; page: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;

      // Validate userId format
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      // Build date filter
      let dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.logDate = {};
        if (startDate) {
          dateFilter.logDate.$gte = startDate;
        }
        if (endDate) {
          dateFilter.logDate.$lte = endDate;
        }
      }

      const query = { user: userId, ...dateFilter };

      const [data, total] = await Promise.all([
        FoodLog.find(query)
          .populate('meal', 'name calories protein fat carbs servingSize emoji')
          .sort({ logDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FoodLog.countDocuments(query),
      ]);

      return {
        data,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getFoodLogsByUser:', error);
      throw new Error(
        `Failed to fetch food logs for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async searchFoodLogs(
    params: FoodLogSearchParams
  ): Promise<{ data: IFoodLog[]; total: number; page: number; pages: number }> {
    const {
      userId,
      mealType,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = params;
    const skip = (page - 1) * limit;

    let searchQuery: any = {};

    if (userId) {
      searchQuery.user = userId;
    }

    if (mealType) {
      searchQuery.mealType = mealType;
    }

    if (startDate || endDate) {
      searchQuery.logDate = {};
      if (startDate) {
        searchQuery.logDate.$gte = startDate;
      }
      if (endDate) {
        searchQuery.logDate.$lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      FoodLog.find(searchQuery)
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .populate('user', 'name email')
        .sort({ logDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodLog.countDocuments(searchQuery),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  public async getDailyNutritionSummary(
    userId: string,
    date: number
  ): Promise<DailyNutritionSummary> {
    try {
      const summary = await (FoodLog as any).getDailyNutritionSummary(
        userId,
        date
      );
      return summary;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to get daily nutrition summary: ${error.message}`
        );
      }
      throw new Error('Failed to get daily nutrition summary');
    }
  }

  public async getNutritionSummaryRange(
    userId: string,
    startDate: number,
    endDate: number
  ): Promise<DailyNutritionSummary[]> {
    try {
      const summaries = await (FoodLog as any).getNutritionSummaryRange(
        userId,
        startDate,
        endDate
      );
      return summaries;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to get nutrition summary range: ${error.message}`
        );
      }
      throw new Error('Failed to get nutrition summary range');
    }
  }

  public async getFoodLogsByMealType(
    userId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IFoodLog[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      FoodLog.find({ user: userId, mealType })
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .sort({ logDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodLog.countDocuments({ user: userId, mealType }),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  public async getFoodLogsByDateRange(
    userId: string,
    startDate: number,
    endDate: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: IFoodLog[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      FoodLog.find({
        user: userId,
        logDate: { $gte: startDate, $lte: endDate },
      })
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .sort({ logDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FoodLog.countDocuments({
        user: userId,
        logDate: { $gte: startDate, $lte: endDate },
      }),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  public async getRecentFoodLogs(
    userId: string,
    limit: number = 5
  ): Promise<IFoodLog[]> {
    try {
      const foodLogs = await FoodLog.find({ user: userId })
        .populate('meal', 'name calories protein fat carbs servingSize emoji')
        .sort({ logDate: -1 })
        .limit(limit)
        .lean();

      return foodLogs;
    } catch (_) {
      throw new Error('Failed to get recent food logs');
    }
  }

  public async getFoodLogStats(userId: string): Promise<any> {
    try {
      const stats = await FoodLog.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalLogs: { $sum: 1 },
            totalCalories: {
              $sum: { $multiply: ['$quantity', '$meal.calories'] },
            },
            totalProtein: {
              $sum: { $multiply: ['$quantity', '$meal.protein'] },
            },
            totalFat: { $sum: { $multiply: ['$quantity', '$meal.fat'] } },
            totalCarbs: { $sum: { $multiply: ['$quantity', '$meal.carbs'] } },
            averageQuantity: { $avg: '$quantity' },
            mealTypeBreakdown: {
              $push: {
                mealType: '$mealType',
                quantity: '$quantity',
              },
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return {
          totalLogs: 0,
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          averageQuantity: 0,
          mealTypeBreakdown: {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            snack: 0,
          },
        };
      }

      const result = stats[0];
      const mealTypeBreakdown = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0,
      };

      result.mealTypeBreakdown.forEach((item: any) => {
        if (
          Object.prototype.hasOwnProperty.call(mealTypeBreakdown, item.mealType)
        ) {
          mealTypeBreakdown[item.mealType as keyof typeof mealTypeBreakdown] +=
            item.quantity;
        }
      });

      return {
        totalLogs: result.totalLogs,
        totalCalories: result.totalCalories || 0,
        totalProtein: result.totalProtein || 0,
        totalFat: result.totalFat || 0,
        totalCarbs: result.totalCarbs || 0,
        averageQuantity: result.averageQuantity || 0,
        mealTypeBreakdown,
      };
    } catch (_) {
      throw new Error('Failed to get food log statistics');
    }
  }

  public async getWeeklyNutritionTrend(
    userId: string,
    weeks: number = 4
  ): Promise<DailyNutritionSummary[]> {
    try {
      const endDate = Date.now();
      const startDate = Date.now() - weeks * 7 * 24 * 60 * 60 * 1000;

      return await this.getNutritionSummaryRange(userId, startDate, endDate);
    } catch (_) {
      throw new Error('Failed to get weekly nutrition trend');
    }
  }

  public async getMonthlyNutritionTrend(
    userId: string,
    months: number = 6
  ): Promise<DailyNutritionSummary[]> {
    try {
      const endDate = Date.now();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      const startDateEpoch = startDate.getTime();

      return await this.getNutritionSummaryRange(
        userId,
        startDateEpoch,
        endDate
      );
    } catch (_) {
      throw new Error('Failed to get monthly nutrition trend');
    }
  }
}
