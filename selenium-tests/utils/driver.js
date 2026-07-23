const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

class DriverUtils {
  static async initDriver() {
    // Assuming chromedriver is in path or installed via npm
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    return driver;
  }

  static async takeScreenshot(driver, testName) {
    const screenshot = await driver.takeScreenshot();
    const filePath = path.join(__dirname, '../screenshots', `${testName.replace(/\s+/g, '_')}_failed.png`);
    fs.writeFileSync(filePath, screenshot, 'base64');
  }
}

module.exports = DriverUtils;
