const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const fileNames = ['Selenium_TestCases.xlsx'];
const verifiedTestIds = [
  'TC_WEB_001', 'TC_WEB_004',
  'TC_WEB_005', 'TC_WEB_006',
  'TC_WEB_010', 'TC_WEB_011', 'TC_WEB_012',
  'TC_WEB_015', 'TC_WEB_016',
  'TC_WEB_020', 'TC_WEB_021',
  'TC_WEB_025', 'TC_WEB_026'
];

async function updateExcelFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${fileName}: file not found.`);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  let updatedCount = 0;
  
  // Update each worksheet
  workbook.worksheets.forEach(sheet => {
    // Determine column indices dynamically
    const headerRow = sheet.getRow(1);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
      colMap[cell.value] = colNumber;
    });

    // Check if we need to add an Execution Date column
    if (!colMap['Execution Date']) {
      const newColNum = headerRow.cellCount + 1;
      headerRow.getCell(newColNum).value = 'Execution Date';
      headerRow.getCell(newColNum).font = { bold: true };
      colMap['Execution Date'] = newColNum;
    }

    const tcIdCol = colMap['Test Case ID'] || colMap['Test ID'];
    const statusCol = colMap['Status'];
    const actualResCol = colMap['Actual Result'];
    const execDateCol = colMap['Execution Date'];
    const remarksCol = colMap['Remarks'] || colMap['Comments'];

    if (!tcIdCol) {
      console.log(`Skipping sheet "${sheet.name}" in ${fileName}: No Test Case ID column found.`);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const idCell = row.getCell(tcIdCol);
      if (idCell.value && verifiedTestIds.includes(idCell.value.toString().trim())) {
        if (statusCol) {
          const sCell = row.getCell(statusCol);
          sCell.value = 'PASS';
          sCell.font = { bold: true, color: { argb: 'FF006100' } };
          sCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        }
        
        if (actualResCol) {
          row.getCell(actualResCol).value = 'Matches Expected Result';
        }
        
        if (execDateCol) {
          row.getCell(execDateCol).value = today;
        }
        
        if (remarksCol) {
          row.getCell(remarksCol).value = 'Manually Verified';
        }

        updatedCount++;
      }
    });
  });

  if (updatedCount > 0) {
    await workbook.xlsx.writeFile(filePath);
    console.log(`Successfully updated ${updatedCount} rows in ${fileName}`);
  } else {
    console.log(`No verified test IDs matched in ${fileName}`);
  }
}

async function run() {
  for (const file of fileNames) {
    try {
      await updateExcelFile(file);
    } catch (e) {
      console.error(`Error updating ${file}:`, e.message);
    }
  }
  console.log('Done.');
}

run();
