const { test, expect, beforeEach, describe } = require('@playwright/test')

const login = async page => {
  await page.goto('/login')
  await page.getByLabel('Username').fill('testuser1')
  await page.getByLabel('Password').fill('password1')
  await page.getByRole('button', { name: 'login' }).click()
  await expect(page).toHaveURL('/')
}

const createBlog = async (page) => {
  await page.getByRole('link', { name: 'new blog' }).click()
  await page.getByLabel('Title').fill('testblog1')
  await page.getByLabel('Author').fill('testauthor1')
  await page.getByLabel('URL').fill('https://testurl1.com')
  await page.getByRole('button', { name: 'create' }).click()
  await expect(page).toHaveURL('/')
}

describe('Blog app', () => {
  beforeEach(async ({ request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        username: 'testuser1',
        name: 'tester1',
        password: 'password1',
      },
    })
  })

  test('login succeeds with correct credentials', async ({ page }) => {
    await login(page)

    await expect(page.getByText('tester1 logged in')).toBeVisible()
    await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
  })

  test('login fails with incorrect credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill('testuser1')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('wrong username or password')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('a logged-in user can create a blog', async ({ page }) => {
    await login(page)
    await createBlog(page)

    await expect(page.locator('.blog')).toContainText('testblog1')
  })

  test('a logged-in user can like a blog', async ({ page }) => {
    await login(page)
    await createBlog(page)
    await page.getByRole('link', { name: 'testblog1' }).click()

    const blog = page.locator('.blog')
    await expect(blog).toContainText('Likes 0')
    await blog.getByRole('button', { name: 'like' }).click()
    await expect(blog).toContainText('Likes 1')
  })

  test('a logged-in user can delete a blog', async ({ page }) => {
    await login(page)
    await createBlog(page)
    await page.getByRole('link', { name: 'testblog1' }).click()

    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'remove' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.locator('.blog')).toHaveCount(0)
  })
})
