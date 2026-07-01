/**
 * Authentication Route Tests
 * --------------------------
 * Integration tests for the auth endpoints using Jest + Supertest.
 * Uses an in-memory approach: connects to a test MongoDB instance,
 * cleans up between tests, and disconnects afterwards.
 *
 * Tested endpoints:
 *   POST /api/auth/register  — Create user and receive JWT
 *   POST /api/auth/login     — Login with credentials
 *   GET  /api/auth/me        — Get profile with valid token
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let authToken;

beforeAll(async () => {
  // Wait for the MongoDB connection to be ready
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      // If already connected, resolve immediately
      if (mongoose.connection.readyState === 1) resolve();
    });
  }
});

afterAll(async () => {
  // Clean up test data and close connections
  await User.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(testUser.name);
    expect(res.body.email).toBe(testUser.email);

    // Save token for later tests
    authToken = res.body.token;
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject duplicate email registration', async () => {
    // Register first
    await request(app).post('/api/auth/register').send(testUser);

    // Try to register again with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    // Create a user to login with
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should login with valid credentials and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(testUser.email);

    // Update token for subsequent tests
    authToken = res.body.token;
  });

  it('should return 401 with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/auth/me', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    // Register and capture token
    const res = await request(app).post('/api/auth/register').send(testUser);
    authToken = res.body.token;
  });

  it('should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe(testUser.name);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).toHaveProperty('createdAt');
  });

  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
