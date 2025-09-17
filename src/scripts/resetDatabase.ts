import dotenv from 'dotenv';
import Database from '../config/database';
import User from '../models/UserSchema';
import Meal from '../models/MealSchema';
import FoodLog from '../models/FoodLogSchema';
import Tag from '../models/TagSchema';

// Load environment variables
dotenv.config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset...');

    // Connect to database
    const db = Database.getInstance();
    await db.connect();

    // Clear all data
    const result = await User.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} user records`);

    const mealResult = await Meal.deleteMany({});
    console.log(`🗑️ Deleted ${mealResult.deletedCount} meal records`);

    const foodLogResult = await FoodLog.deleteMany({});
    console.log(`🗑️ Deleted ${foodLogResult.deletedCount} food log records`);

    const tagResult = await Tag.deleteMany({});
    console.log(`🗑️ Deleted ${tagResult.deletedCount} tag records`);

    console.log('✅ Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    const db = Database.getInstance();
    await db.disconnect();
    process.exit(0);
  }
};

// Run the reset
resetDatabase();
