import dotenv from 'dotenv';
import Database from '../config/database';
import User from '../models/UserSchema';

// Load environment variables
dotenv.config();

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'password123',
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    password: 'password123',
  },
  {
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    password: 'password123',
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
  },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    const db = Database.getInstance();
    await db.connect();

    // Clear existing data
    await User.deleteMany({});
    console.log('🗑️ Cleared existing user data');

    // Insert sample users (passwords will be hashed by pre-insertMany middleware)
    const insertedUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Show some statistics
    const totalUsers = await User.countDocuments();

    console.log('\n📊 Database Statistics:');
    console.log(`Total users: ${totalUsers}`);

    // Show user details
    for (const user of insertedUsers) {
      console.log(`- ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (_) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    const db = Database.getInstance();
    await db.disconnect();
    process.exit(0);
  }
};

// Run the seeding
seedDatabase();
