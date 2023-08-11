const fs = require('fs');
const csv = require('csv-parser');

function readCSVFile(filePath, column1, column2,column3) {
    return new Promise((resolve, reject) => {
        const saleData = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row[column1] && row[column2]) {
                    saleData.push({
                        saleID: row[column1],
                        saleValue_month: row[column2],
                        saleName: row[column3]
                    });
                }
            })
            .on('end', () => {
                resolve(saleData);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

module.exports = readCSVFile;
