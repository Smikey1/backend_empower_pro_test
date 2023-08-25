const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary.js')
const { success, failure } = require("../utils/message.js")

module.exports.get_post = async function (req, res) {
    try {
        const post = await Post.find()
            .populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
            .sort({ createdDate: -1 }).limit(25)
        res.json(success("Fetched All Post", post))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.get_trending = async function (req, res) {
    try {
        const trending = await Post.find()
            .sort({ likes: -1 })
            .populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
            .limit(25)
        res.json(success("Fetched All Post", trending))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.get_all_created_post = async function (req, res) {
    try {
        const data = await Post.find({ user: req.user._id })
            // .sort({ createdDate})
            .populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
        console.log("The data is -->", data)
        res.json(success("Fetched All Post", data))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.get_post_by_id_in_array = async function (req, res) {
    try {
        const post = await Post.find({ _id: req.params.id })
            .populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
        res.json(success("Fetched Post", post))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.add_post = async function (req, res) {
    try {
        const formImage = req.files.image
        const imagePath = formImage.tempFilePath
        if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
            const _id = req.user._id
            const image = await cloudinary.upload_image(imagePath, _id)
            const post = new Post({
                user: _id,
                status: req.body.status,
                image: image
            })
            const savedPost = await post.save()
            res.json(success("New Post Inserted", savedPost))
        }
        else {
            res.json(failure("Must be png, jpg or jpeg"))
        }
    } catch (e) {
        console.log(e)
        res.send(failure())

    }
}

module.exports.add_status = async function (req, res) {
    try {
        const _id = req.user._id
        const post = new Post({
            user: _id,
            status: req.body.status,
        })
        const savedPost = await post.save()
        res.json(success("New Post Inserted", savedPost))
    } catch (e) {
        console.log(e)
        res.send(failure())

    }
}

module.exports.like_post = async function (req, res) {
    try {
        const _id = req.user._id
        const postId = req.params.id
        const post = await Post.findById(postId)
        const updatedLikes = [...post.likes]
        const userIndex = updatedLikes.findIndex(
            user => {
                return user.toString() === _id.toString()
            },
        )
        let message = ""
        if (userIndex === -1) {
            updatedLikes.push(_id)
            message = "Post Liked"
        }
        else {
            updatedLikes.pop(_id)
            message = "Post Unliked"
        }
        post.likes = updatedLikes
        await post.save()
        res.json(success(message))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}


module.exports.edit_post = async function (req, res) {
    try {
        const formImage = req.files.image
        const _id = req.user._id
        if (formImage) {
            const imagePath = formImage.tempFilePath
            if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
                const image = await cloudinary.upload_image(imagePath, _id)
                await Post.updateOne({ _id: req.params.id, user: _id }, {
                    status: req.body.status,
                    image: image
                })
                res.json(success("Post Edited"))
            }
            else {
                res.json(failure("Must be png, jpg or jpeg"))
            }
        }
        else {
            await Post.updateOne({ _id: req.params.id, user: _id }, {
                status: req.body.status,
            })
            res.json(success("Post Edited"))
        }
    } catch (e) {
        console.log(e)
        res.send(failure())

    }
}
module.exports.get_post_by_Id = async function (req, res) {
    try {
        console.log(req.params.id)
        const post = await Post.findOne({ _id: req.params.id }).populate("user")
        res.json(success("Fetched All Post", post))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.edit_post_with_image = async function (req, res) {
    try {
        const formImage = req.files.image
        const imagePath = formImage.tempFilePath
        if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
            const _id = req.user._id
            const image = await cloudinary.upload_image(imagePath, _id)
            await Post.findByIdAndUpdate({
                _id: req.params.id
            }, {
                status: req.body.status,
                image: image
            })
            res.json(success("Post Updated"))
        }
        else {
            res.json(failure("Must be png, jpg or jpeg"))
        }
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}
module.exports.edit_post_without_image = async function (req, res) {
    try {
        await Post.findOneAndUpdate({
            _id: req.params.id
        },
            {
                status: req.body.status
            })
        res.json(success("Post status updated"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.archive_post = async function (req, res) {
    try {
        const user = req.user._id
        const postId = req.params.id
        const post = await Post.findOne({ user: user, _id: postId })
        toArchive = !post.archive
        post.archive = toArchive
        await post.save()
        res.send(success("Post Archived"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}
module.exports.get_post_by_following = async function (req, res) {
    try {
        const user = await User.findById(req.user._id)
        const followingUsers = user.following
        console.log(followingUsers)
        const post = await Post.find({
            user: {
                $in: followingUsers
            }
        }).populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
            .sort({ createdDate: -1 }).limit(25)
        res.json(success("Fetched All Post", post))
    } catch (e) {
        console.log(e)
        res.send(failure())
    }
}

module.exports.viewArchive = async function (req, res) {
    try {
        // const post = await Post.find({ user: req.user._id, archive: true, systemArchive: false }).populate("user")
        const post = await Post.find({ user: req.user._id, archive: true, systemArchive: false }).populate("user relatedJob")
        res.send(success("Get Archived Post", post))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}

module.exports.delete_post = async function (req, res) {
    try {
        await Post.deleteOne({ _id: req.params.id, user: req.user._id })
        res.json(success("Post Deleted"))
    } catch (error) {
        console.log(error)
        res.send(failure())
    }
    res.end()
}