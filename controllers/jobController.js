const Job = require("../models/Job")
const Review = require("../models/Review")
const Post = require("../models/Post")
const User = require("../models/User")
const { success, failure } = require("../utils/message.js")
const cloudinary = require('../utils/cloudinary.js')

module.exports.get_job = async function (req, res) {
    try {
        const requestedUserId = req.user._id
        const user = await User.findById(requestedUserId).populate("recentlyViewed")
        const jobId = req.params.id
        let job = await Job.findById(jobId)
        if (job) {
            if (job.user.toString() != req.user._id.toString()) {
                const recentlyViewed = user.recentlyViewed;
                const jobIndex = recentlyViewed.findIndex(
                    job => {
                        return job.toString() === jobId
                    },
                )
                if (jobIndex === -1) {
                    recentlyViewed.unshift(jobId)
                }
                else {
                    recentlyViewed.pop(jobId)
                    recentlyViewed.unshift(jobId)
                }
                console.log(recentlyViewed)
                user.recentlyViewed = recentlyViewed
                user.save()
            }
            const data = job.toObject()
            data["review"] = await Review.find({ job: jobId }).populate("user")
            res.json(success("Job Found", data))
        }
        else {
            res.json(failure("Job not found"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.add_job = async function (req, res) {
    try {
        const userId = req.user._id
        const prevJobId = req.body.prevJobId
        if (prevJobId != "") {
            if (req.files !== undefined) {
                const formImage = req.files.image
                const imagePath = formImage.tempFilePath
                if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
                    const image = await cloudinary.upload_image(imagePath, userId)
                    await Job.updateOne({ _id: prevJobId }, {
                        description: req.body.description,
                        title: req.body.title,
                        image: image
                    })
                    const job = await Job.findById(prevJobId)
                    res.json(success("Previous Job Updated with Image Inserted", job))
                }
                else {
                    res.json(failure("Must be png, jpg or jpeg"))
                }
            }
        } else {
            if (req.files !== undefined) {
                const formImage = req.files.image
                const imagePath = formImage.tempFilePath
                if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
                    const image = await cloudinary.upload_image(imagePath, userId)
                    const job = new Job({
                        user: userId,
                        description: req.body.description,
                        title: req.body.title,
                        image: image
                    })
                    const savedJob = await job.save()
                    res.json(success("New Job with Image Inserted", savedJob))
                }
                else {
                    res.json(failure("Must be png, jpg or jpeg"))
                }
            } else {
                const job = new Job({
                    user: userId,
                    description: req.body.description,
                    title: req.body.title,
                })
                const savedJob = await job.save()
                res.json(success("New Job Inserted", savedJob))
            }
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.update_job_without_image = async function (req, res) {
    try {
        const id = req.params.id;
        await Job.updateOne({ _id: id }, {
            description: req.body.description,
            title: req.body.title,
        })
        const job = await Job.findById(id)
        res.json(success("Job Edited with no Image", job))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.update_detail = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        const jobDetailBody = req.body.jobDetailSchema
        if (job.user.toString() == user.toString()) {
            const jobDetail = {
                companyDescription: jobDetailBody.companyDescription,
                responsibilities: jobDetailBody.responsibilities,
                eligibilityCriteria: jobDetailBody.eligibilityCriteria,
                skills: jobDetailBody.skills
            }
            job.jobDetailSchema = jobDetail
            await job.save()
            res.send(success("Updated Job Detail"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.update_direction = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        if (job.user.toString() == user.toString()) {
            job.direction = req.body.direction
            await job.save()
            res.send(success("Updated Job direction"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.discard_job = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        if (job.user.toString() == user.toString()) {
            await Job.findByIdAndDelete(jobId)
            res.send(success("Discarded Job"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}
module.exports.delete_job = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        if (job.user.toString() == user.toString()) {
            await Post.deleteMany({ relatedJob: jobId })
            await Job.findByIdAndDelete(jobId)
            res.send(success("Deleted Job Successfully"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.post_job = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        if (job.user.toString() == user.toString()) {
            const post = new Post({
                user: user,
                postType: "job",
                relatedJob: jobId
            })
            job.isPosted = true
            job.save()
            post.save()
            res.send(success("Posted Job"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.share_job = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const post = new Post({
            user: user,
            postType: "share",
            relatedJob: jobId
        })
        await post.save()
        res.send(success("Shared Job"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.archive_job = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findOne({ user: user, _id: jobId })
        const toArchive = !job.archive
        const result = await Post.updateMany({ relatedJob: jobId }, {
            systemArchive: toArchive
        })
        console.log(result)
        job.archive = !job.archive
        await job.save()
        res.send(success("Job Archived"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.viewArchive = async function (req, res) {
    try {
        const job = await Job.find({ user: req.user._id, archive: true })
        res.json(success("Get Archived Job", job))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.update_hashtag = async function (req, res) {
    try {
        const user = req.user._id
        const jobId = req.params.id
        const job = await Job.findById(jobId)
        if (job.user.toString() == user.toString()) {
            job.hashtag = req.body.hashtag
            await job.save()
            res.send(success("Updated hashtag"))
        }
        else {
            res.send(failure("User Not Authorized"))
        }
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}