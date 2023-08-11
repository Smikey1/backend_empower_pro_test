module.exports.email_template = function (fullname, loginCode, expiration) {
  const emailTemplate =
    `
<html>
  <head>
    <style>
      .center {
        display: flex;
        justify-content: center;
      }
      .card {
        border-radius: 16px;
        border: 0.5px solid rgba(0, 0, 0, 0.2);
        padding: 1rem;
        width: 30rem;
      }
      .resetcode {
        font-size: 1.3rem;
        font-weight: 700;
      }
    </style>
  </head>
  <body class="center">
    <div class="center">
      <section class="card">
        <div class="center">
          <img src="https://empowersofttech.com/wp-content/uploads/2018/07/empower-soft-tech.jpg"/>
        </div>
        <h1>Congratulation! Dear, ${fullname}</h1>
        <p>Please verify the one-time password on the EmpowerPro:</p>
        <p>For Verification, use this code:</p>
        <p class="center resetcode">${loginCode}</p>
        <p>Your password expiration: ${expiration}</p>
        <p>
          If this was you, you can ignore this message. There's no need to take any action. This code will expire in 24 Hours.
        </p>
        <p>Thanks,<br />From EmpowerPro Team</p>
      </section>
    </div>
  </body>
</html>
    `
  return emailTemplate
}

module.exports.sms_template = function (fullname, loginCode, expiration) {
  const smsTemplate =
  `
  Hi ${fullname}! Your Verification Code is: ${loginCode}. This code expire on: ${expiration}.
  Thank you.
  EmpowerPro
  `
return smsTemplate
}