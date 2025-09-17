import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Tag document
export interface ITag extends Document {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Tag name must be at least 2 characters long'],
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [30, 'Category cannot exceed 30 characters'],
      index: true,
    },
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'],
      default: '#6B7280', // Default gray color
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Disable __v field
  }
);

// Indexes for better query performance
tagSchema.index({ name: 1 }); // Unique index for name
tagSchema.index({ category: 1 }); // Index for category searches
tagSchema.index({ isActive: 1 }); // Index for active/inactive filtering
tagSchema.index({ name: 'text' }); // Text index for full-text search

// Ensure virtual fields are serialized
tagSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

// Pre-save middleware for data validation and normalization
tagSchema.pre('save', async function (next) {
  try {
    // Normalize name (trim and lowercase)
    this.name = this.name.trim().toLowerCase();

    // Normalize category if provided
    if (this.category) {
      this.category = this.category.trim();
    }

    // Normalize description if provided
    if (this.description) {
      this.description = this.description.trim();
    }

    next();
  } catch (error) {
    console.error('❌ Error in tag pre-save middleware:', error);
    next(error as Error);
  }
});

// Define static methods interface
interface ITagModel extends mongoose.Model<ITag> {
  searchByName(query: string, page?: number, limit?: number): Promise<ITag[]>;
  findByCategory(
    category: string,
    page?: number,
    limit?: number
  ): Promise<ITag[]>;
  findActiveTags(page?: number, limit?: number): Promise<ITag[]>;
  getTagStats(): Promise<any>;
}

// Define instance methods interface
interface ITagDocument extends ITag {
  getTagInfo(): any;
}

// Static method to search tags by name
tagSchema.statics.searchByName = function (
  query: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  return this.find({
    name: { $regex: query, $options: 'i' },
  })
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find tags by category
tagSchema.statics.findByCategory = function (
  category: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  return this.find({
    category: { $regex: category, $options: 'i' },
  })
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find active tags
tagSchema.statics.findActiveTags = function (
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  return this.find({
    isActive: true,
  })
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get tag statistics
tagSchema.statics.getTagStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalTags: { $sum: 1 },
        activeTags: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        inactiveTags: {
          $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
        },
      },
    },
  ]);
};

// Instance method to get tag's basic info
tagSchema.methods.getTagInfo = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    category: this.category,
    color: this.color,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Create and export the model
const Tag = mongoose.model<ITag, ITagModel>('Tag', tagSchema);

export default Tag;
