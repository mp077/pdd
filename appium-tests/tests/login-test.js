describe('DentPulse Mobile Authentication', () => {
    it('[TC_MOB_001] should successfully login as a Doctor', async function () {
        // Wait for the app to load
        await driver.pause(3000); 

        // Use accessibility ids created earlier mapped to data-testid in React Native
        const emailInput = await $('~email-input');
        await emailInput.waitForExist({ timeout: 15000 });
        await emailInput.setValue('m@p.com');
        
        const passwordInput = await $('~password-input');
        await passwordInput.waitForExist({ timeout: 5000 });
        await passwordInput.setValue('123456');

        const loginBtn = await $('~login-button');
        await loginBtn.waitForExist({ timeout: 5000 });
        await loginBtn.click();

        // Validate we reached the dashboard by checking for a dashboard specific element
        const dashboardNav = await $('~nav-dashboard');
        await dashboardNav.waitForExist({ timeout: 15000 });
        expect(await dashboardNav.isExisting()).toBe(true);
    });
});
