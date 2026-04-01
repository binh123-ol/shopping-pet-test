const ExcelJS = require('exceljs');
const path = require('path');

class ExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.results = [];
    }

    addResult(module, id, description, status, error = '', duration = 0) {
        this.results.push({ module, id, description, status, error, duration });
    }

    async save() {
        const templatePath = path.join(__dirname, 'mau_testcase.xlsx');
        const filePath = path.join(__dirname, 'Test_Report.xlsx');

        try {
            await this.workbook.xlsx.readFile(templatePath);
        } catch (error) {
            // Fallback to basic structure if template not found
            const sheet = this.workbook.addWorksheet('Test Results');
            sheet.columns = [
                { header: 'Module', key: 'module', width: 25 },
                { header: 'Test Case ID', key: 'id', width: 15 },
                { header: 'Description', key: 'description', width: 50 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Error Message', key: 'error', width: 50 },
                { header: 'Execution Time (ms)', key: 'duration', width: 20 }
            ];
            this.results.forEach(res => sheet.addRow(res));
            await this.workbook.xlsx.writeFile(filePath);
            return;
        }

        const sheet = this.workbook.getWorksheet(1);
        
        // Group results by Module
        const resultsByModule = {};
        this.results.forEach(res => {
            if (!resultsByModule[res.module]) resultsByModule[res.module] = [];
            resultsByModule[res.module].push(res);
        });

        // Clear existing data from row 8
        const lastRow = sheet.rowCount;
        for (let i = lastRow; i >= 8; i--) {
            sheet.spliceRows(i, 1);
        }

        for (const [module, results] of Object.entries(resultsByModule)) {
            // Add Module header row
            const headerRow = sheet.addRow([module]);
            headerRow.font = { bold: true };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            results.forEach(res => {
                const newRow = sheet.addRow([]);
                newRow.getCell(1).value = res.id;
                newRow.getCell(2).value = res.module;
                newRow.getCell(4).value = res.description;
                
                // Status mapping to Chrome (Column 11)
                const chromeCell = newRow.getCell(11);
                chromeCell.value = res.status === 'Passed' ? 'Pass' : 'Fail';
                if (res.status === 'Passed') {
                    chromeCell.font = { color: { argb: 'FF008000' }, bold: true };
                } else {
                    chromeCell.font = { color: { argb: 'FFFF0000' }, bold: true };
                }

                // Error message to Note (Column 19)
                newRow.getCell(19).value = res.error || '';
                
                // Add Date (Column 17)
                newRow.getCell(17).value = new Date().toLocaleDateString();

                // Style all cells in the row
                newRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: {style:'thin'},
                        left: {style:'thin'},
                        bottom: {style:'thin'},
                        right: {style:'thin'}
                    };
                });
            });
        }

        await this.workbook.xlsx.writeFile(filePath);
        console.log(`Excel report saved using template to: ${filePath}`);
    }
}

module.exports = new ExcelReporter();
