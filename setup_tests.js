const fs = require('fs');
const path = require('path');

const dirs = [
  'selenium-tests/pages',
  'selenium-tests/tests',
  'selenium-tests/utils',
  'selenium-tests/reports',
  'selenium-tests/screenshots',
  'appium-tests/pages',
  'appium-tests/tests',
  'appium-tests/utils',
  'appium-tests/reports',
  'appium-tests/screenshots'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

console.log("Directories created successfully.");
