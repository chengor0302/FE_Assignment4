import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {

  // Log in
  const res = await request.post('http://localhost:3001/login', {
    data: { username: 'tamarr', password: 'tamarr' }
  });
  const { token, user } = await res.json();

  // Set token and user in localStorage
  await page.addInitScript(([token, user]) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
  }, [token, user]);

  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshot-home-before-tests.png' });
});

test.describe('Notes App CRUD', () => {

  test('Create a new note', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.screenshot({ path: 'screenshot-login-home.png' });

    await page.goto('http://localhost:3000/login');
    await page.screenshot({ path: 'screenshot-login-form.png' });
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.screenshot({ path: 'screenshot-login-filled.png' });
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshot-after-login.png' });
    await page.getByRole('button', { name: 'Add New Note' }).click();
    await page.screenshot({ path: 'screenshot-create-note-form.png' });

    const textbox = page.locator('[name="text_input_new_note"]');
    await textbox.waitFor({ state: 'visible', timeout: 10000 });
    await textbox.fill('Test Note');

    // Click the save button
    const saveButton = page.locator('[name="text_input_save_new_note"]');
    await saveButton.waitFor({ state: 'visible', timeout: 10000 });
    await saveButton.click();

    // Verify notification
    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Added a new note', { timeout: 10000 });
    await page.screenshot({ path: 'screenshot-after-create-note.png' });
  });

  test('Read notes from server', async ({ page }) => {
    const notes = page.locator('.note');
    await expect(notes.first()).toBeVisible();
    await page.screenshot({ path: 'screenshot-read-notes.png' });
  
    const firstNoteTitle = notes.first().locator('h2');
    await expect(firstNoteTitle).not.toBeEmpty();
  });
  

  test('Update an existing note', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.screenshot({ path: 'screenshot-login-home.png' });

    await page.goto('http://localhost:3000/login');
    await page.screenshot({ path: 'screenshot-login-form.png' });
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.screenshot({ path: 'screenshot-login-filled.png' });
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshot-after-login.png' });
    const editButton = page.locator('[data-testid^="edit-"]').first();
    await editButton.waitFor({ state: 'visible', timeout: 5000 });
    await editButton.click();
    await page.screenshot({ path: 'screenshot-edit-note-form.png' });

    const textarea = page.locator('[data-testid^="text_input-"]').first();
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.fill('Updated Note Content');

    const saveButton = page.locator('[data-testid^="text_input_save-"]').first();
    await saveButton.waitFor({ state: 'visible', timeout: 5000 });
    await saveButton.click();

    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Note updated', { timeout: 5000 });
    await page.screenshot({ path: 'screenshot-after-update-note.png' });
  });

  test('Delete a note', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.screenshot({ path: 'screenshot-login-home.png' });

    await page.goto('http://localhost:3000/login');
    await page.screenshot({ path: 'screenshot-login-form.png' });
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.screenshot({ path: 'screenshot-login-filled.png' });
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshot-after-login.png' });
    const deleteButton = page.locator('[name^="delete-"]').first();
    await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await deleteButton.click();
    await page.screenshot({ path: 'screenshot-after-delete-note.png' });

    const notification = page.locator('.notification');
    await expect(notification).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('Pagination buttons exist', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'First' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Last' })).toBeVisible();
    await page.screenshot({ path: 'screenshot-pagination-buttons.png' });
  });

  
});
