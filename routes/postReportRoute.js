const auth = require("../middleware/auth.js")
const router = require('express').Router();
const postReportController = require("../controllers/postReportController.js")

router.post("/:id", auth.verifyUser, postReportController.report_post)

module.exports = router;