const router = require("express").Router()
const auth = require("../middleware/auth.js")
const reviewController = require("../controllers/reviewController.js")

router.get("/:jobId", reviewController.get_review_by_job_id)

// [User Verification Required] 

router.post("/:jobId", auth.verifyUser, reviewController.insert_new_review)

router.patch("/:jobId", auth.verifyUser, reviewController.update_review)

router.delete("/:jobId/:reviewId", auth.verifyUser, reviewController.delete_review)

module.exports = router