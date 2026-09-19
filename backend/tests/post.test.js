const request = require('supertest');
const app = require('../server');

describe('Post Management, Regeneration & Rescheduling Tests', () => {
  let authToken;
  let createdPostId;
  let calendarId;

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Post Tester',
        email: `post_tester_${Date.now()}@example.com`,
        password: 'password123',
      });
    authToken = regRes.body.token;

    const calRes = await request(app)
      .post('/api/calendars/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ brandId: 'mock_brand_ecoglow' });

    calendarId = calRes.body.calendar._id;
  });

  it('should create a custom post with valid parameters', async () => {
    const postData = {
      calendarId,
      date: '2026-10-15',
      platform: 'Instagram',
      title: '5 Steps to Sustainable Living',
      caption: 'Small changes lead to massive impact! 🌿 What is your favorite eco tip?',
      hashtags: ['#sustainability', '#greenliving'],
      postType: 'Educational',
    };

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(postData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('post');
    expect(res.body.post.idea).toBe(postData.title);
    createdPostId = res.body.post._id;
  });

  it('should reject post creation with unsupported platform', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        calendarId,
        date: '2026-10-15',
        platform: 'Myspace', // Unsupported platform
        idea: 'Invalid platform test',
        caption: 'Caption',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid option|Unsupported social media platform/i);
  });

  it('should reschedule an existing post', async () => {
    const newDate = '2026-10-20';
    const res = await request(app)
      .patch(`/api/posts/${createdPostId}/reschedule`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ date: newDate, timeSlot: '02:00 PM' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('post');
  });

  it('should regenerate single post content', async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/regenerate`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ customInstruction: 'Make it sound more urgent and inspiring' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('post');
    expect(res.body.post.caption).toBeDefined();
  });

  it('should update post fields', async () => {
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        caption: 'Updated caption for autumn release!',
        status: 'scheduled',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.post.status).toBe('scheduled');
  });
});
