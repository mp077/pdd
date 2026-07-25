const { Builder, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

class DriverUtils {
  static async initDriver() {
    const options = new chrome.Options();
    options.addArguments('--disable-web-security');
    options.addArguments('--allow-running-insecure-content');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-features=PasswordManager,Autofill');
    options.addArguments('--incognito');
    // options.addArguments('--headless'); // Uncomment if you want it to run silently
    
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
      
    await driver.manage().window().maximize();
    return driver;
  }

  static async takeScreenshot(driver, testName) {
    const screenshotDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshot = await driver.takeScreenshot();
    const filePath = path.join(screenshotDir, `${testName.replace(/[^a-zA-Z0-9]/g, '_')}_failed.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
    return filePath;
  }

  static async waitAndClick(driver, locator, timeout = 10000, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const el = await driver.wait(until.elementLocated(locator), timeout);
        // Use a bubbling MouseEvent so React Native Web's synthetic event system fires
        await driver.executeScript(`
          var el = arguments[0];
          // Try native click first (works for real <a> and <button> tags)
          el.click();
          // Also dispatch a bubbling mouse event to trigger React's synthetic handlers
          var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
          el.dispatchEvent(evt);
        `, el);
        await driver.sleep(1200); // Wait for React state update and re-render
        return el;
      } catch (err) {
        if (i === retries - 1) throw err;
        await driver.sleep(1000); // Backoff before retry
      }
    }
  }

  static async waitAndSendKeys(driver, locator, text, timeout = 10000, retries = 3) {
    const { Key } = require('selenium-webdriver');
    for (let i = 0; i < retries; i++) {
      try {
        const el = await driver.wait(until.elementLocated(locator), timeout);
        // Scroll element into view before interacting
        await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', el);
        await driver.sleep(300);
        // Click to focus
        await driver.executeScript('arguments[0].click();', el);
        await driver.sleep(100);
        // Select all and delete existing content (works with React controlled inputs)
        await el.sendKeys(Key.CONTROL, 'a');
        await el.sendKeys(Key.DELETE);
        await driver.sleep(100);
        if (text) {
          await el.sendKeys(text);
        }
        return el;
      } catch (err) {
        if (i === retries - 1) throw err;
        await driver.sleep(1000); // Backoff before retry
      }
    }
  }
}

module.exports = DriverUtils;
