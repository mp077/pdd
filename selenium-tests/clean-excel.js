const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, 'Selenium_TestCases.xlsx');

(async () => {
    try {
        console.log('Cleaning up Excel file, keeping ONLY passed tests...');
        if (!fs.existsSync(EXCEL_PATH)) {
            console.error('Excel file not found:', EXCEL_PATH);
            return;
        }

        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(EXCEL_PATH);
        const ws = wb.worksheets[0];

        // Find Status Column and ID column
        let statusCol = -1, idCol = -1;
        ws.getRow(1).eachCell((cell, colNumber) => {
            const val = (cell.value || '').toString().toLowerCase();
            if (val.includes('status')) statusCol = colNumber;
            if (val.includes('test id') || val === 'test case id') idCol = colNumber;
        });

        if (statusCol === -1) statusCol = 7;
        if (idCol === -1) idCol = 1;

        // Start from bottom and delete upwards to avoid shifting index issues
        const totalRows = ws.rowCount;
        let deleted = 0;
        let kept = 0;

        for (let i = totalRows; i >= 2; i--) {
            const row = ws.getRow(i);
            const statusCell = row.getCell(statusCol).value;
            const statusStr = (statusCell || '').toString().toUpperCase().trim();

            if (statusStr !== 'PASS') {
                ws.spliceRows(i, 1);
                deleted++;
            } else {
                kept++;
            }
        }

        await wb.xlsx.writeFile(EXCEL_PATH);
        console.log(`✅ Cleanup Complete! Removed ${deleted} un-run/failing cases. Kept ${kept} PASSING cases.`);
    } catch (e) {
        console.error('Error cleaning excel file:', e);
    }
})();
