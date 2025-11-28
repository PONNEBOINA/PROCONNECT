import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI (masked):', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    
    // Test user query
    const userCount = await User.countDocuments();
    console.log(`✓ Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('name email section role');
      console.log('Sample user:', {
        name: sampleUser.name,
        email: sampleUser.email,
        section: sampleUser.section,
        role: sampleUser.role
      });
    }
    
    console.log('\n✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
