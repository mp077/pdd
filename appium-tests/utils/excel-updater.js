const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function updateExcelTestResult(platform, testTitle, status, errorMessage = '') {
    try {
        const filePath = path.join(__dirname, '..', 'Appium_TestCases.xlsx');
        
        if (!fs.existsSync(filePath)) {
            console.log(`[Excel Updater] File not found: ${filePath}`);
            return;
        }

        const match = testTitle.match(/\[(TC_MOB_[A-Z0-9_]+)\]/);
        if (!match) return; // Not a mapped test

        const testId = match[1];
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        let idCol = 1, statusCol = 7, actualCol = 6, dateCol = 8, remarksCol = 9;
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            const val = cell.value ? cell.value.toString().toLowerCase() : '';
            if (val.includes('test id') || val === 'test case id') idCol = colNumber;
            if (val.includes('status')) statusCol = colNumber;
            if (val.includes('actual result')) actualCol = colNumber;
            if (val.includes('execution date')) dateCol = colNumber;
            if (val.includes('remarks')) remarksCol = colNumber;
        });

        let rowFound = false;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const cellVal = row.getCell(idCol).value;
            if (cellVal && cellVal.toString() === testId) {
                rowFound = true;
                
                const statusCell = row.getCell(statusCol);
                statusCell.value = status.toUpperCase();
                
                if (status.toLowerCase() === 'pass' || status.toLowerCase() === 'passed') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                    statusCell.font = { color: { argb: 'FF006100' }, bold: true };
                } else if (status.toLowerCase() === 'fail' || status.toLowerCase() === 'failed') {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
                    statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
                }

                row.getCell(actualCol).value = status.toLowerCase() === 'passed' 
                    ? 'Functionality works as expected in automated Appium execution.' 
                    : (errorMessage.substring(0, 200) || 'Test failed during execution.');
                row.getCell(dateCol).value = new Date().toLocaleString();
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
