
const twilio = require('twilio');
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config()// .config() saves data in process(defult) variable

// for email configuration
const defaultEmailClient = SibApiV3Sdk.ApiClient.instance;
const emailAuthentication = defaultEmailClient.authentications["api-key"];
emailAuthentication.apiKey = process.env.SIB_API;

// for sms configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const sendSMS = twilio(accountSid, authToken);

module.exports = function (recieverUserEmail, recieverUserPhone, recieverName, emailTemplate, smsTemplate) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // sending email code
    sendSmtpEmail = {
        sender: { email: "no-reply@empowerpro.com" },
        to: [
            {
                email: recieverUserEmail,
                name: recieverName,
            },
        ],
        name: "EmpowerPro",
        subject: "Verification Code | EmpowerPro",
        textContent: emailTemplate,
    };
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function () {
            console.log("Mail to: " + recieverUserEmail);
        },
        function (error) {
            console.error('Error sending Mail:', error)
        }
    );

    // sending sms code
    sendSMS.messages.create({
        body: smsTemplate,
        from: twilioPhoneNumber,
        to: recieverUserPhone
    })
        .then(message => console.log("SMS to:" + recieverUserPhone))
        .catch(error => console.error('Error sending OTP:', error));
}