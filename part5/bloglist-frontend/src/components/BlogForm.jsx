import { useState } from 'react'
import {
  Button,
  TextField,
  Box,
  Paper,
} from '@mui/material'

const BlogForm = ({ onCreate, startVisible = false }) => {
  const [visible, setVisible] = useState(startVisible)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()

    onCreate({ title, author, url }).then(() => {
      setTitle('')
      setAuthor('')
      setUrl('')
      setVisible(false)
    })
  }

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  return (
    <Paper style={{ padding: 10, border: 'solid', borderWidth: 1, marginBottom: 5 }} >
      <div style={hideWhenVisible}>
        <button onClick={() => setVisible(true)}>create new blog</button>
      </div>
      <div style={showWhenVisible}>
        <h2>Create a New Blog</h2>
        <form onSubmit={addBlog}>
          <Box mb={2}>
            <TextField
              label="Title"
              type="title"
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Author"
              type="author"
              value={author}
              onChange={event => setAuthor(event.target.value)}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="URL"
              type="url"
              value={url}
              onChange={event => setUrl(event.target.value)}
            />
          </Box>
          <Button type="submit" variant="contained">
            create
          </Button>
        </form>
        <Button onClick={() => setVisible(false)} variant="outlined">
          cancel
        </Button>
      </div>
    </Paper>
  )
}

export default BlogForm
