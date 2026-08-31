const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const { describe, test, before, after, beforeEach } = require('node:test')
const User = require('../models/user')
const app = require('../app')
const bcrypt = require('bcrypt')

const api = supertest(app)
const mongoUrl = 'mongodb://localhost/bloglist_users_test'

before(async () => {
  await mongoose.connect(mongoUrl, { family: 4 })
})

beforeEach(async () => {
  await User.deleteMany({})
})

after(async () => {
  await mongoose.connection.close()
})

describe('POST /api/users', () => {
  test('created usrs have hashed password', async () => {
    const newUser = {
      username: 'testuser1',
      name: 'tester1',
      password: 'password1',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /application\/json/)
      .expect(201)

    assert.strictEqual(response.body.username, newUser.username)
    assert.strictEqual(response.body.passwordHash, undefined)

    const savedUser = await User.findOne({ username: newUser.username })
    assert.ok(savedUser.passwordHash)
    assert.ok(await bcrypt.compare(newUser.password, savedUser.passwordHash))
  })

  test('tries to create a user with a missing username or password', async () => {
    const usersBefore = await User.countDocuments()

    const response = await api
      .post('/api/users')
      .send({ username: 'testuser1' })
      .expect(400)

    assert.ok(response.body.error)
    assert.strictEqual(await User.countDocuments(), usersBefore)
  })

  test('tries to create a user with less than 3 characters in username or password', async () => {
    const usersBefore = await User.countDocuments()

    const response = await api
      .post('/api/users')
      .send({ username: 'ab', password: 'password' })
      .expect(400)

    assert.ok(response.body.error)
    assert.strictEqual(await User.countDocuments(), usersBefore)
  })

  test('must have unique username', async () => {
    await User.create({
      username: 'testuser1',
      name: 'existing_user1',
      passwordHash: await bcrypt.hash('password', 10),
    })

    const response = await api
      .post('/api/users')
      .send({ username: 'testuser1', password: 'new-password' })
      .expect(400)

    assert.ok(response.body.error)
    assert.strictEqual(await User.countDocuments({ username: 'testuser1' }), 1)
  })
})

describe('GET /api/users', () => {
  test('returns all users', async () => {
    await User.create({
      username: 'testuser1',
      name: 'tester1',
      passwordHash: await bcrypt.hash('secret-password', 10),
    })

    const response = await api
      .get('/api/users')
      .expect('Content-Type', /application\/json/)
      .expect(200)

    assert.strictEqual(response.body.length, 1)
  })
})
