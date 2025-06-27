import request from 'supertest';
import app from '../expressApp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

describe('Backend API Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    username: 'testuser123',
    password: 'testpassword',
  };

  let authToken: string;
  let createdNoteId: string;

  beforeAll(async () => {
    const uri = process.env.MONGODB_CONNECTION_URL;
    if (!uri) throw new Error('MONGODB_CONNECTION_URL not defined in .env');
    await mongoose.connect(uri, { dbName: 'notesdb' });
    
    // Clean up any existing test data
    await mongoose.connection.collection('users').deleteMany({ username: testUser.username });
  });

  afterAll(async () => {
    await mongoose.connection.collection('users').deleteMany({ username: testUser.username });
    if (createdNoteId) {
      await mongoose.connection.collection('notes').deleteMany({ _id: new mongoose.Types.ObjectId(createdNoteId) });
    }
    await mongoose.disconnect();
  });

  describe('User Registration and Login', () => {
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
      
      authToken = res.body.token;
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

  describe('Notes CRUD', () => {
    it('creates a note (authenticated)', async () => {
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Test Note', 
          content: 'Test content', 
          author: { name: testUser.name, email: testUser.email }
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'Test Note');
      expect(res.body).toHaveProperty('content', 'Test content');
      createdNoteId = res.body._id;
    });

    it('fails to create note without authentication', async () => {
      const res = await request(app)
        .post('/notes')
        .send({ 
          title: 'Unauthorized Note', 
          content: 'Should fail', 
          author: null 
        });
      expect(res.statusCode).toBe(401);
    });

    it('reads notes (public access)', async () => {
      const res = await request(app).get('/notes?_page=1&_limit=10');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('updates a note (authenticated)', async () => {
      const res = await request(app)
        .put(`/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Updated Test Note', 
          content: 'Updated content', 
          author: { name: testUser.name, email: testUser.email }
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Test Note');
      expect(res.body).toHaveProperty('content', 'Updated content');
    });

    it('fails to update note without authentication', async () => {
      const res = await request(app)
        .put(`/notes/${createdNoteId}`)
        .send({ 
          title: 'Unauthorized Update', 
          content: 'Should fail', 
          author: null 
        });
      expect(res.statusCode).toBe(401);
    });

    it('deletes a note (authenticated)', async () => {
      const res = await request(app)
        .delete(`/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(204);
    });

    it('fails to delete note without authentication', async () => {
      const createRes = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Note to Delete', 
          content: 'Will be deleted', 
          author: { name: testUser.name, email: testUser.email }
        });
      
      const noteId = createRes.body._id;
      
      // Try to delete without auth
      const res = await request(app).delete(`/notes/${noteId}`);
      expect(res.statusCode).toBe(401);
      
      await request(app)
        .delete(`/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('Rich HTML and XSS Testing', () => {
    it('creates note with rich HTML content', async () => {
      const richHtmlContent = '<b>Bold text</b> and <i>italic text</i>';
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'Rich HTML Note', 
          content: richHtmlContent,
          author: { name: testUser.name, email: testUser.email }
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('content', richHtmlContent);
      
      await request(app)
        .delete(`/notes/${res.body._id}`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('creates note with XSS payload (backend stores as-is)', async () => {
      const xssPayload = '<img src="x" onerror="alert(1)">';
      const res = await request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          title: 'XSS Test Note', 
          content: xssPayload,
          author: { name: testUser.name, email: testUser.email }
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('content', xssPayload);
      
      await request(app)
        .delete(`/notes/${res.body._id}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });
}); 