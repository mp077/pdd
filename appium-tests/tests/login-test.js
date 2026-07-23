describe('DentPulse Mobile Authentication', () => {
    it('[TC_MOB_001] should successfully login as a Doctor', async function () {
        // Use accessibility ids created earlier
        const emailInput = await $('~email-input');
        if(await emailInput.isExisting()) {
             await emailInput.setValue('doctor@dentpulse.com');
        } else {
             // Fallback to android specific xpath for Expo apps
             const input = await $('//android.widget.EditText[@text="Email"]');
             await input.setValue('doctor@dentpulse.com');
        }
        
        const passwordInput = await $('//android.widget.EditText[contains(@text, "Password") or @password="true"]');
        await passwordInput.setValue('password123');

        const loginBtn = await $('~Login Button');
        if(await loginBtn.isExisting()) {
             await loginBtn.click();
        } else {
             const btn = await $('//android.widget.TextView[@text="Sign In"]/..');
             await btn.click();
        }

        // Validate we reached the dashboard
        const dashboardHeader = await $('//android.widget.TextView[contains(@text, "Welcome back")]');
        await dashboardHeader.waitForExist({ timeout: 15000 });
        expect(await dashboardHeader.isExisting()).toBe(true);
    });
});
