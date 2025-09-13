import Tag, { ITag } from '../models/TagSchema';
import { CreateTagRequest, UpdateTagRequest, TagSearchParams } from '../models/Tag';

export class TagService {
  public async getAllTags(page: number = 1, limit: number = 10): Promise<{ data: ITag[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      Tag.find()
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tag.countDocuments()
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getTagById(id: string): Promise<ITag | null> {
    try {
      const tag = await Tag.findById(id).lean();
      return tag;
    } catch (error) {
      throw new Error('Invalid tag ID format');
    }
  }

  public async createTag(data: CreateTagRequest): Promise<ITag> {
    try {
      const newTag = new Tag({
        name: data.name.trim().toLowerCase(),
        description: data.description?.trim(),
        category: data.category?.trim(),
        color: data.color || '#6B7280',
        isActive: data.isActive !== undefined ? data.isActive : true
      });
      
      const savedTag = await newTag.save();
      return savedTag.toObject();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Tag with this name already exists');
        }
        throw new Error(`Failed to create tag: ${error.message}`);
      }
      throw new Error('Failed to create tag');
    }
  }

  public async updateTag(id: string, data: UpdateTagRequest): Promise<ITag | null> {
    try {
      const updateData: any = { ...data };
      if (updateData.name) {
        updateData.name = updateData.name.trim().toLowerCase();
      }
      if (updateData.description) {
        updateData.description = updateData.description.trim();
      }
      if (updateData.category) {
        updateData.category = updateData.category.trim();
      }

      const updatedTag = await Tag.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      return updatedTag;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Tag with this name already exists');
        }
        throw new Error(`Failed to update tag: ${error.message}`);
      }
      throw new Error('Failed to update tag');
    }
  }

  public async deleteTag(id: string): Promise<boolean> {
    try {
      const result = await Tag.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Failed to delete tag');
    }
  }

  public async searchTags(params: TagSearchParams): Promise<{ data: ITag[], total: number, page: number, pages: number }> {
    const { 
      query = '', 
      category,
      isActive,
      page = 1, 
      limit = 10 
    } = params;
    const skip = (page - 1) * limit;
    
    let searchQuery: any = {};
    
    // Text search by name
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }

    // Category filter
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }

    // Active status filter
    if (isActive !== undefined) {
      searchQuery.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      Tag.find(searchQuery)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tag.countDocuments(searchQuery)
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getTagStats(): Promise<any> {
    try {
      const stats = await Tag.getTagStats();
      const categoryStats = await Tag.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const baseStats = stats[0] || {
        totalTags: 0,
        activeTags: 0,
        inactiveTags: 0
      };

      const tagsByCategory: { [category: string]: number } = {};
      categoryStats.forEach(stat => {
        const category = stat._id || 'uncategorized';
        tagsByCategory[category] = stat.count;
      });

      return {
        ...baseStats,
        tagsByCategory
      };
    } catch (error) {
      throw new Error('Failed to get tag statistics');
    }
  }

  public async getActiveTags(): Promise<ITag[]> {
    try {
      const tags = await Tag.find({ isActive: true })
        .sort({ name: 1 })
        .lean();
      return tags;
    } catch (error) {
      throw new Error('Failed to get active tags');
    }
  }

  public async getTagsByCategory(category: string): Promise<ITag[]> {
    try {
      const tags = await Tag.find({ 
        category: { $regex: category, $options: 'i' },
        isActive: true 
      })
        .sort({ name: 1 })
        .lean();
      return tags;
    } catch (error) {
      throw new Error('Failed to get tags by category');
    }
  }

  public async getTagInfo(tagId: string): Promise<any> {
    try {
      const tag = await Tag.findById(tagId);
      if (!tag) {
        throw new Error('Tag not found');
      }

      const info = await (tag as any).getTagInfo();
      return info;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get tag info: ${error.message}`);
      }
      throw new Error('Failed to get tag info');
    }
  }
}
