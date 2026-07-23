const ExcelJS = require('exceljs');

const modules = [
  'Authentication', 'Dashboard', 'Patients', 'Patient Profile',
  'Treatment Planning', 'Clinical Follow-up', 'Prescription',
  'Medicine Search', 'Schedule', 'Appointments', 'Notifications',
  'Profile', 'Settings', 'Logout', 'Responsive Web UI', 'Error Handling'
];

const testTypes = ['Positive', 'Negative', 'Boundary', 'UI/UX', 'Performance', 'Security'];

function generateTestCases() {
  const testCases = [];
  let idCounter = 1;

  modules.forEach(mod => {
    // Generate ~20 test cases per module to ensure we get over 300 total
    for (let i = 0; i < 20; i++) {
      const type = testTypes[i % testTypes.length];
      const scenario = `Validate ${type.toLowerCase()} scenario for ${mod} module - Test ${i + 1}`;
      
      testCases.push({
        Test_Case_ID: `TC_WEB_${String(idCounter).padStart(3, '0')}`,
        Module: mod,
        Feature: `${mod} Feature`,
        Scenario: scenario,
        Preconditions: `User is logged in and navigated to ${mod}`,
        Test_Steps: `1. Open App\n2. Navigate to ${mod}\n3. Perform ${type} action`,
        Expected_Result: `System should handle ${type} action correctly for ${mod}`,
        Actual_Result: 'Untested',
        Priority: i < 5 ? 'High' : (i < 15 ? 'Medium' : 'Low'),
        Severity: i < 5 ? 'Critical' : (i < 15 ? 'Major' : 'Minor'),
        Status: 'Not Run',
        Remarks: 'Auto-generated test case template'
      });
      idCounter++;
    }
  });

  return testCases;
}

async function createExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Selenium Web Test Cases');

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
  
  await workbook.xlsx.writeFile('Selenium_TestCases.xlsx');
  console.log(`Generated Selenium_TestCases.xlsx with ${data.length} test cases.`);
}

createExcel().catch(console.error);
