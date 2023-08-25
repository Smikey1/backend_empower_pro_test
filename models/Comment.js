const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    // User ID
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Post ID
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    comment: {
        type: String
    }
})

module.exports = mongoose.model("Comment", commentSchema)