const express = require('express')
const Blog = require('./models/blog')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const morgan = require('morgan')

const app = express()
const secret = process.env.SECRET || 'secret'

app.use(express.json())

if (process.env.NODE_ENV === 'test') {
  app.post('/api/testing/reset', async (_request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    response.status(204).end()
  })
}

morgan.token('body', request => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'token is missing or invalid' })
  }

  try {
    request.user = jwt.verify(authorization.substring(7), secret)
    next()
  } catch (error) {
    response.status(401).json({ error: 'token ismissing or invalid' })
  }
}

app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  response.json(blogs)
})

app.get('/api/users', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  })
  response.json(users)
})

app.post('/api/login', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, secret, { expiresIn: '1h' })
  response.json({ token, username: user.username, name: user.name })
})

app.post('/api/users', async (request, response) => {
  try {
    const { username, password, name } = request.body

    if (!username || !password) {
      return response.status(400).json({ error: 'username or password is missing' })
    }
    else if (username.length < 3 || password.length < 3) {
      return response.status(400).json({ error: 'username and password must be at least 3 characters long' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ username, name, passwordHash })
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

app.post('/api/blogs', tokenExtractor, async (request, response) => {
  try {
    const user = await User.findById(request.user.id)

    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }

    const blog = new Blog({ ...request.body, user: user._id })

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()
    const populatedBlog = await Blog.findById(result._id).populate('user', {
      username: 1,
      name: 1,
    })
    response.status(201).json(populatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

app.put('/api/blogs/:id', async (request, response) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body,
      { returnDocument: 'after', runValidators: true, context: 'query' }
    ).populate('user', {
      username: 1,
      name: 1,
    })

    if (!updatedBlog) {
      return response.status(404).end()
    }

    response.json(updatedBlog)
  } catch (error) {
    response.status(404).json({ error: error.message })
  }
})

app.delete('/api/blogs/:id', async (request, response) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(request.params.id)

    if (!deletedBlog) {
      return response.status(404).end()
    }

    response.status(204).end()
  } catch (error) {
    response.status(404).json({ error: error.message })
  }
})

module.exports = app
