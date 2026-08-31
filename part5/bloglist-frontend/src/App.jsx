import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import { Link as RouterLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material'

const Login = ({ username, password, setUsername, setPassword, onLogin }) => (

  <Paper sx={{ maxWidth: 480, mt: 4, p: 4 }}>
    <Typography variant="h5" sx={{ mb: 3 }}>
      Log in to application
    </Typography>
    <Box component="form" onSubmit={onLogin} sx={{ display: 'grid', gap: 2 }}>
      <TextField
        label="Username"
        value={username}
        onChange={event => setUsername(event.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />

      <Button type="submit" variant="contained">
        login
      </Button>
    </Box>
  </Paper>
)

const BlogDetails = ({ blogs, user, onLike, onDelete }) => {
  const { id } = useParams()
  const blog = blogs.find(blog => blog.id === id)

  if (!blog) {
    return <p>blog not found</p>
  }

  return (
    <Blog
      blog={blog}
      user={user}
      onLike={onLike}
      onDelete={onDelete}
      singleView
    />
  )
}

const App = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(() => {
    const savedUser = window.localStorage.getItem('loggedUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleLogin = (event) => {
    event.preventDefault()

    loginService.login({ username, password })
      .then(user => {
        setUser(user)
        window.localStorage.setItem('loggedUser', JSON.stringify(user))
        setUsername('')
        setPassword('')
        showNotification(`Welcome, ${user.name}`)
        navigate('/')
      })
      .catch(() => {
        showNotification('wrong username or password', 'error')
      })
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedUser')
    showNotification(`Logged out, ${user.name}`)
    setUser(null)
    navigate('/')
  }

  const addBlog = (newBlog) => {
    return blogService.create(newBlog, user.token)
      .then(blog => {
        setBlogs(blogs.concat(blog))
        showNotification(`${newBlog.title} created successfully`)
        navigate('/')
        return blog
      })
      .catch(error => {
        showNotification('failed to create blog', 'error')
        throw error
      })
  }

  const likeBlog = blog => {
    const updatedBlog = { ...blog, likes: blog.likes + 1 }

    blogService.update(updatedBlog)
      .then(returnedBlog => {
        setBlogs(blogs.map(currentBlog =>
          currentBlog.id === returnedBlog.id ? returnedBlog : currentBlog
        ))
      })
      .catch(() => {
        showNotification('failed to like blog', 'error')
      })
  }

    const deleteBlog = (id, title) => {
      if (!window.confirm(`Remove blog ${title}?`)) {
        return
      }

      blogService.remove(id, user.token)
        .then(() => {
          setBlogs(blogs.filter(blog => blog.id !== id))
          showNotification(`${title} was removed`)
          navigate('/')
        })
        .catch(() => {
          showNotification(`failed to remove ${title}`, 'error')
        })
    }

  const sortedBlogs = [...blogs].sort((firstBlog, secondBlog) =>
    secondBlog.likes - firstBlog.likes
  )

  return (
    <Paper sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 4 }}>
      <Notification message={notification?.message} type={notification?.type} />
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ color: 'inherit', flexGrow: 1, textDecoration: 'none' }}
          >
            Blog App
          </Typography>
        {user === null ? (
          <Button component={RouterLink} to="/login" color="inherit">
            login
          </Button>
        ) : (
          <>
            <Button component={RouterLink} to="/new" color="inherit">
              new blog
            </Button>
            <Button onClick={handleLogout} color="inherit">
              logout
            </Button>
          </>
        )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={
          <div>
            <h2>Blogs</h2>
            {user && <h3>{user.name} logged in</h3>}
            {sortedBlogs.map(blog =>
              <Blog
                key={blog.id}
                blog={blog}
                user={user}
                onLike={likeBlog}
                onDelete={deleteBlog}
                linkTitle
              />
            )}
          </div>
        } />
        <Route path="/login" element={
          user === null ? (
            <Login
              username={username}
              password={password}
              setUsername={setUsername}
              setPassword={setPassword}
              onLogin={handleLogin}
            />
          ) : null
        } />
        <Route path="/blogs/:id" element={
          <BlogDetails
            blogs={blogs}
            user={user}
            onLike={likeBlog}
            onDelete={deleteBlog}
          />
        } />
        <Route path="/new" element={
          user ? (
            <BlogForm onCreate={addBlog} startVisible />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Paper>
  )
}

export default App