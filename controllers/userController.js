const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const User = require("../models/User.js");
const Post = require("../models/Post.js");
const Job = require("../models/Job.js");
const cloudinary = require("../utils/cloudinary.js")
const Company = require('../models/Company.js');
const { success, failure } = require("../utils/message.js")
const sendOTP_Email_SMS = require('../utils/send-otp.js')
const passwordTemplate = require('../utils/generate-password-reset-template')
const registerEmailTemplate = require('../utils/register-email-verification-template')
const otpVerificationTemplate = require('../utils/otp-verification-template.js')
const randomIntGenerator = require('../utils/generate-random-int.js');
const getUnarchivedJob = require("../utils/getUnarchivedJob.js");
const otpHelper = require("../helpers/otpHelper.js");
const { UserBindingPage } = require('twilio/lib/rest/ipMessaging/v2/service/user/userBinding.js');

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
            const country_code = req.body.countryCode
            const phone = req.body.phone
            const deviceId = req.body.androidId || ""
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            // Set Default User Profile
            const avatarUrl = `https://ui-avatars.com/api/?background=random&name=${fullname}`;
            const user = new User({
                fullname: fullname,
                email: email,
                countryCode: country_code,
                phone: phone,
                profile: avatarUrl,
                password: hashed,
                androidId: deviceId
            })
            await otpHelper.generateAndSendOTP(user)
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
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        const validLogin = await bcrypt.compare(req.body.password, user.password);
        if (validLogin) {
            const _id = user._id
            const accessToken = jwt.sign({ _id }, process.env.TOKEN_KEY);
            if (user.androidId == req.body.androidId) {
                res.json({
                    message: "Login Successful",
                    data: user,
                    accessToken: accessToken,
                    success: true
                })
            } else {
                const loginCode = await otpHelper.sendLoginAccessCode(user)
                res.json({
                    message: "Login Successful",
                    data: user,
                    accessToken: accessToken,
                    accessCode: loginCode,
                    success: true
                })
            }
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
    try {
        let requestedUser = await User.findById(req.user._id).select("fullname profile bio email website address follower phone following recentlyViewed").populate("savedJob appliedJob recentlyViewed")
        const data = requestedUser.toObject()
        data["savedJob"] = getUnarchivedJob(data.savedJob)
        data["appliedJob"] = getUnarchivedJob(data.appliedJob)
        data["post"] = await Post.find({ user: req.user._id, archive: false }).populate("user relatedJob")
        data["job"] = await Job.find({ user: req.user._id, isPosted: true, archive: false })
        data["company"] = await Company.findOne({ user: req.user._id })
        res.send(success("User Fetched", data));
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end();
}

exports.get_user_job = async function (req, res) {
    try {
        const data = await Job.find({ user: req.user._id, isPosted: true, archive: false }).populate("user")
        res.send(success("User Job Fetched", data))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.get_user_post = async function (req, res) {
    try {
        const data = await Post.find({ user: req.user._id, archive: false })
            .populate({ path: 'user', select: 'fullname profile' })
            .populate({ path: 'relatedJob', select: 'title image hashtag' })
            .sort({ createdDate: -1 }).limit(25)
        res.send(success("User Post Fetched", data))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.get_all_user_saved_job = async function (req, res) {
    try {
        const data = await User.findById(req.user._id).select("savedJob").populate("savedJob")
        res.send(success("Fetched User Saved Job", getUnarchivedJob(data.savedJob)))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.get_all_user_applied_job = async function (req, res) {
    try {
        const data = await User.findById(req.user._id).select("appliedJob").populate("appliedJob")
        res.send(success("User Job Fetched", getUnarchivedJob(data.appliedJob)))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.single_saved_job = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId })
        console.log(job)
        const user = await User.findOne({ _id: req.user._id }).select("savedJob")
        if (job) {
            if (user.savedJob.includes(job._id)) {
                user.savedJob.pull(job._id)
                await user.save()
                res.json(success("Job Removed"))
            } else {
                user.savedJob.push(job._id)
                await user.save()
                res.json(success("Job Saved"))
            }
        } else {
            res.json(failure("Job Not Found"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.single_applied_job = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId })
        const user = await User.findOne({ _id: req.user._id }).select("appliedJob")
        console.log("Mero user==>",user.appliedJob)
        if (job) {
            if (user.appliedJob.includes(job._id)) {
                res.json(success("Already Applied"))
            } else {
                user.appliedJob.push(job._id)
                const userAgain = await User.findOne({ _id: req.user._id })
                const emailTemplate = otpVerificationTemplate.applied_job_email_template(
                    userAgain.fullname,
                    job._id,
                    job.title
                );
                const smsTemplate = otpVerificationTemplate.applied_job_sms_template(
                    userAgain.fullname,
                    job._id,
                    job.title
                );
                const phoneNumber = userAgain.countryCode + userAgain.phone
                sendOTP_Email_SMS(userAgain.email, phoneNumber, userAgain.fullname, emailTemplate, smsTemplate);
                await user.save()
                res.json(success("Job Saved"))
            }
        } else {
            res.json(failure("Job Not Found"))
        }
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.update_user_detail = async function (req, res) {
    try {
        await User.updateOne({ _id: req.user._id }, {
            fullname: req.body.fullname,
            bio: req.body.bio,
            website: req.body.website,
            address: req.body.address,
            countryCode: req.body.countryCode,
            phone: req.body.phone,
            gender: req.body.gender
        })
        res.json(success("User Detail Updated"))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.update_user_device = async function (req, res) {
    try {
        await User.updateOne({ _id: req.user._id }, {
            androidId: req.body.androidId,
        })
        res.json(success("User Device Reset Successful"))
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

module.exports.user_reset_code_reset_password = async function (req, res) {
    try {
        const email = req.body.email
        const user = await User.findOne({ email: email })
        if (user) {
            otpHelper.generateAndSendOTP(user)
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

module.exports.reset_code_for_email_phone = async function (req, res) {
    try {
        const newEmailAddress = req.body.email
        const newPhoneNumber = req.body.countryCode + req.body.phone
        // search for user
        const user = await User.findById(req.user._id).select("resetCode resetCodeExpiration password");
        if (!user) {
            return res.json(failure("User not found"));
        }

        const otpVerificationCode = randomIntGenerator(100000, 999999);
        const hashedOtpVerificationCode = await bcrypt.hash(otpVerificationCode.toString(), 10);
        const otpVerificationCodeExpiration = moment().add(24, 'h');

        // add to user details
        await User.findByIdAndUpdate(req.user._id, {
            resetCode: hashedOtpVerificationCode,
            resetCodeExpiration: otpVerificationCodeExpiration.format()
        })
        const userAgain = await User.findById(req.user._id)
        const phoneNumber = userAgain.countryCode + userAgain.phone

        const emailTemplate = otpVerificationTemplate.email_template(
            userAgain.fullname,
            otpVerificationCode,
            otpVerificationCodeExpiration.format('MMMM Do YYYY, h:mm:ss a')
        );
        const smsTemplate = otpVerificationTemplate.sms_template(
            userAgain.fullname,
            otpVerificationCode,
            otpVerificationCodeExpiration.format('MMMM Do YYYY, h:mm:ss a')
        );

        // Check if there are changes in the email or phone both change
        if ((newEmailAddress && newEmailAddress !== userAgain.email) && (newPhoneNumber && newPhoneNumber !== phoneNumber)) {
            sendOTP_Email_SMS(newEmailAddress, newPhoneNumber, userAgain.fullname, emailTemplate, smsTemplate);
        }
        // Check if there are changes in the email or not
        else if (newEmailAddress && newEmailAddress !== userAgain.email) {
            sendOTP_Email_SMS(newEmailAddress, phoneNumber, userAgain.fullname, emailTemplate, smsTemplate);
        }
        // Check if there are changes in the phone number or not
        else if (newPhoneNumber && newPhoneNumber !== phoneNumber) {
            sendOTP_Email_SMS(userAgain.email, newPhoneNumber, userAgain.fullname, emailTemplate, smsTemplate);
        }
        res.json(success())
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.update_user_email_phone = async function (req, res) {
    try {
        const newEmailAddress = req.body.email
        const newPhoneNumber = req.body.countryCode + req.body.phone
        const newResetCode = req.body.resetCode

        console.log("The req.body is:-->" + req.body)

        // search for user
        const user = await User.findById(req.user._id).select("resetCode resetCodeExpiration password")
        if (!user) {
            return res.json(failure("User not found"));
        }
        const userAgain = await User.findById(req.user._id)
        const phoneNumber = userAgain.countryCode + userAgain.phone

        // verify the otp
        if (user.resetCode) {
            console.log(`The if-user is: -->${user}`)
            const isValid = await bcrypt.compare(newResetCode, user.resetCode);
            if (isValid) {
                const now = moment(Date.now()).format()
                const expiration = user.resetCodeExpiration
                const remainingTime = -(moment(now).diff(expiration, 's'))
                console.log(now, expiration, remainingTime)
                if (remainingTime > 0) {
                    if ((newEmailAddress && newEmailAddress !== userAgain.email) && (newPhoneNumber && newPhoneNumber !== phoneNumber)) {
                        await User.updateOne({ _id: req.user._id }, {
                            email: newEmailAddress,
                            countryCode: req.body.countryCode,
                            phone: req.body.phone
                        })
                        res.json(success("Both Email & Phone Number Updated"))
                    }
                    // Check if there are changes in the email or not
                    else if (newEmailAddress && newEmailAddress !== userAgain.email) {
                        await User.updateOne({ _id: req.user._id }, {
                            email: newEmailAddress
                        })
                        res.json(success("User Email Address Updated"))
                    }
                    // Check if there are changes in the phone number or not
                    else if (newPhoneNumber && newPhoneNumber !== phoneNumber) {
                        await User.updateOne({ _id: req.user._id }, {
                            countryCode: req.body.countryCode,
                            phone: req.body.phone
                        })
                        res.json(success("User Phone Number Updated"))
                    }
                } else {
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
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

module.exports.set_new_password = async function (req, res) {
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
            } else {
                res.json(failure("Reset Code does not exist"))
            }
        } else {
            res.json(failure("User not found"))
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

module.exports.resend_otp = async function (req, res) {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.json(failure("Email does not exist"));
        }
        // Generate a new OTP
        otpHelper.generateAndSendOTP(user);
        res.json(success());
    } catch (error) {
        console.log(error);
        res.json(failure());
    }
    res.end();
};

module.exports.resend_login_otp = async function (req, res) {
    try {
        const user = await User.findById(req.user._id);

        // Generate a new login OTP
        const loginCode = await otpHelper.sendLoginAccessCode(user);
        res.json({
            accessCode: loginCode,
            success: true
        })
    } catch (error) {
        console.log(error);
        res.json(failure());
    }
    res.end();
};

exports.view_other_profile = async function (req, res) {
    try {
        const fetchUser = await User.findOne({ _id: req.params.id })
        const data = fetchUser.toObject()
        data["post"] = await Post.find({ user: req.params.id }).populate("user relatedJob")
        data["job"] = await Job.find({ user: req.params.id, isPosted: true })
        const isFollowed = fetchUser.follower.includes(req.user._id)
        data["isFollowed"] = isFollowed
        res.send(success("User Profile Fetched", data))
    } catch (error) {
        console.log(error)
        res.json(failure())
    }
    res.end()
}

exports.follow_user = async function (req, res) {
    try {
        const followerUser = req.user._id
        const followingUser = req.params.id
        const followerUserData = await User.findById(followerUser)
        if (followerUserData.following.includes(followingUser)) {
            await User.findByIdAndUpdate(followerUser, {
                $pull: { following: followingUser }
            })
            await User.findByIdAndUpdate(followingUser, {
                $pull: { follower: followerUser }
            })
            // createNotification(followingUser, followerUser, "unfollowed you.")

            res.json(success("Unfollowing Success"))
        }
        else {
            await User.findByIdAndUpdate(followerUser, {
                $push: { following: followingUser }
            })
            await User.findByIdAndUpdate(followingUser, {
                $push: { follower: followerUser }
            })
            // createNotification(followingUser, followerUser, "started following you.")
            res.json(success("Following Success"))
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