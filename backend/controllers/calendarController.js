const Calendar = require('../models/Calendar');
const Post = require('../models/Post');
const Brand = require('../models/Brand');
const { generateCalendarPosts } = require('../services/aiService');
const { getDBStatus } = require('../config/db');
const logger = require('../utils/logger');
const jobService = require('../services/jobService');
const mongoose = require('mongoose');

const mockCalendars = [];
const mockPosts = [];

function parseMonthAndYear(month, year, start) {
  let targetMonth = start.getMonth() + 1;
  let targetYear = start.getFullYear();

  if (month !== undefined && month !== null) {
    if (typeof month === 'number' && !isNaN(month)) {
      targetMonth = Math.max(1, Math.min(12, Math.floor(month)));
    } else if (typeof month === 'string') {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const lower = month.toLowerCase().trim();
      const foundIdx = monthNames.findIndex(m => lower.includes(m));
      if (foundIdx !== -1) {
        targetMonth = foundIdx + 1;
      } else {
        const parsedM = parseInt(month, 10);
        if (!isNaN(parsedM) && parsedM >= 1 && parsedM <= 12) {
          targetMonth = parsedM;
        }
      }

      const yearMatch = month.match(/\b(20\d\d)\b/);
      if (yearMatch && !year) {
        targetYear = parseInt(yearMatch[1], 10);
      }
    }
  }

  if (year !== undefined && year !== null) {
    const parsedY = parseInt(year, 10);
    if (!isNaN(parsedY) && parsedY >= 2000) {
      targetYear = parsedY;
    }
  }

  return { targetMonth, targetYear };
}

async function resolveBrand(userId, brandId, topicNiche, platforms) {
  const { useMockStore } = getDBStatus();
  let brand;

  if (useMockStore) {
    const { mockBrands } = require('./brandController');
    brand = mockBrands.find(b => b._id === brandId && b.user === userId);
    if (!brand) {
      brand = {
        _id: brandId || 'mock_brand_default',
        brandName: 'Demo Brand',
        name: 'Demo Brand',
        industry: topicNiche || 'Technology',
        targetAudience: 'Creators & Entrepreneurs',
        tone: 'Professional',
        platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
      };
    }
    return brand;
  }

  if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
    brand = await Brand.findOne({ _id: brandId, user: userId });
  }

  if (!brand) {
    brand = await Brand.findOne({ user: userId }).sort({ createdAt: -1 });
  }

  if (!brand) {
    brand = await Brand.create({
      user: userId,
      name: 'EcoGlow Organics',
      industry: topicNiche || 'Sustainable Wellness & Beauty',
      targetAudience: 'Eco-conscious consumers, skincare lovers, wellness enthusiasts',
      tone: 'Inspirational',
      platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
      keywords: ['sustainability', 'cleanbeauty', 'organic', 'wellness', 'crueltyfree'],
      description: 'Eco-friendly and organic wellness products designed for everyday mindfulness.',
    });
  }

  return brand;
}

exports.generateCalendar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { brandId, startDate, month, year, topicNiche, goals, platforms } = req.body;

    if (!brandId) {
      return res.status(400).json({ message: 'brandId is required' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const validStart = isNaN(start.getTime()) ? new Date() : start;
    const { targetMonth, targetYear } = parseMonthAndYear(month, year, validStart);

    logger.info('Calendar generation requested', { userId, brandId, month: targetMonth, year: targetYear });

    const brand = await resolveBrand(userId, brandId, topicNiche, platforms);
    const generatedPostsData = await generateCalendarPosts({
      brand,
      startDate: validStart,
      month: targetMonth,
      year: targetYear,
      platforms,
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const bName = brand.brandName || brand.name || 'Brand';
    const calendarTitle = `${bName} - ${monthNames[targetMonth - 1] || 'Month'} ${targetYear}`;

    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const calendarId = 'mock_cal_' + Date.now();
      const newCalendar = {
        _id: calendarId,
        user: userId,
        brand: brandId,
        title: calendarTitle,
        month: targetMonth,
        year: targetYear,
        startDate: validStart,
        topicNiche: topicNiche || brand.industry || '',
        goals: goals || brand.postingGoals || '',
        postsCount: generatedPostsData.length,
        platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
        createdAt: new Date(),
      };
      mockCalendars.push(newCalendar);

      const createdPosts = generatedPostsData.map((p, idx) => ({
        _id: `mock_post_${Date.now()}_${idx}`,
        calendar: calendarId,
        user: userId,
        brand: brandId,
        date: p.date,
        platform: (p.platform === 'X/Twitter' || p.platform === 'Twitter') ? 'X' : (p.platform || 'Instagram'),
        postType: p.postType || 'Educational',
        idea: p.idea || p.title || `Day ${idx + 1} Content Idea`,
        title: p.idea || p.title || `Day ${idx + 1} Content Idea`,
        caption: p.caption || `Post caption for ${bName}`,
        hashtags: p.hashtags || [],
        status: p.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPosts.push(...createdPosts);

      return res.status(201).json({
        message: 'AI Content Calendar generated successfully',
        calendar: newCalendar,
        posts: createdPosts,
      });
    }

    const calendar = await Calendar.create({
      user: userId,
      brand: brand._id,
      title: calendarTitle,
      month: targetMonth,
      year: targetYear,
      startDate: validStart,
      topicNiche: topicNiche || brand.industry || '',
      goals: goals || brand.postingGoals || '',
      postsCount: generatedPostsData.length,
      platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
    });

    const postsToInsert = generatedPostsData.map((p, idx) => ({
      ...p,
      calendar: calendar._id,
      user: userId,
      brand: brand._id,
      idea: p.idea || p.title || `Day ${idx + 1} Content Idea`,
      caption: p.caption || `Post caption for ${bName}`,
      platform: (p.platform === 'X/Twitter' || p.platform === 'Twitter') ? 'X' : (p.platform || 'Instagram'),
    }));

    const createdPosts = await Post.insertMany(postsToInsert);

    logger.info('Calendar generated successfully', { calendarId: calendar._id, postsCount: createdPosts.length });

    return res.status(201).json({
      message: 'AI Content Calendar generated successfully',
      calendar,
      posts: createdPosts,
    });
  } catch (error) {
    logger.error('Calendar Generation Error', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Failed to generate content calendar', error: error.message });
  }
};

exports.generateCalendarAsync = async (req, res) => {
  try {
    const userId = req.user.id;
    const { brandId, startDate, month, year, topicNiche, goals, platforms } = req.body;

    if (!brandId) {
      return res.status(400).json({ message: 'brandId is required' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    jobService.createJob(jobId, { userId, brandId });

    res.status(202).json({
      message: 'Calendar generation job accepted',
      jobId,
      statusUrl: `/api/calendars/jobs/${jobId}`,
    });

    // Execute background worker
    (async () => {
      try {
        jobService.updateJob(jobId, { status: 'processing', progress: 10 });
        const start = startDate ? new Date(startDate) : new Date();
        const validStart = isNaN(start.getTime()) ? new Date() : start;
        const { targetMonth, targetYear } = parseMonthAndYear(month, year, validStart);

        const brand = await resolveBrand(userId, brandId, topicNiche, platforms);
        jobService.updateJob(jobId, { progress: 40 });

        const generatedPostsData = await generateCalendarPosts({
          brand,
          startDate: validStart,
          month: targetMonth,
          year: targetYear,
          platforms,
        });
        jobService.updateJob(jobId, { progress: 80 });

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const bName = brand.brandName || brand.name || 'Brand';
        const calendarTitle = `${bName} - ${monthNames[targetMonth - 1] || 'Month'} ${targetYear}`;

        const { useMockStore } = getDBStatus();

        if (useMockStore) {
          const calendarId = 'mock_cal_' + Date.now();
          const newCalendar = {
            _id: calendarId,
            user: userId,
            brand: brandId,
            title: calendarTitle,
            month: targetMonth,
            year: targetYear,
            startDate: validStart,
            topicNiche: topicNiche || brand.industry || '',
            goals: goals || brand.postingGoals || '',
            postsCount: generatedPostsData.length,
            platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
            createdAt: new Date(),
          };
          mockCalendars.push(newCalendar);

          const createdPosts = generatedPostsData.map((p, idx) => ({
            _id: `mock_post_${Date.now()}_${idx}`,
            calendar: calendarId,
            user: userId,
            brand: brandId,
            date: p.date,
            platform: (p.platform === 'X/Twitter' || p.platform === 'Twitter') ? 'X' : (p.platform || 'Instagram'),
            postType: p.postType || 'Educational',
            idea: p.idea || p.title || `Day ${idx + 1} Content Idea`,
            title: p.idea || p.title || `Day ${idx + 1} Content Idea`,
            caption: p.caption || `Post caption for ${bName}`,
            hashtags: p.hashtags || [],
            status: p.status || 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
          mockPosts.push(...createdPosts);

          jobService.updateJob(jobId, {
            status: 'completed',
            progress: 100,
            result: { calendar: newCalendar, posts: createdPosts },
          });
          return;
        }

        const calendar = await Calendar.create({
          user: userId,
          brand: brand._id,
          title: calendarTitle,
          month: targetMonth,
          year: targetYear,
          startDate: validStart,
          topicNiche: topicNiche || brand.industry || '',
          goals: goals || brand.postingGoals || '',
          postsCount: generatedPostsData.length,
          platforms: platforms || ['Instagram', 'LinkedIn', 'X'],
        });

        const postsToInsert = generatedPostsData.map((p, idx) => ({
          ...p,
          calendar: calendar._id,
          user: userId,
          brand: brand._id,
          idea: p.idea || p.title || `Day ${idx + 1} Content Idea`,
          caption: p.caption || `Post caption for ${bName}`,
          platform: (p.platform === 'X/Twitter' || p.platform === 'Twitter') ? 'X' : (p.platform || 'Instagram'),
        }));

        const createdPosts = await Post.insertMany(postsToInsert);

        jobService.updateJob(jobId, {
          status: 'completed',
          progress: 100,
          result: { calendar, posts: createdPosts },
        });
      } catch (err) {
        logger.error('Async Job Execution Failed', { jobId, error: err.message });
        jobService.updateJob(jobId, {
          status: 'failed',
          error: err.message,
        });
      }
    })();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate async calendar job' });
  }
};

exports.getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = jobService.getJob(jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found or expired' });
  }
  return res.json({ job });
};

exports.getCalendars = async (req, res) => {
  try {
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const userCals = mockCalendars.filter(c => c.user === userId);
      return res.json({ calendars: userCals });
    }

    const calendars = await Calendar.find({ user: userId }).sort({ createdAt: -1 }).populate('brand', 'brandName name industry tone');
    return res.json({ calendars });
  } catch (error) {
    logger.error('Failed to fetch calendars', { error: error.message });
    return res.status(500).json({ message: 'Failed to fetch calendars' });
  }
};

exports.getCalendarById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const calendar = mockCalendars.find(c => c._id === id && c.user === userId);
      if (!calendar) return res.status(404).json({ message: 'Calendar not found or unauthorized' });
      const posts = mockPosts.filter(p => p.calendar === id && p.user === userId);
      return res.json({ calendar, posts });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    const calendar = await Calendar.findOne({ _id: id, user: userId }).populate('brand');
    if (!calendar) return res.status(404).json({ message: 'Calendar not found or unauthorized' });

    const posts = await Post.find({ calendar: id, user: userId }).sort({ date: 1 });
    return res.json({ calendar, posts });
  } catch (error) {
    logger.error('Failed to fetch calendar detail', { error: error.message });
    return res.status(500).json({ message: 'Failed to fetch calendar detail' });
  }
};

exports.exportJSON = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    let calendar;
    let posts;

    if (useMockStore) {
      calendar = mockCalendars.find(c => c._id === id && c.user === userId);
      if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
      posts = mockPosts.filter(p => p.calendar === id && p.user === userId);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Calendar not found' });
      }
      calendar = await Calendar.findOne({ _id: id, user: userId }).populate('brand');
      if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
      posts = await Post.find({ calendar: id, user: userId }).sort({ date: 1 });
    }

    const exportData = {
      calendarTitle: calendar.title,
      month: calendar.month,
      year: calendar.year,
      exportedAt: new Date().toISOString(),
      posts: posts.map(p => ({
        id: p._id,
        date: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
        platform: p.platform,
        postType: p.postType,
        idea: p.idea || p.title,
        caption: p.caption,
        hashtags: p.hashtags,
        status: p.status,
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="calendar_${id}.json"`);
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (error) {
    logger.error('Failed to export calendar JSON', { error: error.message });
    return res.status(500).json({ message: 'Failed to export calendar JSON', error: error.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    let calendar;
    let posts;

    if (useMockStore) {
      calendar = mockCalendars.find(c => c._id === id && c.user === userId);
      if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
      posts = mockPosts.filter(p => p.calendar === id && p.user === userId);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Calendar not found' });
      }
      calendar = await Calendar.findOne({ _id: id, user: userId });
      if (!calendar) return res.status(404).json({ message: 'Calendar not found' });
      posts = await Post.find({ calendar: id, user: userId }).sort({ date: 1 });
    }

    const escapeCSV = (str) => {
      if (!str) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    let csvContent = 'Date,Platform,PostType,Idea,Caption,Hashtags,Status\n';

    posts.forEach(p => {
      const dateStr = p.date ? new Date(p.date).toISOString().split('T')[0] : '';
      const platformStr = p.platform || '';
      const postTypeStr = p.postType || '';
      const ideaStr = p.idea || p.title || '';
      const captionStr = p.caption || '';
      const hashtagsStr = Array.isArray(p.hashtags) ? p.hashtags.join(' ') : '';
      const statusStr = p.status || 'draft';

      csvContent += `${escapeCSV(dateStr)},${escapeCSV(platformStr)},${escapeCSV(postTypeStr)},${escapeCSV(ideaStr)},${escapeCSV(captionStr)},${escapeCSV(hashtagsStr)},${escapeCSV(statusStr)}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="calendar_${id}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    logger.error('Failed to export calendar CSV', { error: error.message });
    return res.status(500).json({ message: 'Failed to export calendar CSV', error: error.message });
  }
};

exports.deleteCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { useMockStore } = getDBStatus();

    if (useMockStore) {
      const index = mockCalendars.findIndex(c => c._id === id && c.user === userId);
      if (index === -1) return res.status(404).json({ message: 'Calendar not found' });
      mockCalendars.splice(index, 1);
      for (let i = mockPosts.length - 1; i >= 0; i--) {
        if (mockPosts[i].calendar === id) mockPosts.splice(i, 1);
      }
      return res.json({ message: 'Calendar deleted successfully' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Calendar not found' });
    }

    const calendar = await Calendar.findOneAndDelete({ _id: id, user: userId });
    if (!calendar) return res.status(404).json({ message: 'Calendar not found' });

    await Post.deleteMany({ calendar: id, user: userId });
    return res.json({ message: 'Calendar deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete calendar', { error: error.message });
    return res.status(500).json({ message: 'Failed to delete calendar' });
  }
};

exports.mockCalendars = mockCalendars;
exports.mockPosts = mockPosts;
