import QuantityUnit, { IQuantityUnit } from '../models/QuantityUnitSchema';
import {
  CreateQuantityUnitRequest,
  UpdateQuantityUnitRequest,
  QuantityUnitSearchParams,
} from '../models/QuantityUnit';

export class QuantityUnitService {
  public async createQuantityUnit(
    data: CreateQuantityUnitRequest
  ): Promise<IQuantityUnit> {
    try {
      // Check if unit with same name or shortName already exists
      const existingUnit = await QuantityUnit.findOne({
        $or: [{ name: data.name }, { shortName: data.shortName }],
      });

      if (existingUnit) {
        throw new Error(
          `Unit with name '${data.name}' or shortName '${data.shortName}' already exists`
        );
      }

      const quantityUnit = new QuantityUnit(data);
      const savedUnit = await quantityUnit.save();

      return savedUnit;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create quantity unit: ${error.message}`);
      }
      throw new Error('Failed to create quantity unit');
    }
  }

  public async getQuantityUnitById(id: string): Promise<IQuantityUnit | null> {
    try {
      const unit = await QuantityUnit.findById(id).lean();
      return unit;
    } catch (_) {
      throw new Error('Invalid quantity unit ID format');
    }
  }

  public async updateQuantityUnit(
    id: string,
    data: UpdateQuantityUnitRequest
  ): Promise<IQuantityUnit | null> {
    try {
      // Check if updating name or shortName would conflict with existing units
      if (data.name || data.shortName) {
        const conflictQuery: any = { _id: { $ne: id } };
        const orConditions: any[] = [];

        if (data.name) {
          orConditions.push({ name: data.name });
        }
        if (data.shortName) {
          orConditions.push({ shortName: data.shortName });
        }

        if (orConditions.length > 0) {
          conflictQuery.$or = orConditions;
          const existingUnit = await QuantityUnit.findOne(conflictQuery);

          if (existingUnit) {
            throw new Error(
              `Unit with name '${data.name}' or shortName '${data.shortName}' already exists`
            );
          }
        }
      }

      const updateData: any = { ...data };

      // Remove undefined values
      Object.keys(updateData).forEach(
        key => updateData[key] === undefined && delete updateData[key]
      );

      const updatedUnit = await QuantityUnit.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();

      return updatedUnit;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update quantity unit: ${error.message}`);
      }
      throw new Error('Failed to update quantity unit');
    }
  }

  public async deleteQuantityUnit(id: string): Promise<boolean> {
    try {
      const result = await QuantityUnit.findByIdAndDelete(id);
      return !!result;
    } catch (_) {
      throw new Error('Failed to delete quantity unit');
    }
  }

  public async getAllQuantityUnits(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IQuantityUnit[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        QuantityUnit.find({}).sort({ name: 1 }).skip(skip).limit(limit).lean(),
        QuantityUnit.countDocuments({}),
      ]);

      return {
        data,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error('Failed to fetch quantity units');
    }
  }

  public async searchQuantityUnits(
    params: QuantityUnitSearchParams
  ): Promise<{
    data: IQuantityUnit[];
    total: number;
    page: number;
    pages: number;
  }> {
    const { name, shortName, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    let searchQuery: any = {};

    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' };
    }
    if (shortName) {
      searchQuery.shortName = { $regex: shortName, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      QuantityUnit.find(searchQuery)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuantityUnit.countDocuments(searchQuery),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  public async getQuantityUnitByName(
    name: string
  ): Promise<IQuantityUnit | null> {
    try {
      const unit = await QuantityUnit.findOne({ name }).lean();
      return unit;
    } catch (error) {
      throw new Error('Failed to fetch quantity unit by name');
    }
  }

  public async getQuantityUnitByShortName(
    shortName: string
  ): Promise<IQuantityUnit | null> {
    try {
      const unit = await QuantityUnit.findOne({ shortName }).lean();
      return unit;
    } catch (error) {
      throw new Error('Failed to fetch quantity unit by short name');
    }
  }

  public async getQuantityUnitStats(): Promise<{
    totalUnits: number;
    mostUsedIncrement: number;
    averageDefaultValue: number;
  }> {
    try {
      const [totalUnits, stats] = await Promise.all([
        QuantityUnit.countDocuments({}),
        QuantityUnit.aggregate([
          {
            $group: {
              _id: null,
              averageDefaultValue: { $avg: '$defaultValue' },
              incrementValues: { $push: '$incrementValue' },
            },
          },
        ]),
      ]);

      const mostUsedIncrement =
        stats.length > 0
          ? Math.round(
              (stats[0].incrementValues.reduce(
                (a: number, b: number) => a + b,
                0
              ) /
                stats[0].incrementValues.length) *
                10
            ) / 10
          : 0;

      return {
        totalUnits,
        mostUsedIncrement,
        averageDefaultValue:
          stats.length > 0
            ? Math.round(stats[0].averageDefaultValue * 10) / 10
            : 0,
      };
    } catch (error) {
      throw new Error('Failed to get quantity unit statistics');
    }
  }
}
