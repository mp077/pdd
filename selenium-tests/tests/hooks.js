const { updateExcelTestResult } = require('../utils/excel-updater');

exports.mochaHooks = {
    async afterEach() {
        const test = this.currentTest;
        if (!test) return;

        const status = test.state === 'passed' ? 'Pass' : 'Fail';
        const errorMessage = test.err ? test.err.message : '';
        
        await updateExcelTestResult('selenium', test.title, status, errorMessage);
    }
};
