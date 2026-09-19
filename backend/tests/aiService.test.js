const { sanitizeAndValidatePosts, generateCalendarPosts, regenerateSinglePost } = require('../services/aiService');

describe('AI Service & Output Validation Tests', () => {
  const mockStartDate = new Date('2026-10-01');

  it('should correctly sanitize and validate raw AI post array', () => {
    const rawPosts = [
      {
        platform: 'Instagram',
        idea: '10 Skincare Hacks',
        caption: 'Here are top skincare secrets for daily glow! ✨ Comment below your favorite routine!',
        hashtags: ['skincare', 'beauty'],
      },
      {
        platform: 'LinkedIn',
        idea: 'Sustainable Beauty Market Trends 2026',
        caption: 'The organic skincare market is projected to reach $22B. Key drivers include consumer transparency.',
        hashtags: ['Sustainability', 'Business'],
      },
      {
        platform: 'X',
        idea: 'Daily Wellness Tip',
        caption: 'Drink 8 glasses of water daily for radiant skin. Simple habits yield monumental results.',
        hashtags: ['Wellness'],
      },
    ];

    const result = sanitizeAndValidatePosts(rawPosts, 'EcoGlow Organics', mockStartDate);

    expect(result).toHaveLength(3);
    expect(result[0].platform).toBe('Instagram');
    expect(result[0].hashtags[0]).toBe('#skincare');
    expect(result[1].platform).toBe('LinkedIn');
    expect(result[2].platform).toBe('X');
    expect(result[0].status).toBe('scheduled');
  });

  it('should truncate X captions exceeding 280 characters', () => {
    const longCaption = 'A'.repeat(300);
    const rawPosts = [{ platform: 'X', idea: 'Long Post', caption: longCaption }];
    const result = sanitizeAndValidatePosts(rawPosts, 'TestBrand', mockStartDate);

    expect(result[0].caption.length).toBeLessThanOrEqual(280);
    expect(result[0].caption).toMatch(/\.\.\.$/);
  });

  it('should generate 30 posts via generateCalendarPosts even without API keys (mock fallback)', async () => {
    const brand = { name: 'EcoGlow', industry: 'Wellness', targetAudience: 'Consumers', tone: 'Inspiring' };
    const posts = await generateCalendarPosts({ brand, startDate: mockStartDate, month: 10, year: 2026 });

    expect(posts).toHaveLength(30);
    expect(posts[0]).toHaveProperty('idea');
    expect(posts[0]).toHaveProperty('caption');
    expect(posts[0]).toHaveProperty('hashtags');
  });

  it('should regenerate a single post safely', async () => {
    const post = { idea: 'Old Idea', caption: 'Old Caption', platform: 'Instagram', hashtags: ['#old'] };
    const brand = { name: 'EcoGlow' };
    const regenerated = await regenerateSinglePost({ post, brand, customInstruction: 'Focus on autumn vibes' });

    expect(regenerated).toHaveProperty('idea');
    expect(regenerated).toHaveProperty('caption');
    expect(regenerated).toHaveProperty('hashtags');
  });
});
