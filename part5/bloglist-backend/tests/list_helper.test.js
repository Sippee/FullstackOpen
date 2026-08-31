const { describe, test } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithZeroBlogs = []

  const listWithOneBlog = [
    {
      title: 'testing1',
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    },
  ]

  const listWithMultipleBlogs = [
    ...listWithOneBlog,
    {
      title: 'testing2',
      author: 'tester2',
      url: 'testurl2',
      likes: 5,
    },
  ]

  test('when list has no blogs, equals zero', () => {
    const result = listHelper.totalLikes(listWithZeroBlogs)
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 3)
  })

  test('when list has multiple blogs, equals the total likes', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 8)
  })
})

describe('favorite blog', () => {
  const blogs = [
    {
      title: 'testing1',
      author: 'tester1',
      url: 'testurl1',
      likes: 3,
    },
    {
      title: 'testing2',
      author: 'tester2',
      url: 'testurl2',
      likes: 5,
    },
    {
      title: 'testing3',
      author: 'tester3',
      url: 'testurl3',
      likes: 4,
    },
  ]

  test('returns the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[1])
  })
})
