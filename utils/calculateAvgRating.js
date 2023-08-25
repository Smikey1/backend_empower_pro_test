const Review = require('../models/Review.js')
const Job = require('../models/Job.js')

module.exports = async function (jobId) {
    const job = await Job.findById(jobId)
    const jobReviews = await Review.find({ job: jobId })
    let totalRating = 0
    jobReviews.forEach(jobReview => {
        totalRating += jobReview.rating
    });
    job.avgRating = Math.ceil(totalRating / jobReviews.length)
    job.save()
}