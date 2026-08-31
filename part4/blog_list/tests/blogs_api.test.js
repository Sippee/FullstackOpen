const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const bcrypt = require('bcrypt')
const { describe, test, before, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)
const mongoUrl = 'mongodb://localhost/bloglist_test'
let authToken

before(async () => {
  await mongoose.connect(mongoUrl, { family: 4 })
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const user = await User.create({
    username: 'testuser1',
    name: 'tester1',
    passwordHash: await bcrypt.hash('password1', 10),
  })
  authToken = require('jsonwebtoken').sign(
    { username: user.username, id: user._id },
    process.env.SECRET || 'secret'
  )
  await Blog.insertMany([
    {
      title: 'test1',
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    },
    {
      title: 'test2',
      author: 'tester2',
      url: 'testurl2',
      
      likes: 5,
    },
  ])
})

after(async () => {
  await mongoose.connection.close()
})

describe('GET /api/blogs', () => {
  test('returns all blogs as JSON', async () => {
    const response = await api
      .get('/api/blogs')
      .expect('Content-Type', /application\/json/)
      .expect(200)

    assert.strictEqual(response.body.length, 2)
    })
  test('each blog post has an id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert.ok(blog.id)
    })
  })
})

describe('POST /api/blogs', () => {
  test('cannot create a blog without a token', async () => {
    await api
      .post('/api/blogs')
      .send({
        title: 'test1',
        author: 'tester1',
        url: 'testurl1',
        likes: 3,
      })
      .expect(401)
  })

  test(`creates a new blog, total blog number increases by one, 
    new blog is returned with correct title`, async () => {
    const newBlog = {
      title: 'test1',
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    }

    const blogsBefore = await api.get('/api/blogs')

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect('Content-Type', /application\/json/)
      .expect(201)

    const blogsAfter = await api.get('/api/blogs')
    assert.strictEqual(blogsAfter.body.length, blogsBefore.body.length + 1)

    const titles = blogsAfter.body.map(blog => blog.title)
    assert.ok(titles.includes(newBlog.title))
  })

  test('auth user assigned as blog author', async () => {
    const newBlog = {
      title: 'Blog with creator',
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    }

    const created = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)

    const blogs = await api.get('/api/blogs')
    const blog = blogs.body.find(blog => blog.id === created.body.id)
    assert.strictEqual(blog.user.username, 'testuser1')

    const users = await api.get('/api/users')
    assert.ok(users.body[0].blogs.some(blog => blog.id === created.body.id))
  })

  test('likes defaults to zero when likes are missing', async () => {
    const newBlog = {
      title: 'test1',
      author: 'tester1',
      url: 'testurl1',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('respond with 400 when title is missing', async () => {
    const newBlog = {
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400)
  })

  test('respond with 400 when url is missing', async () => {
    const newBlog = {
      title: 'test1',
      author: 'tester1',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('delete a blog', async () => {
    const blogsBefore = await api.get('/api/blogs')
    const blogToDelete = blogsBefore.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAfter = await api.get('/api/blogs')
    assert.strictEqual(blogsAfter.body.length, blogsBefore.body.length - 1)
    assert.ok(!blogsAfter.body.some(blog => blog.id === blogToDelete.id))
  })

  test('respond with 404 when the blog does not exist', async () => {
    await api.delete('/api/blogs/test1').expect(404)
  })
})

describe('PUT /api/blogs/:id', () => {
  test('updates the likes of a blog', async () => {
    const blogsBefore = await api.get('/api/blogs')
    const blogToUpdate = blogsBefore.body[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 7 })
      .expect('Content-Type', /application\/json/)
      .expect(200)

    assert.strictEqual(response.body.likes, 7)

    const blogsAfter = await api.get('/api/blogs')
    const updatedBlog = blogsAfter.body.find(blog => blog.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, 7)
  })

  test('respond with 404 when the blog does not exist', async () => {
    await api
      .put('/api/blogs/test1')
      .send({ likes: 1 })
      .expect(404)
  })
})