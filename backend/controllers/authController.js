// backend//controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const userId = await User.create({ nama, email, password });
    const user = await User.findById(userId);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Record login activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    try {
      const RiwayatLogin = require('../models/riwayatLoginModel');
      await RiwayatLogin.create(user.id, ipAddress, userAgent);
    } catch (loginError) {
      // Log error but don't prevent login
      console.error('Error recording login:', loginError);
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await User.updatePassword(userId, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create admin user
    const userId = await User.create({ 
      nama, 
      email, 
      password, 
      role: 'Admin' 
    });
    
    const admin = await User.findById(userId);

    res.status(201).json({
      message: 'Admin created successfully',
      user: {
        id: admin.id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Error creating admin' });
  }
};