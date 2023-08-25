const Job = require("../models/Job.js")
const Review = require("../models/Review.js")
const AvgRating = require("../utils/calculateAvgRating.js")
// const createNotification = require("../utils/createNotification.js")
const { success, failure } = require("../utils/message.js")

exports.get_review_by_job_id = async function (req, res) {
    try {
        // Populate User
        const jobReviews = await Review.find({ job: req.params.jobId }).populate({
            path: 'user',
            select: 'firstname _id profile'
        }).select("-job")
        res.json(success("Reviews Successful", jobReviews))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}

exports.insert_new_review = async function (req, res) {
    try {
        const _id = req.user._id
        const jobId = req.params.jobId
        const review = new Review({
            user: _id,
            job: jobId,
            review: req.body.review,
            rating: req.body.rating
        })
        await review.save()
        await AvgRating(jobId)
        res.json(success("New Review Added"))
        const job = await Job.findById(jobId)
        // createNotification(job.user, review.user, "reviewed on your job.", "job", jobId)
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}

exports.update_review = async function (req, res) {
    try {
        await Review.updateOne({ _id: req.body._id, user: req.user._id }, {
            review: req.body.review,
            rating: req.body.rating
        })
        AvgRating(req.params.jobId)
        res.json(success("Review Updated"))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}

exports.delete_review = async function (req, res) {
    try {
        await Review.deleteOne({ _id: req.params.reviewId, user: req.user._id })
        AvgRating(req.params.jobId)
        res.json(success("Review Deleted"))
    }
    catch (e) {
        console.log(e)
        res.json(failure())
    }
    res.end()
}