const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config()// .config() saves data in process(defult) variable

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API;

module.exports = function (recieverUser, recieverName, textContent) {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail = {
        sender: { email: "reset@empowerpro.com" },
        to: [
            {
                email: recieverUser,
                name: recieverName,
            },
        ],
        name: "EmpowerPro",
        subject: "Registration Code | EmpowerPro",
        textContent: textContent,
    };
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function () {
            console.log("Mail to: " + recieverUser);
        },
        function (error) {
            console.error("My Error-->", error);
        }
    );
}