//copy file
const app = require("./app.js")
const db_connection = require("./utils/dbConnection.js")
require("dotenv").config()

//constant variable goes here
const port = process.env.PORT || 8080

db_connection().then(() => {
    //configuring the server
    app.listen(port, () => { // listen: it will listen to the port continously
        console.log(`Listening on port http://localhost:${port}`)
    })
    console.log("EmpowerPro Database connected")
}).catch((error_msg) => console.log(`connection error:${error_msg}`))