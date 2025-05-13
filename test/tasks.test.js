const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Ensure app is exported from server.js
const Task = require('../models/Task');

const MONGO_URI = 'mongodb://localhost:27017/taskify_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Task.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Task API Endpoints', () => {
  // POST /api/tasks
  it('should create a new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: '2025-05-15',
      priority: 'High',
      status: 'Pending',
    };

    const res = await request(app).post('/api/tasks').send(newTask);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.title).toBe('Test Task');
  });

  // GET /api/tasks
  it('should fetch all tasks', async () => {
    const task = new Task({
      title: 'Sample Task',
      priority: 'Low',
      status: 'Pending',
    });
    await task.save();

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // GET /api/tasks/:id
  it('should fetch a task by ID', async () => {
    const task = new Task({
      title: 'Fetch Me',
      description: 'Find by ID',
      dueDate: '2025-05-16',
      priority: 'Medium',
    });
    await task.save();

    const res = await request(app).get(`/api/tasks/${task._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Fetch Me');
  });

  // PUT /api/tasks/:id
  it('should update a task by ID', async () => {
    const task = new Task({
      title: 'Update Me',
      status: 'Pending',
    });
    await task.save();

    const updatedData = {
      title: 'Updated Task',
      description: 'Updated desc',
      status: 'Completed',
      priority: 'High',
      dueDate: '2025-05-20',
    };

    const res = await request(app).put(`/api/tasks/${task._id}`).send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Task');
    expect(res.body.data.status).toBe('Completed');
  });

  // DELETE /api/tasks/:id
  it('should delete a task by ID', async () => {
    const task = new Task({ title: 'Delete Me' });
    await task.save();

    const res = await request(app).delete(`/api/tasks/${task._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });
});
