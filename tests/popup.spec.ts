import { test, expect } from './fixtures'

test.describe('Popup page tests', () => {
    // Mock data for testing purposes
    const mockScheduleData = [
        {
            name: 'Meeting with Team',
            start_timestamp: '2024-08-15T10:00:00Z',
            end_timestamp: '2024-08-15T11:00:00Z',
            description: 'Discuss project progress',
            recurrence: null,
            case: { title: 'Case 123' }
        }
    ];

    // Setup before each test
    test.beforeEach(async ({ page }) => {
        // Load the extension popup page
        await page.goto(
            `chrome-extension://aohajaelhipbamnilfnehkcpecpeacmd/src/scripts/popup/popup.html`
        );

        // Inject a script to set the JWT in chrome.storage.local
        await page.evaluate(() => {
            chrome.storage.local.set({
                jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcyMzcyNjAwMiwiZXhwIjoxNzIzODEyNDAyfQ.NlethVUAuyw8U_9i8_Gc_vUH9UeLA8LcxS9OLRSks7Y'
            });
        });

        // Mock the schedule API call
        await page.route('**/schedule', route =>
            route.fulfill({
                status: 200,
                body: JSON.stringify({ data: mockScheduleData }),
                headers: { 'Content-Type': 'application/json' }
            })
        );
    });

    test('should load and display the user schedule', async ({ page }) => {
        await expect(page.locator('text=Upcoming Schedule')).toBeVisible();
        await expect(page.locator('text=Meeting with Team')).toBeVisible();
        await expect(page.locator('text=10:00 AM - 11:00 AM')).toBeVisible();
        await expect(page.locator('text=Discuss project progress')).toBeVisible();
        await expect(page.locator('text=Case 123')).toBeVisible();
    });

    test('should allow the user to change the date range', async ({ page }) => {
        // Interact with the date pickers
        const startDateInput = page.locator('input[name="startDate"]');
        const endDateInput = page.locator('input[name="endDate"]');
        // Change the start and end dates
        await startDateInput.fill('2024-08-14');
        await endDateInput.fill('2024-08-21');
        // Verify the date inputs reflect the correct values
        await expect(startDateInput).toHaveValue('2024-08-14');
        await expect(endDateInput).toHaveValue('2024-08-21');
    });

    test('should allow the user to log out', async ({ page }) => {
        await page.click('text=Logout');
        await expect(
            page.locator('text=Welcome, tutor. Please sign in to access your schedule')
        ).toBeVisible();
    });
});
