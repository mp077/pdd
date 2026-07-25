/**
 * bulk-update-excel.js
 * Reads the latest Mochawesome JSON report and upserts every test result
 * into Selenium_TestCases.xlsx – adding new rows for tests not yet in the sheet.
 *
 * Run:  node bulk-update-excel.js
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const REPORT_PATH  = path.join(__dirname, 'reports', 'Selenium_Web_Report.json');
const EXCEL_PATH   = path.join(__dirname, 'Selenium_TestCases.xlsx');

// ── Module mapping ────────────────────────────────────────────────────────────
function getModule(testId) {
  const id = testId.toUpperCase();
  if (/TC_WEB_00[1-4]$|TC_WEB_03[0-6]$/.test(id))                    return 'Authentication';
  if (/TC_WEB_00[5-9]$|TC_WEB_040$|TC_WEB_041$/.test(id))            return 'Dashboard';
  if (/TC_WEB_01[0-9]$/.test(id))                                      return 'Patients';
  if (/TC_WEB_1[0-2][0-9]$/.test(id))                                  return 'Patient Profile';
  if (/TC_WEB_01[5-6]|TC_WEB_1[5-7][0-9]$/.test(id))                  return 'Treatment Planning';
  if (/TC_WEB_02[0-9]$|TC_WEB_1[3-4][0-9]$/.test(id))                 return 'Prescription';
  if (/TC_WEB_05[0-9]$|TC_WEB_1[89][0-9]$/.test(id))                  return 'Schedule';
  if (/TC_WEB_025$|TC_WEB_026$|TC_WEB_02[7-9]$|TC_WEB_030_ADM|TC_WEB_031_ADM|TC_WEB_032_ADM/.test(id)) return 'Admin Portal';
  if (/TC_WEB_06[0-6]$|TC_WEB_2[1-9][0-9]$/.test(id))                 return 'Profile';
  if (/TC_WEB_200$|TC_WEB_20[0-9]$|TC_WEB_21[0-9]$/.test(id))         return 'Dashboard / Auth / Profile';
  return 'General';
}

// ── Flatten Mochawesome results ────────────────────────────────────────────────
function flattenResults(node, out = {}) {
  (node.tests || []).forEach(t => {
    const m = t.title.match(/\[(TC_[A-Z0-9_]+)\]/);
    if (!m) return;
    out[m[1]] = {
      id:          m[1],
      title:       t.title.replace(/\[TC_[A-Z0-9_]+\]\s*/, '').trim(),
      status:      t.state === 'passed' ? 'PASS' : (t.state === 'failed' ? 'FAIL' : 'NOT RUN'),
      error:       t.err?.message?.substring(0, 250) || '',
      duration:    t.duration || 0,
    };
  });
  (node.suites || []).forEach(s => flattenResults(s, out));
  (node.results || []).forEach(s => flattenResults(s, out));
  return out;
}

// ── Column discovery ───────────────────────────────────────────────────────────
function discoverCols(ws) {
  const cols = { id: 1, module: 2, desc: 3, priority: 4, type: 5, actual: 6, status: 7, date: 8, remarks: 9, duration: 10 };
  ws.getRow(1).eachCell((cell, col) => {
    const v = (cell.value || '').toString().toLowerCase();
    if (v.includes('test id') || v === 'test case id')   cols.id       = col;
    if (v.includes('module') || v.includes('feature'))   cols.module   = col;
    if (v.includes('description') || v.includes('name')) cols.desc     = col;
    if (v.includes('priority'))                           cols.priority = col;
    if (v.includes('type'))                               cols.type     = col;
    if (v.includes('actual'))                             cols.actual   = col;
    if (v.includes('status'))                             cols.status   = col;
    if (v.includes('date'))                               cols.date     = col;
    if (v.includes('remark'))                             cols.remarks  = col;
    if (v.includes('duration'))                           cols.duration = col;
  });
  return cols;
}

// ── Style helper ───────────────────────────────────────────────────────────────
function styleStatus(cell, status) {
  if (status === 'PASS') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    cell.font = { bold: true, color: { argb: 'FF006100' } };
  } else if (status === 'FAIL') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
    cell.font = { bold: true, color: { argb: 'FF9C0006' } };
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    cell.font = { bold: false, color: { argb: 'FF7F6000' } };
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('❌ Report not found:', REPORT_PATH);
    console.error('   Run  npm test  first to generate the Mochawesome JSON report.');
    process.exit(1);
  }
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ Excel not found:', EXCEL_PATH);
    process.exit(1);
  }

  const raw     = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const results = flattenResults(raw);

  const totalTests = Object.keys(results).length;
  const passed     = Object.values(results).filter(r => r.status === 'PASS').length;
  const failed     = Object.values(results).filter(r => r.status === 'FAIL').length;

  console.log(`📊 Report: ${totalTests} tests found  (${passed} PASS / ${failed} FAIL)`);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);
  const ws = wb.worksheets[0];
  const C  = discoverCols(ws);

  // Build lookup: testId → rowNumber
  const existingRows = {};
  ws.eachRow((row, rn) => {
    if (rn === 1) return;
    const v = row.getCell(C.id).value;
    if (v) existingRows[v.toString().trim()] = rn;
  });

  const now         = new Date().toLocaleString();
  let   updated     = 0;
  let   inserted    = 0;

  for (const [id, r] of Object.entries(results)) {
    const actualText = r.status === 'PASS'
      ? 'Functionality works as expected in automated execution.'
      : (r.error || 'Test failed during execution.');

    if (existingRows[id] !== undefined) {
      // ── UPDATE existing row ──────────────────────────────────────────────
      const row = ws.getRow(existingRows[id]);
      styleStatus(row.getCell(C.status), r.status);
      row.getCell(C.status).value   = r.status;
      row.getCell(C.actual).value   = actualText;
      row.getCell(C.date).value     = now;
      row.getCell(C.remarks).value  = 'Automated Execution';
      if (C.duration) row.getCell(C.duration).value = `${r.duration}ms`;
      row.commit();
      updated++;
    } else {
      // ── INSERT new row ───────────────────────────────────────────────────
      const newRn  = ws.rowCount + 1;
      const newRow = ws.getRow(newRn);

      newRow.getCell(C.id).value       = id;
      newRow.getCell(C.module).value   = getModule(id);
      newRow.getCell(C.desc).value     = r.title;
      newRow.getCell(C.actual).value   = actualText;
      styleStatus(newRow.getCell(C.status), r.status);
      newRow.getCell(C.status).value   = r.status;
      newRow.getCell(C.date).value     = now;
      newRow.getCell(C.remarks).value  = 'Automated Execution – New Test';
      if (C.duration) newRow.getCell(C.duration).value = `${r.duration}ms`;
      newRow.commit();
      inserted++;
    }
  }

  await wb.xlsx.writeFile(EXCEL_PATH);

  console.log('');
  console.log('✅ Excel updated successfully!');
  console.log(`   ✔ Updated   : ${updated} existing rows`);
  console.log(`   ➕ Inserted  : ${inserted} new rows`);
  console.log(`   📝 Total     : ${updated + inserted} test cases in Excel`);
  console.log(`   📁 File      : ${EXCEL_PATH}`);
})();
