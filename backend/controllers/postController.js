const mongoose = require('mongoose');
const Post = require('../models/Post');
const Brand = require('../models/Brand');
const { regenerateSinglePost } = require('../services/aiService');
const { getDBStatus } = require('../config/db');
const LinkedInToken = require('../models/LinkedInToken');
const linkedinService = require('../services/linkedinService');
const logger = require('../utils/logger');

exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { calendarId, brandId, date, timeSlot, platform, title, idea, caption, hashtags, postType, status } = req.body;

    const postIdea = idea || title;
    if (!calendarId || !date || !postIdea || !caption || !platform) {
      return res.status(400).json({ message: 'calendarId, date, title/idea, caption, and platform are required' });
    }

    const { useMockStore } = getDBStatus();
    let effectiveBrandId = brandId;

    if (useMockStore) {
      const mockPost = {
        _id: 'mock_post_' + Date.now(),
        calendar: calendarId,
        user: userId,
        brand: brandId || 'mock_brand_default',
        date: new Date(date),
        timeSlot: timeSlot || '09:00 AM',
        platform: (platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform,
        idea: postIdea,
        title: postIdea,
        caption,
        hashtags: Array.isArray(hashtags) ? hashtags : (hashtags ? hashtags.split(',').map(h => h.trim()) : []),
        postType: postType || 'Educational',
        status: status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const { mockPosts } = require('./calendarController');
      mockPosts.push(mockPost);
      return res.status(201).json({ message: 'Post created successfully', post: mockPost });
    }

    if (!effectiveBrandId || !mongoose.Types.ObjectId.isValid(effectiveBrandId)) {
      const userBrand = await Brand.findOne({ user: userId }).sort({ createdAt: -1 });
      if (userBrand) {
        effectiveBrandId = userBrand._id;
      } else {
        const newBrand = await Brand.create({
          user: userId,
          name: 'EcoGlow Organics',
          industry: 'Sustainable Wellness & Beauty',
          tone: 'Inspirational',
        });
        effectiveBrandId = newBrand._id;
      }
    }

    const formattedHashtags = Array.isArray(hashtags)
      ? hashtags
      : typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim()).filter(Boolean) : [];

    const post = await Post.create({
      calendar: calendarId,
      user: userId,
      brand: effectiveBrandId,
      date: new Date(date),
      timeSlot: timeSlot || '09:00 AM',
      platform: (platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform,
      idea: postIdea,
      caption,
      hashtags: formattedHashtags,
      postType: postType || 'Educational',
      status: status || 'draft',
    });

    logger.info('Post created successfully', { postId: post._id, userId, platform: post.platform });
    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    logger.error('Failed to create post', { error: error.message });
    return res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, idea, caption, hashtags, platform, timeSlot, status, postType, imagePrompt, engagementTip, date, imageUrl } = req.body;

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });

      mockPosts[index] = {
        ...mockPosts[index],
        idea: idea !== undefined ? idea : (title !== undefined ? title : mockPosts[index].idea),
        caption: caption !== undefined ? caption : mockPosts[index].caption,
        platform: platform !== undefined ? ((platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform) : mockPosts[index].platform,
        timeSlot: timeSlot !== undefined ? timeSlot : mockPosts[index].timeSlot,
        status: status !== undefined ? status : mockPosts[index].status,
        postType: postType !== undefined ? postType : mockPosts[index].postType,
        imagePrompt: imagePrompt !== undefined ? imagePrompt : mockPosts[index].imagePrompt,
        engagementTip: engagementTip !== undefined ? engagementTip : mockPosts[index].engagementTip,
        date: date !== undefined ? new Date(date) : mockPosts[index].date,
        hashtags: hashtags !== undefined ? (Array.isArray(hashtags) ? hashtags : hashtags.split(',').map(h => h.trim())) : mockPosts[index].hashtags,
        updatedAt: new Date(),
      };
      return res.json({ message: 'Post updated successfully', post: mockPosts[index] });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updatedIdea = idea !== undefined ? idea : title;
    const updateFields = {};
    if (updatedIdea !== undefined) updateFields.idea = updatedIdea;
    if (caption !== undefined) updateFields.caption = caption;
    if (platform !== undefined) updateFields.platform = (platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform;
    if (timeSlot !== undefined) updateFields.timeSlot = timeSlot;
    if (status !== undefined) updateFields.status = status;
    if (postType !== undefined) updateFields.postType = postType;
    if (imagePrompt !== undefined) updateFields.imagePrompt = imagePrompt;
    if (engagementTip !== undefined) updateFields.engagementTip = engagementTip;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (date !== undefined) updateFields.date = new Date(date);
    if (hashtags !== undefined) {
      updateFields.hashtags = Array.isArray(hashtags)
        ? hashtags
        : typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim()).filter(Boolean) : [];
    }

    const post = await Post.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });

    logger.info('Post updated', { postId: id, userId });
    return res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    logger.error('Failed to update post', { error: error.message });
    return res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

exports.regeneratePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { customInstruction } = req.body;

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });

      const post = mockPosts[index];
      const brand = { name: 'Brand', industry: 'General', tone: 'Professional' };
      const regeneratedData = await regenerateSinglePost({ post, brand, customInstruction });

      post.idea = regeneratedData.idea || post.idea;
      post.caption = regeneratedData.caption || post.caption;
      post.hashtags = regeneratedData.hashtags || post.hashtags;
      post.updatedAt = new Date();

      return res.json({ message: 'Post content regenerated successfully', post });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let post = await Post.findOne({ _id: id, user: userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let brand;
    if (post.brand && mongoose.Types.ObjectId.isValid(post.brand)) {
      brand = await Brand.findById(post.brand);
    }
    if (!brand) {
      brand = { name: 'Brand', industry: 'General', tone: 'Professional' };
    }

    const regeneratedData = await regenerateSinglePost({ post, brand, customInstruction });

    post.idea = regeneratedData.idea || regeneratedData.title || post.idea;
    post.caption = regeneratedData.caption || post.caption;
    post.hashtags = regeneratedData.hashtags || post.hashtags;
    if (regeneratedData.imagePrompt) post.imagePrompt = regeneratedData.imagePrompt;
    if (regeneratedData.engagementTip) post.engagementTip = regeneratedData.engagementTip;
    await post.save();

    logger.info('Post content regenerated', { postId: id, userId });
    return res.json({ message: 'Post content regenerated successfully', post });
  } catch (error) {
    logger.error('Post Regeneration Error', { error: error.message });
    return res.status(500).json({ message: 'Failed to regenerate post content', error: error.message });
  }
};

exports.reschedulePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { date, timeSlot } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'New date is required for rescheduling' });
    }

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });

      mockPosts[index].date = new Date(date);
      if (timeSlot) mockPosts[index].timeSlot = timeSlot;
      mockPosts[index].updatedAt = new Date();

      return res.json({ message: 'Post rescheduled successfully', post: mockPosts[index] });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updateObj = { date: new Date(date) };
    if (timeSlot) updateObj.timeSlot = timeSlot;

    const post = await Post.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateObj },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });

    logger.info('Post rescheduled successfully', { postId: id, newDate: date });
    return res.json({ message: 'Post rescheduled successfully', post });
  } catch (error) {
    logger.error('Failed to reschedule post', { error: error.message });
    return res.status(500).json({ message: 'Failed to reschedule post', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });
      mockPosts.splice(index, 1);
      return res.json({ message: 'Post deleted successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = await Post.findOneAndDelete({ _id: id, user: userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    logger.info('Post deleted successfully', { postId: id, userId });
    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete post', { error: error.message });
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Publish post to LinkedIn
exports.publishToLinkedIn = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { useMockStore } = getDBStatus();

    let post;
    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      post = mockPosts.find(p => p._id === id && p.user === userId);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Post not found' });
      }
      post = await Post.findOne({ _id: id, user: userId });
    }

    if (!post) return res.status(404).json({ message: 'Post not found' });

    let accessToken;

    if (!useMockStore) {
      const tokenDoc = await LinkedInToken.findOne({ user: userId });
      if (tokenDoc) {
        if (tokenDoc.expiresAt && tokenDoc.refreshToken) {
          const validToken = await linkedinService.refreshTokenIfNeeded(tokenDoc);
          accessToken = validToken.accessToken;
        } else {
          accessToken = tokenDoc.accessToken;
        }
      }
    }

    if (!accessToken) {
      accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    }

    if (!accessToken) {
      return res.status(401).json({ message: 'LinkedIn not authorized. Add your token to LINKEDIN_ACCESS_TOKEN in .env or connect via OAuth.' });
    }

    const authorUrn = await linkedinService.getProfile(accessToken);

    const imageUrl = req.body?.imageUrl || post.imageUrl;

    const result = await linkedinService.publishPost({
      accessToken,
      authorUrn,
      post,
      imageUrl,
    });

    if (imageUrl && !post.imageUrl) {
      post.imageUrl = imageUrl;
    }
    post.linkedinUrn = result.id;
    post.linkedinStatus = 'published';
    if (!useMockStore && post.save) {
      await post.save();
    }

    logger.info('Post published to LinkedIn successfully', { postId: id, linkedinUrn: result.id });
    res.json({ message: 'Published to LinkedIn', linkedinUrn: result.id });
  } catch (err) {
    logger.error('LinkedIn publish error', { error: err.message });
    res.status(500).json({ message: 'Failed to publish to LinkedIn', error: err.message });
  }
};
