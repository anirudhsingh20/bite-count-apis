import mongoose, { Document, Schema } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true, // For faster queries by email
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Disable __v field
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 }); // Unique index for email
userSchema.index({ name: 1 }); // Index for name searches

// Virtual for user's initials
userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
});

// Virtual for user's display name (first name)
userSchema.virtual('displayName').get(function () {
  return this.name.split(' ')[0];
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    return ret;
  },
});

// Pre-save middleware for email normalization and password hashing
userSchema.pre('save', async function (next) {
  try {
    // Ensure email is lowercase
    this.email = this.email.toLowerCase().trim();

    // Hash password if it's modified
    if (this.isModified('password')) {
      const bcrypt = require('bcryptjs');
      this.password = await bcrypt.hash(this.password, 12);
    }

    next();
  } catch (error) {
    console.error('❌ Error in pre-save middleware:', error);
    next(error as Error);
  }
});

// Pre-insertMany middleware to hash passwords when using insertMany
userSchema.pre('insertMany', async function (next, docs) {
  try {
    const bcrypt = require('bcryptjs');

    for (const doc of docs) {
      if (doc.password) {
        doc.password = await bcrypt.hash(doc.password, 12);
      }
      // Also normalize email
      if (doc.email) {
        doc.email = doc.email.toLowerCase().trim();
      }
    }

    next();
  } catch (error) {
    console.error('❌ Error in pre-insertMany middleware:', error);
    next(error as Error);
  }
});

// Define static methods interface
interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  searchByName(query: string, page?: number, limit?: number): Promise<IUser[]>;
}

// Define instance methods interface
interface IUserDocument extends IUser {
  getBiteCountStats(): Promise<any>;
}

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to search users by name
userSchema.statics.searchByName = function (
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

// Instance method to get user's basic info
userSchema.methods.getUserInfo = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    initials: this.initials,
    displayName: this.displayName,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the model
const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
