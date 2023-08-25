const auth = require("../middleware/auth.js")
const router = require('express').Router();
const postController = require("../controllers/postController.js")

router.get("/", postController.get_post)

router.get("/single/:id", postController.get_post_by_Id)

router.get("/array/:id", postController.get_post_by_id_in_array)

router.get("/trending",postController.get_trending)

router.get("/all-created", auth.verifyUser,postController.get_all_created_post)

router.post("/", auth.verifyUser, postController.add_post)

router.post("/status", auth.verifyUser, postController.add_status)

router.patch("/edit/:id", auth.verifyUser, postController.edit_post)

router.patch("/like/:id", auth.verifyUser, postController.like_post)

router.patch("/status/:id", auth.verifyUser, postController.edit_post_without_image)

router.patch("/:id", auth.verifyUser, postController.edit_post_with_image)

router.post("/archivePost/:id", auth.verifyUser, postController.archive_post)

router.get("/archive",auth.verifyUser,postController.viewArchive)

router.get("/getFollowingPost", auth.verifyUser, postController.get_post_by_following)

router.delete("/deletePost/:id", auth.verifyUser, postController.delete_post)

module.exports = router;