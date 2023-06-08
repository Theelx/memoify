const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const { getAllUsers } = require('../utils/test_helper');

beforeEach(async () => {
  await User.deleteMany({});

  const saltRounds = 10;
  const rootPasswordHash = await bcrypt.hash('supremepassword', saltRounds);
  const rootUser = new User({
    username: 'root',
    name: 'admin',
    passwordHash: rootPasswordHash
  });
  await rootUser.save();

  const passwordHash1 = await bcrypt.hash('kennwort', saltRounds);
  const user1 = new User({
    username: 'reservecrate',
    name: 'Aldi',
    passwordHash: passwordHash1
  });
  await user1.save();

  const passwordHash2 = await bcrypt.hash('niemals', saltRounds);
  const user2 = new User({
    username: 'breezehash',
    name: 'Joel',
    passwordHash: passwordHash2
  });
  await user2.save();

  const passwordHash3 = await bcrypt.hash('lecso', saltRounds);
  const user3 = new User({
    username: 'wirelessspice',
    name: 'Gabor',
    passwordHash: passwordHash3
  });
  await user3.save();
}, 50000);

describe('fetching the users', () => {
  test('returns 200 + users list when fetching all users', async () => {
    const { body } = await api.get('/api/users').expect(200);
    const users = await getAllUsers();
    expect(body).toHaveLength(users.length);
  });
  test('returns 200 + the right user when fetching a single user', async () => {
    const users = await getAllUsers();
    const userToFetch1 = users[1];
    const { body: fetchedUser1 } = await api
      .get(`/api/users/${userToFetch1.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(fetchedUser1.username).toBe('reservecrate');

    const userToFetch2 = users[3];
    const { body: fetchedUser2 } = await api
      .get(`/api/users/${userToFetch2.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(fetchedUser2.name).toBe('Gabor');
  });
  test('returns 404 when given nonexistent id', async () => {
    await api.get('/api/users/nonexistent').expect(404);
  });
});

describe('creating a user with valid data', () => {
  test('succeeds with 201 when given a valid username + password', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'theelx',
      name: 'Jonah',
      password: 'pythonista'
    };

    const { body: createdUser } = await api
      .post('/api/users')
      .send(userToCreate)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length + 1);
    expect(usersAfter).toContainEqual(createdUser);
  });

  test('if name not given, assigns a default one (Incognito); succeeds with 201', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'theelx',
      password: 'pythonista'
    };

    const { body: createdUser } = await api
      .post('/api/users')
      .send(userToCreate)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length + 1);
    expect(usersAfter).toContainEqual(createdUser);
  });
});

describe('creating a user with invalid data', () => {
  test('fails with 400 if the username is shorter than 3 characters', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'tx',
      name: 'Jonah',
      password: 'pythonista'
    };

    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    const usernames = usersAfter.map(user => user.username);
    expect(usersAfter).toHaveLength(usersBefore.length);
    expect(usernames).not.toContain(userToCreate.username);
  });
  test('fails with 400 if the password is shorter than 5 characters', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'theelx',
      name: 'Jonah',
      password: 'pyth'
    };

    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    const usernames = usersAfter.map(user => user.username);
    expect(usersAfter).toHaveLength(usersBefore.length);
    expect(usernames).not.toContain(userToCreate.username);
  });
  test('fails with 400 if the username is already taken', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'breezehash',
      name: 'Joel',
      password: 'jemals'
    };

    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });
});

describe('creating a user with missing data', () => {
  test('fails with 400 if the username is missing', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      name: 'Jonah',
      password: 'pythonista'
    };

    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });
  test('fails with 400 if the password is missing', async () => {
    const usersBefore = await getAllUsers();

    const userToCreate = {
      username: 'theelx',
      name: 'Jonah'
    };

    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length);
  });
});

describe('updating the users', () => {
  test('returns 200 and successfully updates the username if given a valid token', async () => {
    const usersBefore = await getAllUsers();
    const login = { username: 'reservecrate', password: 'kennwort' };
    const { id } = await User.findOne({ username: login.username });
    const { body: userToUpdate } = await api.get(`/api/users/${id}`);
    const { token } = (await api.post('/api/login').send({ ...login })).body;

    const updatedUserData = { ...userToUpdate, username: 'reservecase' };
    const { body: updatedUser } = await api
      .put(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ updatedUserData, toUpdate: 'username' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length);
    expect(usersAfter).toContainEqual(updatedUser);
  });
  test('returns 400 if the new username is shorter than 3 characters', async () => {
    const usersBefore = await getAllUsers();
    const login = { username: 'reservecrate', password: 'kennwort' };
    const { id } = await User.findOne({ username: login.username });
    const { body: userToUpdate } = await api.get(`/api/users/${id}`);
    const { token } = (await api.post('/api/login').send({ ...login })).body;

    const updatedUserData = { ...userToUpdate, username: 're' };
    const { body: updatedUser } = await api
      .put(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ updatedUserData, toUpdate: 'username' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).not.toContainEqual(updatedUser);
    expect(usersAfter).toEqual(usersBefore);
  });
  test('returns 200 and successfully updates the password if given a valid token', async () => {
    const usersBefore = await getAllUsers();
    const login = { username: 'reservecrate', password: 'kennwort' };
    const { id } = await User.findOne({ username: login.username });
    const { body: userToUpdate } = await api.get(`/api/users/${id}`);
    const { token } = (await api.post('/api/login').send({ ...login })).body;

    const updatedUserData = { ...userToUpdate, password: 'geenword' };
    const { body: updatedUser } = await api
      .put(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ updatedUserData, toUpdate: 'password' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toHaveLength(usersBefore.length);
    expect(usersAfter).toContainEqual(updatedUser);
  });
  test('returns 400 if the new password is shorter than 5 characters', async () => {
    const usersBefore = await getAllUsers();
    const login = { username: 'reservecrate', password: 'kennwort' };
    const { id } = await User.findOne({ username: login.username });
    const { body: userToUpdate } = await api.get(`/api/users/${id}`);
    const { token } = (await api.post('/api/login').send({ ...login })).body;

    const updatedUserData = { ...userToUpdate, password: 'geen' };
    await api
      .put(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ updatedUserData, toUpdate: 'password' })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).toEqual(usersBefore);
  });
  test('returns 400 if the update flag (toUpdate) is invalid/missing', async () => {
    const usersBefore = await getAllUsers();
    const login = { username: 'reservecrate', password: 'kennwort' };
    const { id } = await User.findOne({ username: login.username });
    const { body: userToUpdate } = await api.get(`/api/users/${id}`);
    const { token } = (await api.post('/api/login').send({ ...login })).body;

    const updatedUserData = { ...userToUpdate, username: 'reservecase' };
    const { body: updatedUser } = await api
      .put(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ updatedUserData })
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAfter = await getAllUsers();
    expect(usersAfter).not.toContainEqual(updatedUser);
    expect(usersAfter).toEqual(usersBefore);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
