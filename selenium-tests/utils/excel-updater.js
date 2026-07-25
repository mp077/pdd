const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Map test IDs to feature/module names
function getModuleForTestId(testId) {
    const id = testId.toUpperCase();
    if (id.includes('001') || id.includes('002') || id.includes('003') || id.includes('004') || id.includes('030') || id.includes('031') || id.includes('032') || id.includes('033') || id.includes('034') || id.includes('035') || id.includes('036')) return 'Authentication';
    if (id.includes('005') || id.includes('006') || id.includes('007') || id.includes('008') || id.includes('009') || id.includes('040') || id.includes('041') || id.includes('200') || id.includes('201') || id.includes('202') || id.includes('203') || id.includes('204') || id.includes('205') || id.includes('206') || id.includes('207') || id.includes('208')) return 'Dashboard';
    if (id.includes('010') || id.includes('011') || id.includes('012') || id.includes('013') || id.includes('014') || id.includes('015_P') || id.includes('016') || id.includes('017') || id.includes('018') || id.includes('019')) return 'Patients';
    if (id.includes('100') || id.includes('101') || id.includes('102') || id.includes('103') || id.includes('104') || id.includes('105') || id.includes('106') || id.includes('107') || id.includes('108') || id.includes('109') || id.includes('110') || id.includes('111') || id.includes('112') || id.includes('113') || id.includes('114') || id.includes('115') || id.includes('116') || id.includes('117') || id.includes('118') || id.includes('119') || id.includes('120')) return 'Patient Profile';
    if (id.includes('015') || id.includes('016_TX') || id.includes('150') || id.includes('151') || id.includes('152') || id.includes('153') || id.includes('154') || id.includes('155') || id.includes('156') || id.includes('157') || id.includes('158') || id.includes('159') || id.includes('160') || id.includes('161') || id.includes('162') || id.includes('163') || id.includes('164') || id.includes('165') || id.includes('166') || id.includes('167') || id.includes('168') || id.includes('169') || id.includes('170')) return 'Treatment Planning';
    if (id.includes('020') || id.includes('021') || id.includes('022') || id.includes('023') || id.includes('024') || id.includes('025_RX') || id.includes('026_RX') || id.includes('027_RX') || id.includes('028_RX') || id.includes('130') || id.includes('131') || id.includes('132') || id.includes('133') || id.includes('134') || id.includes('135') || id.includes('136') || id.includes('137') || id.includes('138') || id.includes('139') || id.includes('140') || id.includes('141') || id.includes('142') || id.includes('143') || id.includes('144') || id.includes('145') || id.includes('146') || id.includes('147') || id.includes('148') || id.includes('149')) return 'Prescription';
    if (id.includes('050') || id.includes('051') || id.includes('052') || id.includes('053') || id.includes('054') || id.includes('055') || id.includes('180') || id.includes('181') || id.includes('182') || id.includes('183') || id.includes('184') || id.includes('185') || id.includes('186') || id.includes('187') || id.includes('188') || id.includes('189') || id.includes('190') || id.includes('191') || id.includes('192') || id.includes('193') || id.includes('194') || id.includes('195') || id.includes('196') || id.includes('197') || id.includes('198') || id.includes('199')) return 'Schedule';
    if (id.includes('025') || id.includes('026') || id.includes('027') || id.includes('028') || id.includes('029') || id.includes('030_ADM') || id.includes('031_ADM') || id.includes('032_ADM')) return 'Admin Portal';
    if (id.includes('060') || id.includes('061') || id.includes('062') || id.includes('063') || id.includes('064') || id.includes('065') || id.includes('066') || id.includes('212') || id.includes('213') || id.includes('214') || id.includes('215') || id.includes('216') || id.includes('217') || id.includes('218') || id.includes('219')) return 'Profile';
    return 'General';
}

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
        let idCol = -1, statusCol = -1, actualCol = -1, dateCol = -1, remarksCol = -1, moduleCol = -1, descCol = -1;
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            const val = cell.value ? cell.value.toString().toLowerCase() : '';
            if (val.includes('test id') || val === 'test case id') idCol = colNumber;
            if (val.includes('status')) statusCol = colNumber;
            if (val.includes('actual result')) actualCol = colNumber;
            if (val.includes('execution date')) dateCol = colNumber;
            if (val.includes('remarks')) remarksCol = colNumber;
            if (val.includes('module') || val.includes('feature')) moduleCol = colNumber;
            if (val.includes('description') || val.includes('test case name')) descCol = colNumber;
        });

        // Fallbacks
        if (idCol === -1) idCol = 1;
        if (statusCol === -1) statusCol = 7;
        if (actualCol === -1) actualCol = 6;
        if (dateCol === -1) dateCol = 8;
        if (remarksCol === -1) remarksCol = 9;
        if (moduleCol === -1) moduleCol = 2;
        if (descCol === -1) descCol = 3;

        const statusColor = (status.toLowerCase().includes('pass'))
            ? { fill: 'FFC6EFCE', font: 'FF006100' }
            : { fill: 'FFFFC7CE', font: 'FF9C0006' };
        const actualText = status.toLowerCase().includes('pass')
            ? 'Functionality works as expected in automated execution.'
            : (errorMessage.substring(0, 200) || 'Test failed during execution.');

        let rowFound = false;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const cellVal = row.getCell(idCol).value;
            if (cellVal && cellVal.toString() === testId) {
                rowFound = true;
                const statusCell = row.getCell(statusCol);
                statusCell.value = status.toUpperCase();
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor.fill } };
                statusCell.font = { color: { argb: statusColor.font }, bold: true };
                row.getCell(actualCol).value = actualText;
                row.getCell(dateCol).value = new Date().toLocaleString();
                row.getCell(remarksCol).value = 'Automated Execution';
            }
        });

        // ✅ AUTO-INSERT: If test ID not found, append a new row
        if (!rowFound) {
            const newRowNumber = worksheet.rowCount + 1;
            const newRow = worksheet.getRow(newRowNumber);

            // Derive a clean description from test title (strip the [TC_WEB_xxx] prefix)
            const description = testTitle.replace(/\[TC_[A-Z0-9_]+\]\s*/, '');

            newRow.getCell(idCol).value = testId;
            newRow.getCell(moduleCol).value = getModuleForTestId(testId);
            newRow.getCell(descCol).value = description;
            newRow.getCell(actualCol).value = actualText;

            const statusCell = newRow.getCell(statusCol);
            statusCell.value = status.toUpperCase();
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColor.fill } };
            statusCell.font = { color: { argb: statusColor.font }, bold: true };

            newRow.getCell(dateCol).value = new Date().toLocaleString();
            newRow.getCell(remarksCol).value = 'Automated Execution – New Test';
            newRow.commit();
        }

        await workbook.xlsx.writeFile(filePath);
    } catch (e) {
        console.error(`[Excel Updater Error]:`, e);
    }
}

module.exports = { updateExcelTestResult };



