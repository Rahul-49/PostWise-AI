const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const logger = require('../utils/logger');

// In-memory mock storage fallback
const mockUsers = [];

const generateToken = (id, email, name) => {
  return jwt.sign(
    { id, email, name },
    process.env.JWT_SECRET || 'postwise_super_secret_jwt_key_2026_x987',
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'mock_user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        activeBrandId: null,
        createdAt: new Date(),
      };
      mockUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.email, newUser.name);
      logger.info('Mock user registered successfully', { email: newUser.email });
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, activeBrandId: newUser.activeBrandId },
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id, user.email, user.name);
    logger.info('User registered successfully', { userId: user._id, email: user.email });
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, activeBrandId: user.activeBrandId },
    });
  } catch (error) {
    logger.error('Registration Error', { error: error.message });
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const token = generateToken(user._id, user.email, user.name);
      logger.info('Mock user logged in', { email: user.email });
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, email: user.email, activeBrandId: user.activeBrandId },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.email, user.name);
    logger.info('User logged in successfully', { userId: user._id, email: user.email });
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, activeBrandId: user.activeBrandId },
    });
  } catch (error) {
    logger.error('Login Error', { error: error.message });
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const user = mockUsers.find(u => u._id === userId);
      if (!user) {
        return res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, activeBrandId: null } });
      }
      return res.json({ user: { id: user._id, name: user.name, email: user.email, activeBrandId: user.activeBrandId } });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user: { id: user._id, name: user.name, email: user.email, activeBrandId: user.activeBrandId } });
  } catch (error) {
    logger.error('Error retrieving profile', { error: error.message });
    return res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

exports.mockUsers = mockUsers;
