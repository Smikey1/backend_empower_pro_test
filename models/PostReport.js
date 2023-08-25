const mongoose = require('mongoose');

const postReportSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    reportDate: {
        type: Date,
        default: Date.now,
    },
    reason: {
        type: String,
        // enum: ["harassing", "spam", "nudity", "sexual", "graphic violence", "hate" ,"drug promotion", "abuse"]
    }
})
module.exports = mongoose.model("PostReport", postReportSchema)