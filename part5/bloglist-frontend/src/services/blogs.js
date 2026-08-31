import axios from 'axios'
const baseUrl = '/api/blogs'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = (blog, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const request = axios.post(baseUrl, blog, config)
  return request.then(response => response.data)
}

const update = blog => {
  const updatedBlog = {
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes,
    user: typeof blog.user === 'object' ? blog.user.id : blog.user,
  }

  const request = axios.put(`${baseUrl}/${blog.id}`, updatedBlog)
  return request.then(response => response.data)
}

const remove = (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  }

  const request = axios.delete(`${baseUrl}/${id}`, config)
  return request.then(response => response.data)
}

export default { getAll, create, update, remove }