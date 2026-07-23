const ExcelJS = require('exceljs');

const modules = [
  'Authentication', 'Dashboard', 'Navigation', 'Patients',
  'Treatment Plan', 'Clinical Follow-up', 'Prescription',
  'Medicine Search', 'Schedule', 'Notifications',
  'Profile', 'Settings', 'Logout', 'Mobile UI Layout',
  'Input Validation', 'API Response Validation', 'Gestures'
];

const testTypes = ['Positive', 'Negative', 'Boundary', 'UI/UX', 'Performance', 'Security', 'Interruption'];

function generateTestCases() {
  const testCases = [];
  let idCounter = 1;

  modules.forEach(mod => {
    // Generate ~18 test cases per module to ensure we get over 300 total (17 * 18 = 306)
    for (let i = 0; i < 18; i++) {
      const type = testTypes[i % testTypes.length];
      const scenario = `Validate mobile ${type.toLowerCase()} scenario for ${mod} module - Test ${i + 1}`;
      
      testCases.push({
        Test_Case_ID: `TC_MOB_${String(idCounter).padStart(3, '0')}`,
        Module: mod,
        Feature: `${mod} Feature`,
        Scenario: scenario,
        Preconditions: `User is logged in on Mobile App and navigated to ${mod}`,
        Test_Steps: `1. Launch App\n2. Navigate to ${mod}\n3. Perform ${type} action on mobile device`,
        Expected_Result: `Mobile system should handle ${type} action correctly for ${mod}`,
        Actual_Result: 'Untested',
        Priority: i < 5 ? 'High' : (i < 12 ? 'Medium' : 'Low'),
        Severity: i < 5 ? 'Critical' : (i < 12 ? 'Major' : 'Minor'),
        Status: 'Not Run',
        Remarks: 'Auto-generated mobile test case template'
      });
      idCounter++;
    }
  });

  return testCases;
}

async function createExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Appium Mobile Test Cases');

  sheet.columns = [
    { header: 'Test Case ID', key: 'Test_Case_ID', width: 15 },
    { header: 'Module', key: 'Module', width: 20 },
    { header: 'Feature', key: 'Feature', width: 20 },
    { header: 'Scenario', key: 'Scenario', width: 40 },
    { header: 'Preconditions', key: 'Preconditions', width: 30 },
    { header: 'Test Steps', key: 'Test_Steps', width: 40 },
    { header: 'Expected Result', key: 'Expected_Result', width: 35 },
    { header: 'Actual Result', key: 'Actual_Result', width: 15 },
    { header: 'Priority', key: 'Priority', width: 10 },
    { header: 'Severity', key: 'Severity', width: 10 },
    { header: 'Status', key: 'Status', width: 10 },
    { header: 'Remarks', key: 'Remarks', width: 20 },
  ];

  const data = generateTestCases();
  data.forEach(tc => {
    sheet.addRow(tc);
  });

  sheet.getRow(1).font = { bold: true };
  
  await workbook.xlsx.writeFile('Appium_TestCases.xlsx');
  console.log(`Generated Appium_TestCases.xlsx with ${data.length} test cases.`);
}

createExcel().catch(console.error);
