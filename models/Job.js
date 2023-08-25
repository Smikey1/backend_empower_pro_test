const mongoose = require('mongoose');

const preparationSchema = mongoose.Schema({
    companyDescription: {
        type: String,
    },
    responsibilities: {
        type: String,
    },
    eligibilityCriteria: {
        type: String,
    },
    skills: {
        type: String,
    }
})


const jobSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
    },
    image: {
        type: String,
        default: "",
    },
    description: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    updatedDate: {
        type: Date,
        default: Date.now,
    },
    archive: {
        type: Boolean,
        default: false
    },
    isPosted: {
        type: Boolean,
        default: false
    },
    jobDetailSchema: {
        type: preparationSchema,
        default: { companyDescription: "", responsibilities: "", eligibilityCriteria: "", skills: ""}
    },
    direction: [String],
    hashtag: [String],
    avgRating: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("Job", jobSchema);