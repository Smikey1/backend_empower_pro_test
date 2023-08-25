const router = require('express').Router();
const commentController = require('../controllers/commentController.js')
const auth = require('../middleware/auth.js')

router.get("/:postId", commentController.get_comment_by_post_id)

router.post("/:post", auth.verifyUser, commentController.add_comment)

router.patch("/:commentId", auth.verifyUser, commentController.edit_comment)

router.delete("/:commentId", auth.verifyUser, commentController.delete_comment)

module.exports=router