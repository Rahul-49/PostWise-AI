const Brand = require('../models/Brand');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

const mockBrands = [];

const mongoose = require('mongoose');

exports.getBrands = async (req, res) => {
  try {
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      let userBrands = mockBrands.filter(b => b.user === userId);
      if (userBrands.length === 0) {
        const defaultMock = {
          _id: 'brand_ecoglow_1',
          user: userId,
          name: 'EcoGlow Organics',
          industry: 'Sustainable Wellness & Beauty',
          targetAudience: 'Eco-conscious consumers, skincare lovers, wellness enthusiasts',
          tone: 'Inspirational',
          platforms: ['Instagram', 'LinkedIn', 'X/Twitter'],
          keywords: ['sustainability', 'cleanbeauty', 'organic', 'wellness', 'crueltyfree'],
          description: 'Eco-friendly and organic wellness products designed for everyday mindfulness.',
          createdAt: new Date(),
        };
        mockBrands.push(defaultMock);
        userBrands = [defaultMock];
      }
      return res.json({ brands: userBrands });
    }

    let brands = await Brand.find({ user: userId }).sort({ createdAt: -1 });

    // Auto-seed a default brand in MongoDB if user has no brands yet
    if (brands.length === 0) {
      const defaultBrand = await Brand.create({
        user: userId,
        name: 'EcoGlow Organics',
        industry: 'Sustainable Wellness & Beauty',
        targetAudience: 'Eco-conscious consumers, skincare lovers, wellness enthusiasts',
        tone: 'Inspirational',
        platforms: ['Instagram', 'LinkedIn', 'X/Twitter'],
        keywords: ['sustainability', 'cleanbeauty', 'organic', 'wellness', 'crueltyfree'],
        description: 'Eco-friendly and organic wellness products designed for everyday mindfulness.',
      });
      brands = [defaultBrand];
    }

    return res.json({ brands });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch brand profiles', error: error.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const brand = mockBrands.find(b => b._id === id && b.user === userId);
      if (!brand) return res.status(404).json({ message: 'Brand profile not found' });
      return res.json({ brand });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const brand = await Brand.findOne({ _id: id, user: userId });
    if (!brand) return res.status(404).json({ message: 'Brand profile not found' });
    return res.json({ brand });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch brand profile' });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, industry, targetAudience, tone, platforms, keywords, description, website } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const newBrand = {
        _id: 'mock_brand_' + Date.now(),
        user: userId,
        name,
        industry: industry || 'General',
        targetAudience: targetAudience || 'General Audience',
        tone: tone || 'Professional',
        platforms: Array.isArray(platforms) && platforms.length ? platforms : ['Instagram', 'LinkedIn', 'X/Twitter'],
        keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : []),
        description: description || '',
        website: website || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBrands.push(newBrand);
      return res.status(201).json({ message: 'Brand profile created', brand: newBrand });
    }

    const formattedKeywords = Array.isArray(keywords)
      ? keywords
      : keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

    const brand = await Brand.create({
      user: userId,
      name,
      industry: industry || 'General',
      targetAudience: targetAudience || 'General Audience',
      tone: tone || 'Professional',
      platforms: Array.isArray(platforms) && platforms.length ? platforms : ['Instagram', 'LinkedIn', 'X/Twitter'],
      keywords: formattedKeywords,
      description: description || '',
      website: website || '',
    });

    // Update active brand if user has no active brand
    await User.findByIdAndUpdate(userId, { activeBrandId: brand._id });

    return res.status(201).json({ message: 'Brand profile created successfully', brand });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create brand profile', error: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, industry, targetAudience, tone, platforms, keywords, description, website } = req.body;

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const index = mockBrands.findIndex(b => b._id === id && b.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Brand profile not found' });

      mockBrands[index] = {
        ...mockBrands[index],
        name: name || mockBrands[index].name,
        industry: industry || mockBrands[index].industry,
        targetAudience: targetAudience || mockBrands[index].targetAudience,
        tone: tone || mockBrands[index].tone,
        platforms: Array.isArray(platforms) ? platforms : mockBrands[index].platforms,
        keywords: Array.isArray(keywords) ? keywords : mockBrands[index].keywords,
        description: description !== undefined ? description : mockBrands[index].description,
        website: website !== undefined ? website : mockBrands[index].website,
        updatedAt: new Date(),
      };
      return res.json({ message: 'Brand profile updated', brand: mockBrands[index] });
    }

    const formattedKeywords = Array.isArray(keywords)
      ? keywords
      : typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : undefined;

    const updateData = { name, industry, targetAudience, tone, platforms, description, website };
    if (formattedKeywords) updateData.keywords = formattedKeywords;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const brand = await Brand.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!brand) return res.status(404).json({ message: 'Brand profile not found' });

    return res.json({ message: 'Brand profile updated successfully', brand });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update brand profile', error: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const index = mockBrands.findIndex(b => b._id === id && b.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Brand profile not found' });
      mockBrands.splice(index, 1);
      return res.json({ message: 'Brand profile deleted successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const brand = await Brand.findOneAndDelete({ _id: id, user: userId });
    if (!brand) return res.status(404).json({ message: 'Brand profile not found' });

    return res.json({ message: 'Brand profile deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete brand profile' });
  }
};

exports.mockBrands = mockBrands;
