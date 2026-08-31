import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import Blog from '/src/components/Blog'
import BlogForm from '/src/components/BlogForm'

afterEach(() => {
  cleanup()
})

describe('Blog', () => {
  const blog = {
    title: 'testblog1',
    author: 'testauthor1',
    url: 'https://testurl1.com',
    likes: 7,
    user: { username: 'testuser1', name: 'tester1', id: 'id1' },
  }

  test('unauthenticated users see blog information and likes but no buttons', () => {
    render(<Blog blog={blog} user={null} singleView />)

    expect(screen.getByText(/testblog1/)).not.toBeNull()
    expect(screen.getByText(blog.url)).not.toBeNull()
    expect(screen.getByText(/Likes 7/)).not.toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  test('logged in non-creators see only the like button', () => {
    render(
      <Blog
        blog={blog}
        user={{ username: 'testuser2', id: 'id2' }}
        onLike={() => {}}
        onDelete={() => {}}
        singleView
      />
    )

    expect(screen.getByRole('button', { name: 'like' })).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
  })

  test('the blog creator sees the like and delete buttons', () => {
    render(
      <Blog
        blog={blog}
        user={{ username: 'testuser1', id: 'id1' }}
        onLike={() => {}}
        onDelete={() => {}}
        singleView
      />
    )

    expect(screen.getByRole('button', { name: 'like' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'remove' })).not.toBeNull()
  })

  test('event handler is called twice when like is clicked twice', () => {
    const mockHandler = vi.fn()

    render(
      <Blog
        blog={blog}
        user={{ username: 'testuser1', id: 'id1' }}
        onLike={mockHandler}
        singleView
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'like' }))
    fireEvent.click(screen.getByRole('button', { name: 'like' }))

    expect(mockHandler).toHaveBeenCalledTimes(2)
  })

  test('form calls event handler correctly when creating a new blog', async () => {
    const mockHandler = vi.fn().mockResolvedValue(undefined)

    render(<BlogForm onCreate={mockHandler} />)

    fireEvent.click(screen.getByRole('button', { name: 'create new blog' }))

    const [titleInput, authorInput, urlInput] = screen.getAllByRole('textbox')
    fireEvent.change(titleInput, { target: { value: 'testblog1' } })
    fireEvent.change(authorInput, { target: { value: 'testauthor1' } })
    fireEvent.change(urlInput, { target: { value: 'https://testurl1.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'create' }))

    expect(mockHandler).toHaveBeenCalledTimes(1)
    expect(mockHandler).toHaveBeenCalledWith({
      title: 'testblog1',
      author: 'testauthor1',
      url: 'https://testurl1.com',
    })
  })
})