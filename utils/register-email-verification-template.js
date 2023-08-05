module.exports = function (email, resetCode, expiration) {
  const textContent =
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
        <h1>Congratulation! Dear ${fullname}</h1>
        <p>Please verify your email</p>
        <p>EmpowerPro recieved a request to verify email: <b>${email}</b></p>
        <p>To verify your email, use this code:</p>
        <p class="center resetcode">${resetCode}</p>
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
  return textContent
}