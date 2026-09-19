const request = require('supertest');
const app = require('../server');

describe('Calendar Generation & Export API Tests', () => {
  let authToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Calendar Tester',
        email: `cal_tester_${Date.now()}@example.com`,
        password: 'password123',
      });
    authToken = res.body.token;
  });

  it('should generate a 30-day calendar synchronously', async () => {
    const res = await request(app)
      .post('/api/calendars/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brandId: 'mock_brand_ecoglow',
        startDate: '2026-10-01',
        topicNiche: 'Eco Skincare',
        goals: 'Brand Awareness',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('calendar');
    expect(res.body).toHaveProperty('posts');
    expect(res.body.posts.length).toBeGreaterThanOrEqual(25);
  });

  it('should initiate async calendar generation job and check status', async () => {
    const initRes = await request(app)
      .post('/api/calendars/generate-async')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brandId: 'mock_brand_ecoglow',
        startDate: '2026-11-01',
      });

    expect(initRes.statusCode).toBe(202);
    expect(initRes.body).toHaveProperty('jobId');

    const jobId = initRes.body.jobId;
    const statusRes = await request(app)
      .get(`/api/calendars/jobs/${jobId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.body).toHaveProperty('job');
    expect(statusRes.body.job.id).toBe(jobId);
  });

  it('should export calendar as JSON attachment', async () => {
    // Generate a calendar first
    const genRes = await request(app)
      .post('/api/calendars/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ brandId: 'mock_brand_ecoglow' });

    const calId = genRes.body.calendar._id;

    const exportRes = await request(app)
      .get(`/api/calendars/${calId}/export/json`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(exportRes.statusCode).toBe(200);
    expect(exportRes.headers['content-type']).toMatch(/application\/json/);
    expect(exportRes.body).toHaveProperty('posts');
  });

  it('should export calendar as CSV attachment', async () => {
    const genRes = await request(app)
      .post('/api/calendars/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ brandId: 'mock_brand_ecoglow' });

    const calId = genRes.body.calendar._id;

    const exportRes = await request(app)
      .get(`/api/calendars/${calId}/export/csv`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(exportRes.statusCode).toBe(200);
    expect(exportRes.headers['content-type']).toMatch(/text\/csv/);
    expect(exportRes.text).toContain('Date,Platform,PostType,Idea,Caption');
  });
});
