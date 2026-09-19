const request = require('supertest');
const app = require('../server');

describe('Authentication API & Validation Tests', () => {
  const testUser = {
    name: 'Test Creator',
    email: `test_${Date.now()}@example.com`,
    password: 'securepassword123',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should fail registration with invalid email or missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bad User',
        email: 'invalid-email-format',
        password: '123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });
});
