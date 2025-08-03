import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Server instance for graceful shutdown
let serverInstance;

// Handle uncaught exceptions to prevent abrupt server termination
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  
  // Gracefully close server before exiting
  if (serverInstance) {
    serverInstance.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Gracefully close server before exiting
  if (serverInstance) {
    serverInstance.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection configuration
const connectToDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_CLOUD_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('❌ MongoDB connection URI not found in environment variables');
      console.error('💡 Please check your .env file contains MONGODB_CLOUD_URI or MONGODB_URI');
      return false;
    }

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('📍 Database: savaan_database');
    console.log('🌐 Cluster: ClusterOne');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('🚀 Database is ready for operations');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed!');
    console.error('💥 Error details:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication Error: Please check your username and password');
    } else if (error.message.includes('network')) {
      console.error('🌐 Network Error: Please check your internet connection');
    } else if (error.message.includes('timeout')) {
      console.error('⏰ Timeout Error: Connection took too long');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS Error: Cannot resolve MongoDB Atlas hostname');
    } else if (error.message.includes('not supported')) {
      console.error('⚙️  Configuration Error: Invalid connection options');
    }
    
    console.log('💡 Troubleshooting steps:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify MongoDB Atlas credentials');
    console.log('   3. Ensure IP address is whitelisted (0.0.0.0/0 for all IPs)');
    console.log('   4. Check if cluster is running and accessible');
    console.log('   5. Verify the connection string format');
    console.log('   6. Check .env file exists and contains MONGODB_CLOUD_URI');
    
    return false;
  }
};

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
  const {
    mobile, name, email, password, gender, dob, aadhar, pan,
    department, departmentId, jobDescription, block, post, jobAddress, pinCode, district,
    firstNominee, homeAddress, homeDistrict, homePinCode
  } = req.body;

  const errors = [];

  // Basic validations
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    errors.push('Valid mobile number is required');
  }

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !email.endsWith('@gmail.com')) {
    errors.push('Valid Gmail address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!gender || !['Male', 'Female', 'Transgender'].includes(gender)) {
    errors.push('Valid gender is required');
  }

  if (!dob) {
    errors.push('Date of birth is required');
  }

  if (!aadhar || !/^\d{12}$/.test(aadhar)) {
    errors.push('Valid 12-digit Aadhar number is required');
  }

  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
    errors.push('Valid PAN number is required');
  }

  // Job details validations
  if (!department) errors.push('Department is required');
  if (!departmentId) errors.push('Department ID is required');
  if (!jobDescription) errors.push('Job description is required');
  if (!block) errors.push('Block is required');
  if (!post) errors.push('Post is required');
  if (!jobAddress) errors.push('Job address is required');
  if (!pinCode || !/^\d{6}$/.test(pinCode)) errors.push('Valid 6-digit pin code is required');
  if (!district) errors.push('District is required');

  // First nominee validations
  if (!firstNominee || !firstNominee.name) errors.push('First nominee name is required');
  if (!firstNominee || !firstNominee.relation) errors.push('First nominee relation is required');
  if (!firstNominee || !firstNominee.mobile || !/^[6-9]\d{9}$/.test(firstNominee.mobile)) {
    errors.push('First nominee valid mobile number is required');
  }
  if (!firstNominee || !firstNominee.bankName) errors.push('First nominee bank name is required');
  if (!firstNominee || !firstNominee.accountNo) errors.push('First nominee account number is required');
  if (!firstNominee || !firstNominee.ifsc) errors.push('First nominee IFSC code is required');
  if (!firstNominee || !firstNominee.branch) errors.push('First nominee branch is required');

  // Other details validations
  if (!homeAddress) errors.push('Home address is required');
  if (!homeDistrict) errors.push('Home district is required');
  if (!homePinCode || !/^\d{6}$/.test(homePinCode)) errors.push('Valid home pin code is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Error handling middleware for async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

// Registration endpoint
app.post('/api/register', validateRegistration, asyncHandler(async (req, res) => {
  const {
    mobile, name, email, password, gender, dob, homePhone, bloodGroup, aadhar, pan,
    department, otherDepartment, departmentId, jobDescription, block, post, subPost,
    jobAddress, pinCode, district, firstNominee, secondNominee,
    homeAddress, homeDistrict, homePinCode, disease, causeOfIllness
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email },
      { mobile },
      { aadhar },
      { pan },
      { departmentId }
    ]
  });

  if (existingUser) {
    let field = 'user';
    if (existingUser.email === email) field = 'email';
    else if (existingUser.mobile === mobile) field = 'mobile number';
    else if (existingUser.aadhar === aadhar) field = 'Aadhar number';
    else if (existingUser.pan === pan) field = 'PAN number';
    else if (existingUser.departmentId === departmentId) field = 'department ID';

    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Create new user
  const newUser = new User({
    mobile,
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    gender,
    dob: new Date(dob),
    homePhone,
    bloodGroup,
    aadhar,
    pan: pan.toUpperCase(),
    department: department === 'Other' ? otherDepartment : department,
    otherDepartment,
    departmentId,
    jobDescription,
    block,
    post,
    subPost,
    jobAddress,
    pinCode,
    district,
    firstNominee: {
      ...firstNominee,
      accountHolderName: firstNominee.accountHolderName || firstNominee.name,
      ifsc: firstNominee.ifsc.toUpperCase()
    },
    secondNominee: secondNominee && secondNominee.name ? {
      ...secondNominee,
      accountHolderName: secondNominee.accountHolderName || secondNominee.name,
      ifsc: secondNominee.ifsc ? secondNominee.ifsc.toUpperCase() : undefined
    } : undefined,
    homeAddress,
    homeDistrict,
    homePinCode,
    disease,
    causeOfIllness,
    isVerified: true // Auto-verify for now
  });

  await newUser.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser._id, email: newUser.email, departmentId: newUser.departmentId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to Savaan.',
    user: newUser,
    token
  });
}));

// Login endpoint - supports Department ID + (Email/Mobile) + Password
app.post('/api/login', asyncHandler(async (req, res) => {
  const { emailOrMobile, password, departmentId } = req.body;

  // Validate required fields
  if (!emailOrMobile || !password || !departmentId) {
    return res.status(400).json({
      success: false,
      message: 'Department ID, email/mobile, and password are required'
    });
  }

  // Find user by department ID and email or mobile
  const user = await User.findOne({
    $and: [
      { departmentId },
      {
        $or: [
          { email: emailOrMobile.toLowerCase() },
          { mobile: emailOrMobile }
        ]
      }
    ]
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please check your Department ID, email/mobile, and password.'
    });
  }

  // Check if user is verified
  if (!user.isVerified) {
    return res.status(401).json({
      success: false,
      message: 'Your account is not verified. Please contact support.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please check your Department ID, email/mobile, and password.'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, departmentId: user.departmentId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    user,
    token
  });
}));

// Forgot password - Step 1: Verify mobile number
app.post('/api/forgot-password', asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required'
    });
  }

  // Check if user exists with this mobile number
  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this mobile number'
    });
  }

  // In a real application, you would send an actual OTP via SMS
  // For demo purposes, we'll use a fixed OTP
  const otp = '123456';
  
  res.json({
    success: true,
    message: 'OTP sent successfully to your mobile number',
    // In production, don't send OTP in response
    otp: otp // Only for demo purposes
  });
}));

// Forgot password - Step 2: Verify OTP and reset password
app.post('/api/reset-password', asyncHandler(async (req, res) => {
  const { mobile, otp, newPassword } = req.body;

  if (!mobile || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number, OTP, and new password are required'
    });
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  // Verify OTP (in demo, we accept '123456')
  if (otp !== '123456') {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP. Please try again.'
    });
  }

  // Find user by mobile number
  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with this mobile number'
    });
  }

  // Update password
  user.password = newPassword; // Will be hashed by pre-save middleware
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.'
  });
}));

// Get user profile endpoint (protected)
app.get('/api/profile', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user
  });
}));

// Get all users (admin endpoint)
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({
    success: true,
    users,
    count: users.length
  });
}));

// Check if mobile exists (for password reset)
app.post('/api/check-mobile', asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required'
    });
  }

  const user = await User.findOne({ mobile });

  res.json({
    success: true,
    exists: !!user,
    message: user ? 'Mobile number found' : 'Mobile number not found'
  });
}));

// Management Fee Payment endpoint
app.post('/api/payment/management-fee', asyncHandler(async (req, res) => {
  const { mobile, paymentMethod = 'online' } = req.body;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required'
    });
  }

  // Find user by mobile number
  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this mobile number'
    });
  }

  // Check if already paid and still valid
  if (user.managementFee.paid && user.managementFee.nextDue && new Date() < user.managementFee.nextDue) {
    return res.status(400).json({
      success: false,
      message: 'Management fee is already paid and valid'
    });
  }

  // Process payment (in real implementation, integrate with payment gateway)
  const paymentDate = new Date();
  const nextDue = new Date(paymentDate);
  nextDue.setFullYear(nextDue.getFullYear() + 1); // Add 1 year

  // Update user's management fee status
  user.managementFee = {
    paid: true,
    paymentDate: paymentDate,
    nextDue: nextDue,
    amount: 499
  };

  await user.save();

  res.json({
    success: true,
    message: 'Management fee payment successful',
    data: {
      paymentDate: paymentDate,
      nextDue: nextDue,
      amount: 499
    }
  });
}));

// Get Management Fee Status endpoint
app.get('/api/management-fee-status/:mobile', asyncHandler(async (req, res) => {
  const { mobile } = req.params;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Valid 10-digit mobile number is required'
    });
  }

  const user = await User.findOne({ mobile });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const managementFee = user.managementFee || { paid: false };
  const today = new Date();
  
  let status = {
    paid: managementFee.paid || false,
    paymentDate: managementFee.paymentDate,
    nextDue: managementFee.nextDue,
    amount: managementFee.amount || 499,
    isExpired: false,
    daysLeft: 0
  };

  if (managementFee.paid && managementFee.nextDue) {
    status.isExpired = today > managementFee.nextDue;
    if (!status.isExpired) {
      const timeDiff = managementFee.nextDue.getTime() - today.getTime();
      status.daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
  }

  res.json({
    success: true,
    managementFee: status
  });
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server only after successful database connection
const startServer = async () => {
  console.log('🚀 Starting Savaan Server...');
  console.log('📋 Environment: ' + (process.env.NODE_ENV || 'development'));
  
  // Try to connect to database but don't fail if it doesn't work
  let dbConnected = false;
  try {
    dbConnected = await connectToDatabase();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  DEVELOPMENT MODE: Starting server without database...');
    console.log('🔧 Some features may not work properly');
  }

  serverInstance = app.listen(PORT, () => {
    if (dbConnected) {
      console.log('🎉 SERVER RUNNING PERFECTLY!');
    } else {
      console.log('⚠️  SERVER RUNNING (DATABASE DISCONNECTED)');
    }
    console.log('=' .repeat(50));
    console.log(`🚀 Server URL: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  Database: ${dbConnected ? mongoose.connection.name + ' (Connected)' : 'Disconnected'}`);
    console.log(`⚡ Status: All systems operational`);
    console.log('=' .repeat(50));
  });
  
  // Handle server errors
  serverInstance.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.error('💡 Try using a different port or stop the other process');
    } else {
      console.error('❌ Server error:', error.message);
    }
    // Don't exit in development mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  if (serverInstance) {
    serverInstance.close(async () => {
      await mongoose.connection.close();
      console.log('✅ Database connection closed gracefully');
      console.log('👋 Server shutdown complete');
      process.exit(0);
    });
  } else {
    await mongoose.connection.close();
    console.log('✅ Database connection closed gracefully');
    console.log('👋 Server shutdown complete');
    process.exit(0);
  }
});

// Start the application
startServer().catch(async error => {
  console.error('❌ FATAL ERROR: Failed to start server');
  console.error('💥 Error details:', error.message);
  
  // Try to start server without database in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔄 Attempting to start server without database...');
    try {
      serverInstance = app.listen(PORT, () => {
        console.log('⚠️  SERVER RUNNING (NO DATABASE)');
        console.log('=' .repeat(50));
        console.log(`🚀 Server URL: http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🗄️  Database: Disconnected`);
        console.log(`⚡ Status: Limited functionality`);
        console.log('=' .repeat(50));
      });
    } catch (fallbackError) {
      console.error('❌ Failed to start server even without database');
      console.error('🛑 Application terminated');
      process.exit(1);
    }
  } else {
    console.error('🛑 Application terminated');
    process.exit(1);
  }
});