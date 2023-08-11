const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const Sales = require("../models/Sales.js");
const cloudinary = require("../utils/cloudinary.js")
const { success, failure } = require("../utils/message.js")
const readCSVFile = require('../utils/csvReader.js');


exports.get_single_sale = async function (req, res) {
    try {
        // Populate User
        const singleSale = await Sales.findById(req.body.id)
        res.json(success("Successful", singleSale))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}

exports.get_all_sale = async function (req, res) {
    try {
        const sale = await Sales.find({ user: req.user._id })
        res.json(success("Successful", sale))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}

// module.exports.add_new_sale = async function (req, res) {
//     try {
//         const sales = Sales({
//             user: req.user._id,
//             saleName: req.body.saleName,
//             saleValue_month: req.body.saleValue_month
//         })
//         sales.save()
//         res.json(success("New Sale Added"))
//     } catch (error) {
//         console.log(error)
//         res.send(failure())
//     }
//     res.end()
// }

module.exports.add_new_sale = async function (req, res) {
    try {
        const csv_file_path = process.env.CSV_PATH;
        const column1 = process.env.COLUMN_1; // Replace with the appropriate column name for saleID
        const column2 = process.env.COLUMN_2; // Replace with the appropriate column name for saleValue_month
        const column3 = process.env.COLUMN_3; // Replace with the appropriate column name for saleValue_month

        const saleData = await readCSVFile(csv_file_path, column1, column2,column3);

        console.log(`The sale ID -->`, saleData);

        const existingSales = await Sales.find({ user: req.user._id, saleID: { $in: saleData.map(sale => sale.saleID) } }).select('saleID');

        const existingIDs = existingSales.map(sale => sale.saleID);

        const newSalesToInsert = saleData.filter(sale => !existingIDs.includes(sale.saleID));

        if (newSalesToInsert.length > 0) {
            const salesToInsert = newSalesToInsert.map(sale => ({
                user: req.user._id,
                saleID: sale.saleID,
                saleValue_month: sale.saleValue_month,
                saleName: sale.saleName
            }));

            await Sales.insertMany(salesToInsert);

            res.json(success('New Sales Added'));
        } else {
            res.json(success('No new values to insert'));
        }
    } catch (error) {
        console.log(error);
        res.send(failure());
    }
    res.end();
};
