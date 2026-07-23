const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function updateExcelTestResult(platform, testTitle, status, errorMessage = '') {
    try {
        const filePath = path.join(__dirname, '..', '..', platform === 'selenium' ? 'selenium-tests' : 'appium-tests', platform === 'selenium' ? 'Selenium_TestCases.xlsx' : 'Appium_TestCases.xlsx');
        
        if (!fs.existsSync(filePath)) {
            console.log(`[Excel Updater] File not found: ${filePath}`);
            return;
        }

        // Extract ID from test title, e.g., "[TC_WEB_001] should login" -> "TC_WEB_001"
        const match = testTitle.match(/\[(TC_[A-Z0-9_]+)\]/);
        if (!match) return; // Not a mapped test

        const testId = match[1];
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        // Find header columns dynamically just in case
        let idCol = -1, statusCol = -1, actualCol = -1, dateCol = -1, remarksCol = -1;
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            const val = cell.value ? cell.value.toString().toLowerCase() : '';
            if (val.includes('test id') || val === 'test case id') idCol = colNumber;
            if (val.includes('status')) statusCol = colNumber;
            if (val.includes('actual result')) actualCol = colNumber;
            if (val.includes('execution date')) dateCol = colNumber;
            if (val.includes('remarks')) remarksCol = colNumber;
        });

        // Fallbacks if exactly named headers aren't found (based on standard generation)
        if (idCol === -1) idCol = 1;
        if (statusCol === -1) statusCol = 7; // Status usually around col 7
        if (actualCol === -1) actualCol = 6;
        if (dateCol === -1) dateCol = 8;
        if (remarksCol === -1) remarksCol = 9;

        let rowFound = false;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const cellVal = row.getCell(idCol).value;
            if (cellVal && cellVal.toString() === testId) {
                rowFound = true;
                
                // Update Status
                const statusCell = row.getCell(statusCol);
                statusCell.value = status.toUpperCase();
                
                // Color coding
                if (status.toLowerCase() === 'pass' || status.toLowerCase() === 'passed') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                    statusCell.font = { color: { argb: 'FF006100' }, bold: true };
                } else if (status.toLowerCase() === 'fail' || status.toLowerCase() === 'failed') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
                    statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
                }

                // Update Actual Result
                row.getCell(actualCol).value = status.toLowerCase() === 'passed' 
                    ? 'Functionality works as expected in automated execution.' 
                    : (errorMessage.substring(0, 200) || 'Test failed during execution.');

                // Update Execution Date
                row.getCell(dateCol).value = new Date().toLocaleString();

                // Update Remarks
                row.getCell(remarksCol).value = 'Automated Execution';
            }
        });

        if (rowFound) {
            await workbook.xlsx.writeFile(filePath);
        }
    } catch (e) {
        console.error(`[Excel Updater Error]:`, e);
    }
}

module.exports = { updateExcelTestResult };
