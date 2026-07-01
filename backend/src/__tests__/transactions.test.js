/**
 * Transaction Route Tests
 * -----------------------
 * Integration tests for the transaction CRUD endpoints.
 * Tests verify that transactions are properly scoped to the
 * authenticated user and that unauthenticated requests are rejected.
 *
 * Tested endpoints:
 *   GET    /api/transactions     — List user's transactions
 *   POST   /api/transactions     — Create a transaction
 *   PUT    /api/transactions/:id — Update a transaction
 *   DELETE /api/transactions/:id — Delete a transaction
 */
const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Test fixtures
const testUser = {
  name: 'Transaction Tester',
  email: 'txn-tester@example.com',
  password: 'password123'
};

const testTransaction = {
  description: 'Grocery shopping',
  amount: 75.50,
  type: 'expense',
  category: 'Food'
};

let authToken;
let transactionId;

beforeAll(async () => {
  // Wait for the MongoDB connection to be ready
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      if (mongoose.connection.readyState === 1) resolve();
    });
  }

  // Clean up and register a test user
  await User.deleteMany({});
  await Transaction.deleteMany({});

  const res = await request(app).post('/api/auth/register').send(testUser);
  authToken = res.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await mongoose.connection.close();
  if (server) server.close();
});

describe('Transaction Routes — Unauthenticated', () => {
  it('should return 401 for GET /api/transactions without auth', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for POST /api/transactions without auth', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send(testTransaction);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for PUT /api/transactions/:id without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/transactions/${fakeId}`)
      .send(testTransaction);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for DELETE /api/transactions/:id without auth', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/transactions/${fakeId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/transactions', () => {
  beforeEach(async () => {
    await Transaction.deleteMany({});
  });

  it('should return an empty array when no transactions exist', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/transactions', () => {
  beforeEach(async () => {
    await Transaction.deleteMany({});
  });

  it('should create a new transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTransaction);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.description).toBe(testTransaction.description);
    expect(res.body.amount).toBe(testTransaction.amount);
    expect(res.body.type).toBe(testTransaction.type);
    expect(res.body.category).toBe(testTransaction.category);

    transactionId = res.body._id;
  });

  it('should reject a transaction with missing fields', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Incomplete' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject a transaction with negative amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'Bad amount', amount: -50, type: 'expense' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /api/transactions/:id', () => {
  beforeEach(async () => {
    await Transaction.deleteMany({});
    // Create a transaction to update
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTransaction);
    transactionId = res.body._id;
  });

  it('should update an existing transaction', async () => {
    const updateData = {
      description: 'Updated groceries',
      amount: 100,
      type: 'expense',
      category: 'Shopping'
    };

    const res = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe(updateData.description);
    expect(res.body.amount).toBe(updateData.amount);
    expect(res.body.category).toBe(updateData.category);
  });

  it('should return 404 for non-existent transaction', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTransaction);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /api/transactions/:id', () => {
  beforeEach(async () => {
    await Transaction.deleteMany({});
    // Create a transaction to delete
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testTransaction);
    transactionId = res.body._id;
  });

  it('should delete an existing transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Transaction deleted successfully');

    // Verify it's actually deleted
    const getRes = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.body).toEqual([]);
  });

  it('should return 404 for non-existent transaction', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/transactions/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
