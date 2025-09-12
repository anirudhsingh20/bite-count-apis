import User, { IUser } from '../models/UserSchema';
import { CreateUserRequest, UpdateUserRequest, UserSearchParams } from '../models/User';

export class UserService {
  public async getAllUsers(page: number = 1, limit: number = 10): Promise<{ data: IUser[], total: number, page: number, pages: number }> {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments()
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getUserById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id).lean();
      return user;
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  public async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findByEmail(email);
      return user;
    } catch (error) {
      throw new Error('Failed to find user by email');
    }
  }

  public async createUser(data: CreateUserRequest): Promise<IUser> {
    try {
      // Check if user with email already exists
      const existingUser = await User.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser = new User({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim()
      });
      
      const savedUser = await newUser.save();
      return savedUser.toObject();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user');
    }
  }

  public async updateUser(id: string, data: UpdateUserRequest): Promise<IUser | null> {
    try {
      // If updating email, check if it's already taken by another user
      if (data.email) {
        const existingUser = await User.findByEmail(data.email);
        if (existingUser && (existingUser._id as any).toString() !== id) {
          throw new Error('Email is already taken by another user');
        }
      }

      const updateData: any = { ...data };
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
      }
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();
      
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error('Failed to update user');
    }
  }

  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }

  public async searchUsers(params: UserSearchParams): Promise<{ data: IUser[], total: number, page: number, pages: number }> {
    const { query = '', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    
    let searchQuery: any = {};
    
    if (query) {
      searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      };
    }

    const [data, total] = await Promise.all([
      User.find(searchQuery)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchQuery)
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  public async getUserInfo(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const info = await (user as any).getUserInfo();
      return info;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get user info: ${error.message}`);
      }
      throw new Error('Failed to get user info');
    }
  }

  public async getActiveUsers(): Promise<IUser[]> {
    try {
      // Get all users sorted by creation date
      const users = await User.find()
        .sort({ createdAt: -1 })
        .lean();

      return users;
    } catch (error) {
      throw new Error('Failed to get active users');
    }
  }
}
