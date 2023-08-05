// copy with utils folder
const mongoose = require("mongoose")
require("dotenv").config()// .config() saves data in process(defult) variable

//this only works for local database
//DB_URL= mongodb://127.0.0.1:27017/your_database_name
const db_connection_url = process.env.REMOTE_SERVER_DB_URL

//exporting connection function
mongoose.set('strictQuery', true);
module.exports = () => {
    console.log("connecting...")
    return mongoose.connect(db_connection_url)
}