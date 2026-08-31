import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  Paper,
  Typography,
} from '@mui/material'

const Blog = ({ blog, user, onLike, onDelete, singleView = false, linkTitle = false }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)
  const creatorUsername = typeof blog.user === 'object' ? blog.user.username : null
  const creatorId = typeof blog.user === 'object' ? blog.user.id : blog.user
  const isCreator = user && (creatorUsername === user.username || creatorId === user.id)
  const showDetails = singleView || detailsVisible

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  return (
    <Paper style={blogStyle} className="blog">
      <Typography className="blog-info">
        {singleView || !linkTitle ? (
          <h2 style={{ marginLeft: '15px' }}>{blog.title} <br />by {blog.author}</h2>
        ) : (
          <>
            <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
          </>
        )}
      </Typography>
      {showDetails && (
        <Paper className="blog-details" sx={{ mt: 2, p: 2 }}>
          <Typography className="blog-url">{blog.url}</Typography>
          <div>
            <Typography className="blog-likes">Likes {blog.likes}</Typography>
            {user && <Button variant="outlined" onClick={() => onLike(blog)}>like</Button>}
          </div>
          <div>
            <Typography className="blog-creator">Added by {blog.user?.name}</Typography>
          </div>
          {isCreator && (
            <Button onClick={() => onDelete?.(blog.id, blog.title)} variant="outlined" color="error">
              remove
            </Button>
          )}
        </Paper>
      )}
    </Paper>
  )
}

export default Blog