const Comment = require("../models/Comment")
const { success, failure } = require("../utils/message.js")

exports.get_comment_by_post_id = async function (req, res) {
    try {
        // Populate User
        const postComments = await Comment.find({ post: req.params.postId }).populate("user")
        res.json(success("Comments Successful", postComments))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}
module.exports.add_comment = async function (req, res) {
    try {
        const userId = req.user._id
        const postId = req.params.post
        const comment = Comment({
            user: userId,
            post: postId,
            comment: req.body.comment
        })
        comment.save()
        res.json(success("New Comment Added"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}
module.exports.edit_comment = async function(req,res) {
    try{
        await Comment.findOneAndUpdate({
            _id: req.params.commentId
        },
        {
            comment: req.body.comment
        })
        res.json(success("Comment updated"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.delete_comment = async function(req,res) {
    try{
        await Comment.deleteOne({_id: req.params.commentId, user: req.user._id})
        res.json(success("Comment updated"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}