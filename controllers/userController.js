const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const User = require("../models/User.js");
const cloudinary = require("../utils/cloudinary.js")
const { success, failure } = require("../utils/message.js")
const sendEmail = require('../utils/send-email.js')
const passwordTemplate = require('../utils/generate-password-reset-template')
const registerEmailTemplate = require('../utils/register-email-verification-template')
const randomIntGenerator = require('../utils/generate-random-int.js');

exports.register_new_user = async function (req, res) {
    try {
        const checkUser = await User.findOne({ email: req.body.email });
        // Check if user email exists
        if (checkUser) {
            res.json(failure("Email already exist"));
        }
        else {
            const fullname = req.body.fullname
            const password = req.body.newPassword
            const email = req.body.email
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            // Set Default User Profile
            const avatarUrl = `https://ui-avatars.com/api/?background=random&name=${fullname}`;
            const user = new User({
                fullname: fullname,
                email: email,
                profile: avatarUrl,
                password: hashed
            })
            const resetCode = randomIntGenerator(100000, 999999)
            const resetCodeExpiration = moment().add(24, 'h')
            const textContent = registerEmailTemplate(email, resetCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'))
            sendEmail(email, fullname, textContent)
            await user.save();
            res.json(success("Registeration successful."));
        }
    }
    catch (error) {
        console.log(error);
        res.json(failure());
    }
    res.end()
}

exports.login_user = async function (req, res) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        const validLogin = await bcrypt.compare(req.body.password, user.password);
        if (validLogin) {
            const _id = user._id
            const accessToken = jwt.sign({ _id }, process.env.TOKEN_KEY);
            res.json({
                message: "Login Successful",
                data: user,
                accessToken: accessToken,
                success: true
            })
        } else {
            // Incorrect Password
            res.json(failure("Invalid Credential"));
        }
    } else {
        -
            // Incorrect Email
            res.json(failure("Invalid Credential"));
    }
    res.end();
}

exports.get_user_detail = async function (req, res) {
    console.log(req.user._id)
    try {
        let requestedUser = await User.findById(req.user._id)
        res.send(success("User Fetched", requestedUser));
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end();
}

exports.update_user_detail = async function (req, res) {
    try {
        await User.updateOne({ _id: req.user._id }, {
            fullname: req.body.fullname,
            bio: req.body.bio,
            website: req.body.website,
            address: req.body.address,
            phone: req.body.phone,
            gender: req.body.gender,
        })
        res.json(success("User Detail Updated"))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.change_password = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findOne({ _id: req.user._id }).select("+passwordSetDate")
    // Check is Old Password is valid
    const validLogin = await bcrypt.compare(oldPassword, user.password)
    if (validLogin) {
        const salt = await bcrypt.genSalt(10)
        // Create new password
        const hashed = await bcrypt.hash(newPassword, salt)
        user.passwordSetDate = new Date()
        user.password = hashed
        await user.save()
        res.json(success("Password Changed"))
    }
    else {
        res.json(failure())
    }
    res.end()
}

exports.update_profile_picture = async function (req, res) {
    try {
        const formImage = req.files.profile
        const imagePath = formImage.tempFilePath
        if (formImage.mimetype == "image/png" || formImage.mimetype == "image/jpg" || formImage.mimetype == "image/jpeg") {
            const _id = req.user._id
            const profile = await cloudinary.upload_image(imagePath, _id)
            await User.updateOne({ _id }, { profile })
            res.json(success("Profile Picture Changed"))
        }
        else {
            res.json(failure("Must be png, jpg or jpeg"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}


module.exports.reset_password = async function (req, res) {
    try {
        const email = req.body.email
        const user = await User.findOne({ email: email })
        if (user) {
            const resetCode = randomIntGenerator(100000, 999999)
            const hashedResetCode = await bcrypt.hash(resetCode.toString(), 10);
            const resetCodeExpiration = moment().add(24, 'h')
            await User.findByIdAndUpdate(user._id, {
                resetCode: hashedResetCode,
                resetCodeExpiration: resetCodeExpiration.format()
            })
            const textContent = passwordTemplate(user.email, resetCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'))
            sendEmail(user.email, user.fullname, textContent)
            res.json(success())
        }
        else {
            res.json(failure("Email doesnot exist"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.new_password = async function (req, res) {
    try {
        const email = req.body.email
        const resetCode = req.body.resetCode
        const password = req.body.newPassword
        const user = await User.findOne({ email: email }).select("resetCode resetCodeExpiration password")
        if (user) {
            if (user.resetCode) {
                const isValid = await bcrypt.compare(resetCode, user.resetCode);
                if (isValid) {
                    const now = moment(Date.now()).format()
                    const expiration = user.resetCodeExpiration
                    const remainingTime = -(moment(now).diff(expiration, 's'))
                    console.log(now, expiration, remainingTime)
                    if (remainingTime > 0) {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(password, salt);
                        user.password = hashed
                        res.json(success("Password Reset"))
                    }
                    else {
                        res.json(failure("Reset Code Expired"))
                    }
                    user.resetCode = null
                    user.resetCodeExpiration = null
                    user.save()
                }
                else {
                    res.json(failure("Invalid reset code"))
                }
            }
            else {
                res.json(failure("Reset Code does not exist"))
            }
        }
        else {
            res.json(failure("Reset Code does not exist"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.validate_email = async function (req, res) {
    try {
        const email = req.body.email
        const user = await User.findOne({ email: email })
        if (user) {
            res.json(success())
        }
        else {
            res.json(failure("Email does not exist"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.get_user_followers = async function (req, res) {
    try {
        const user = await User.findOne({ _id: req.user._id }).populate("follower")
        res.send(success("Followers Fetched", user.follower))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.get_user_following = async function (req, res) {
    try {
        const user = await User.findOne({ _id: req.user._id }).populate("following")
        res.send(success("Following Fetched", user.following))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}