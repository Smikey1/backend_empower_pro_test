//copy all file except line 7..and 19..
const express = require('express')
const morgan = require("morgan")
const file_upload = require("express-fileupload")
const cors = require("cors")

//all route import here
const userRoute = require("./routes/userRoute.js")
const saleRoute = require("./routes/saleRoute.js")
const postRoute = require('./routes/postRoute.js')
const searchRoute = require('./routes/searchRoute.js')
const reviewRoutes = require('./routes/reviewRoutes.js')
const jobRoute = require('./routes/jobRoute.js')
const commentRoute = require('./routes/commentRoute.js')
const companyRoute = require('./routes/companyRoute.js')
const postReportRoute = require('./routes/postReportRoute.js')

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
app.use("/sale", saleRoute)
app.use("/post", postRoute);
app.use("/search", searchRoute);
app.use("/job", jobRoute);
app.use("/review", reviewRoutes)
app.use("/company", companyRoute);
app.use("/comment", commentRoute)
app.use("/reportPost", postReportRoute)
module.exports = app