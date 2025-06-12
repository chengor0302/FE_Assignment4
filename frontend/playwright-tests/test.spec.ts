import { test, expect } from '@playwright/test';

const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  username: 'testuser123',
  password: 'testpassword',
};

test.beforeEach(async ({ page, request }) => {
  // Register the user (ignore errors if user already exists, but print for debug)
  const regRes = await request.post('http://localhost:3001/users', {
    data: testUser,
  });
  if (regRes.status() !== 201 && regRes.status() !== 400) {
    console.log('Registration response status:', regRes.status());
    console.log('Registration response body:', await regRes.text());
  }

  // Login to get the token and user
  const res = await request.post('http://localhost:3001/login', {
    data: { username: testUser.username, password: testUser.password },
  });

  if (res.status() !== 200) {
    console.log('Login failed:', res.status(), await res.text());
    throw new Error('Login failed');
  }

  const { token, user } = await res.json();

  // Set token and user in localStorage before the app loads
  await page.addInitScript(([token, user]) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
  }, [token, user]);

  await page.goto('http://localhost:3000');
});

test.describe('Notes App CRUD', () => {

  test('Create a new note', async ({ page }) => {
    await page.getByRole('button', { name: 'Add New Note' }).click();

    const textbox = page.locator('[name="text_input_new_note"]');
    await textbox.waitFor({ state: 'visible', timeout: 10000 });
    await textbox.fill('Test Note');

    // Click the save button
    const saveButton = page.locator('[name="text_input_save_new_note"]');
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();

    // Verify notification
    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Added a new note', { timeout: 10000 });
  });

  test('Read notes from server', async ({ page }) => {
    const notes = page.locator('.note');
    await expect(notes.first()).toBeVisible();
  
    const firstNoteTitle = notes.first().locator('h2');
    await expect(firstNoteTitle).not.toBeEmpty();
  });
  

  test('Update an existing note', async ({ page }) => {
    const editButton = page.locator('[data-testid^="edit-"]').first();
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click();

    const textarea = page.locator('[data-testid^="text_input-"]').first();
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.fill('Updated Note Content');

    const saveButton = page.locator('[data-testid^="text_input_save-"]').first();
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();

    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Note updated', { timeout: 5000 });
  });

  test('Delete a note', async ({ page }) => {
    const deleteButton = page.locator('[name^="delete-"]').first();
    await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await deleteButton.click();

    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('Pagination buttons exist', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'First' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Last' })).toBeVisible();
  });
});
