const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
    // User ID
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Job ID
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Rating Range 1-5
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String
    }
})

module.exports = mongoose.model("Review", reviewSchema)