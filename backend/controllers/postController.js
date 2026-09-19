const mongoose = require('mongoose');
const Post = require('../models/Post');
const Brand = require('../models/Brand');
const { regenerateSinglePost } = require('../services/aiService');
const { getDBStatus } = require('../config/db');

exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { calendarId, brandId, date, timeSlot, platform, title, idea, caption, hashtags, postType, status } = req.body;

    const postIdea = idea || title;
    if (!calendarId || !date || !postIdea || !caption || !platform) {
      return res.status(400).json({ message: 'calendarId, date, title/idea, caption, and platform are required' });
    }

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const newPost = {
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
        imagePrompt: `Visual suggestion for ${postIdea}`,
        engagementTip: 'Share to story for higher reach',
        status: status || 'draft',
        createdAt: new Date(),
      };
      mockPosts.push(newPost);
      return res.status(201).json({ message: 'Post created', post: newPost });
    }

    let effectiveBrandId = brandId;
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

    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, idea, caption, hashtags, platform, timeSlot, status, postType, imagePrompt, engagementTip, date } = req.body;

    const { useMockStore } = getDBStatus();
    const updatedIdea = idea || title;

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });

      mockPosts[index] = {
        ...mockPosts[index],
        idea: updatedIdea || mockPosts[index].idea,
        title: updatedIdea || mockPosts[index].title,
        caption: caption || mockPosts[index].caption,
        hashtags: Array.isArray(hashtags) ? hashtags : (typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim()) : mockPosts[index].hashtags),
        platform: platform ? ((platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform) : mockPosts[index].platform,
        timeSlot: timeSlot || mockPosts[index].timeSlot,
        status: status || mockPosts[index].status,
        postType: postType || mockPosts[index].postType,
        imagePrompt: imagePrompt !== undefined ? imagePrompt : mockPosts[index].imagePrompt,
        engagementTip: engagementTip !== undefined ? engagementTip : mockPosts[index].engagementTip,
        date: date ? new Date(date) : mockPosts[index].date,
        updatedAt: new Date(),
      };
      return res.json({ message: 'Post updated successfully', post: mockPosts[index] });
    }

    const updateFields = {};
    if (updatedIdea !== undefined) updateFields.idea = updatedIdea;
    if (caption !== undefined) updateFields.caption = caption;
    if (platform !== undefined) updateFields.platform = (platform === 'X/Twitter' || platform === 'Twitter') ? 'X' : platform;
    if (timeSlot !== undefined) updateFields.timeSlot = timeSlot;
    if (status !== undefined) updateFields.status = status;
    if (postType !== undefined) updateFields.postType = postType;
    if (imagePrompt !== undefined) updateFields.imagePrompt = imagePrompt;
    if (engagementTip !== undefined) updateFields.engagementTip = engagementTip;
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

    return res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post', error: error.message });
  }
};

exports.regeneratePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { customInstruction } = req.body;

    const { useMockStore } = getDBStatus();

    let post;
    let brand;

    if (useMockStore) {
      const { mockPosts } = require('./calendarController');
      const { mockBrands } = require('./brandController');
      const index = mockPosts.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Post not found' });

      post = mockPosts[index];
      brand = mockBrands.find(b => b._id === post.brand) || { name: 'Brand', industry: 'General', tone: 'Professional' };

      console.log('Regenerated data:', regeneratedData);

      mockPosts[index] = {
        ...mockPosts[index],
        ...regeneratedData,
        idea: regeneratedData.idea || regeneratedData.title || mockPosts[index].idea,
        title: regeneratedData.idea || regeneratedData.title || mockPosts[index].title,
        updatedAt: new Date(),
      };

      return res.json({ message: 'Post regenerated with AI', post: mockPosts[index] });
    }

    post = await Post.findOne({ _id: id, user: userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

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

    return res.json({ message: 'Post content regenerated successfully', post });
  } catch (error) {
    console.error('Post Regeneration Error:', error);
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

    const updateObj = { date: new Date(date) };
    if (timeSlot) updateObj.timeSlot = timeSlot;

    const post = await Post.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updateObj },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });

    return res.json({ message: 'Post rescheduled successfully', post });
  } catch (error) {
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

    const post = await Post.findOneAndDelete({ _id: id, user: userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};
