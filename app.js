//copy all file except line 7..and 19..
const express = require('express')
const morgan = require("morgan")
const file_upload = require("express-fileupload")
const cors = require("cors")

//all route import here
const userRoute = require("./routes/userRoutes.js")

//create backend app from express engine
const app = express()

//use the imported package form line 1
app.use(cors())
app.use(express.json())
app.use(morgan("tiny"))
app.use(file_upload({ useTempFiles: true }))

// inital route
app.get("/", (req, res) => {
    res.send("Welcome to EmpowerPro Backend");
    res.end();
})


// route use here
app.use("/user", userRoute)

module.exports = app