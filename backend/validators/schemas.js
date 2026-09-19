const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty').trim(),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address').trim(),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address').trim(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

const createBrandSchema = z.object({
  name: z.string({ required_error: 'Brand name is required' }).min(1, 'Brand name cannot be empty').trim(),
  industry: z.string().optional(),
  niche: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  keywords: z.union([z.array(z.string()), z.string()]).optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  postingGoals: z.string().optional(),
  handles: z.record(z.string()).optional(),
  color: z.string().optional(),
});

const updateBrandSchema = createBrandSchema.partial();

const generateCalendarSchema = z.object({
  brandId: z.string({ required_error: 'brandId is required' }).min(1, 'brandId cannot be empty'),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  month: z.union([z.number(), z.string()]).optional(),
  year: z.union([z.number(), z.string()]).optional(),
  topicNiche: z.string().optional(),
  goals: z.string().optional(),
});

const createPostSchema = z.object({
  calendarId: z.string({ required_error: 'calendarId is required' }).min(1, 'calendarId is required'),
  brandId: z.string().optional(),
  date: z.string({ required_error: 'date is required' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  timeSlot: z.string().optional(),
  platform: z.enum(['Instagram', 'LinkedIn', 'X', 'X/Twitter', 'Twitter', 'TikTok', 'Facebook', 'YouTube'], {
    errorMap: () => ({ message: 'Unsupported social media platform' }),
  }),
  title: z.string().optional(),
  idea: z.string().optional(),
  caption: z.string({ required_error: 'caption is required' }).min(1, 'caption cannot be empty'),
  hashtags: z.union([z.array(z.string()), z.string()]).optional(),
  postType: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
}).refine(data => data.idea || data.title, {
  message: 'Either title or idea is required',
  path: ['idea'],
});

const updatePostSchema = z.object({
  title: z.string().optional(),
  idea: z.string().optional(),
  caption: z.string().optional(),
  hashtags: z.union([z.array(z.string()), z.string()]).optional(),
  platform: z.enum(['Instagram', 'LinkedIn', 'X', 'X/Twitter', 'Twitter', 'TikTok', 'Facebook', 'YouTube']).optional(),
  timeSlot: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'published']).optional(),
  postType: z.string().optional(),
  imagePrompt: z.string().optional(),
  engagementTip: z.string().optional(),
  date: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

const reschedulePostSchema = z.object({
  date: z.string({ required_error: 'New date is required for rescheduling' }).refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format for rescheduling',
  }),
  timeSlot: z.string().optional(),
});

const regeneratePostSchema = z.object({
  customInstruction: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createBrandSchema,
  updateBrandSchema,
  generateCalendarSchema,
  createPostSchema,
  updatePostSchema,
  reschedulePostSchema,
  regeneratePostSchema,
};
