const router = require('express').Router();
const jobController = require('../controllers/jobController.js')
const auth = require('../middleware/auth.js')

router.post("/", auth.verifyUser, jobController.add_job)

router.get("/archive", auth.verifyUser, jobController.viewArchive)

router.get("/:id", auth.verifyUser, jobController.get_job)

router.patch("/detail/:id", auth.verifyUser, jobController.update_detail)

router.patch("/direction/:id", auth.verifyUser, jobController.update_direction)

router.patch("/hashtag/:id", auth.verifyUser, jobController.update_hashtag)

router.delete("/discard/:id", auth.verifyUser, jobController.discard_job)

router.post("/ok/:id", auth.verifyUser, jobController.post_job)

router.post("/share/:id", auth.verifyUser, jobController.share_job)

router.patch("/no-image/:id", auth.verifyUser, jobController.update_job_without_image)

router.post("/archive/:id", auth.verifyUser, jobController.archive_job)

router.delete("/:id", auth.verifyUser, jobController.delete_job)

module.exports = router