import dotenv from 'dotenv';
import Database from '../config/database';
import User from '../models/UserSchema';

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
