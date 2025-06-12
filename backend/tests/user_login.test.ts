import request from 'supertest';
import app from '../expressApp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

describe('User Registration and Login', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    username: 'testuser123',
    password: 'testpassword',
  };

  beforeAll(async () => {
    const uri = process.env.MONGODB_CONNECTION_URL;
    if (!uri) throw new Error('MONGODB_CONNECTION_URL not defined in .env');
    await mongoose.connect(uri, { dbName: 'notesdb' });
    await mongoose.connection.collection('users').deleteMany({ username: testUser.username });
  });

  afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({ username: testUser.username });
    await mongoose.disconnect();
  });

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', testUser.username);
    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('fails to register with missing fields', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'incomplete' });
    expect(res.statusCode).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: testUser.username, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', testUser.username);
  });

  it('fails to login with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: testUser.username, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('fails to login with non-existent user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'nonexistent', password: 'irrelevant' });
    expect(res.statusCode).toBe(401);
  });
}); 