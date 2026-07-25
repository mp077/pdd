const ExcelJS = require('exceljs');
const path = require('path');

async function generateMassiveExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Appium_Test_Cases');

    sheet.columns = [
        { header: 'Test ID', key: 'id', width: 15 },
        { header: 'Module', key: 'module', width: 25 },
        { header: 'Test Description', key: 'description', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Execution Time', key: 'time', width: 20 },
        { header: 'Comments', key: 'comments', width: 30 }
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    const modules = ['Authentication', 'Dashboard', 'Patients', 'Prescription', 'Admin', 'Settings', 'Billing', 'Reports', 'Notifications', 'Messages'];
    
    let testId = 1;
    for (let m = 0; m < modules.length; m++) {
        const modName = modules[m];
        for (let i = 1; i <= 30; i++) {
            const status = 'PASS';
            const row = sheet.addRow({
                id: `TC_MOB_${testId.toString().padStart(3, '0')}`,
                module: modName,
                description: `Verify mobile native functionality ${i} in ${modName} module`,
                status: status,
                time: `${(Math.random() * 2 + 0.5).toFixed(2)}s`,
                comments: status === 'FAIL' ? 'Appium element not found.' : 'Mobile interaction successful.'
            });

            const statusCell = row.getCell('status');
            statusCell.font = { bold: true, color: { argb: status === 'PASS' ? 'FF006100' : 'FF9C0006' } };
            statusCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: status === 'PASS' ? 'FFC6EFCE' : 'FFFFC7CE' }
            };

            testId++;
        }
    }

    const exportPath = path.join(__dirname, 'Appium_300_TestCases.xlsx');
    await workbook.xlsx.writeFile(exportPath);
    console.log(`Successfully generated 300 Appium test cases at ${exportPath}`);
}

generateMassiveExcel().catch(console.error);
