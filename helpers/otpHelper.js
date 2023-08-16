const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require("../models/User.js");
const sendOTP_Email_SMS = require('../utils/send-otp.js')
const randomIntGenerator = require('../utils/generate-random-int.js');
const otpVerificationTemplate = require('../utils/otp-verification-template.js')

module.exports.resendOTP = async function (user) {
    const newOTPCode = await resendGeneratedOTP(user);
};


module.exports.generateAndSendOTP = async function (user) {
    const newOTPCode = randomIntGenerator(100000, 999999);
    const hashedResetCode = await bcrypt.hash(newOTPCode.toString(), 10);
    const resetCodeExpiration = moment().add(24, 'h');

    await User.findByIdAndUpdate(user._id, {
        resetCode: hashedResetCode,
        resetCodeExpiration: resetCodeExpiration.format()
    });

    const emailTemplate = otpVerificationTemplate.email_template(user.fullname, newOTPCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'));
    const smsTemplate = otpVerificationTemplate.sms_template(user.fullname, newOTPCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'));
    const phoneNumber = user.countryCode + user.phone;
    sendOTP_Email_SMS(user.email, phoneNumber, user.fullname, emailTemplate, smsTemplate);
}

module.exports.sendLoginAccessCode = async function (user) {
    const newOTPCode = randomIntGenerator(100000, 999999);
    const resetCodeExpiration = moment().add(24, 'h');
    const emailTemplate = otpVerificationTemplate.email_template(user.fullname, newOTPCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'));
    const smsTemplate = otpVerificationTemplate.sms_template(user.fullname, newOTPCode, resetCodeExpiration.format('MMMM Do YYYY, h:mm:ss a'));
    const phoneNumber = user.countryCode + user.phone;
    sendOTP_Email_SMS(user.email, phoneNumber, user.fullname, emailTemplate, smsTemplate);
    return newOTPCode.toString()
}