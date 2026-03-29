const ExcelJS = require('exceljs');
const path = require('path');

class ExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.sheet = this.workbook.addWorksheet('Test Results');
        this.results = [];
        
        // Setup headers
        this.sheet.columns = [
            { header: 'Module', key: 'module', width: 25 },
            { header: 'Test Case ID', key: 'id', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Error Message', key: 'error', width: 50 },
            { header: 'Execution Time (ms)', key: 'duration', width: 20 }
        ];

        // Style headers
        this.sheet.getRow(1).font = { bold: true };
        this.sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
    }

    addResult(module, id, description, status, error = '', duration = 0) {
        this.results.push({ module, id, description, status, error, duration });
    }

    async save() {
        this.results.forEach(res => {
            const row = this.sheet.addRow(res);
            // Color status cell
            const statusCell = row.getCell('status');
            if (res.status === 'Passed') {
                statusCell.font = { color: { argb: 'FF008000' }, bold: true };
            } else if (res.status === 'Failed') {
                statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
            }
        });

        const filePath = path.join(__dirname, 'Test_Report.xlsx');
        await this.workbook.xlsx.writeFile(filePath);
        console.log(`Excel report saved to: ${filePath}`);
    }
}

module.exports = new ExcelReporter();
