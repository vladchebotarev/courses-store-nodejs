module.exports = function (email, token) {
  return {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Password Reset',
    html: `
      <h1>Are you forgot the password?</h1>
      <p>If no, please igonore this email</p>
      <p>If yes, please click link below:</p>
      <p><a href="${process.env.BASE_URL}/auth/password/${token}">Reset Password</a></p>
      <hr />
      <a href="${process.env.BASE_URL}">Courses Store</a>
    `
  }
}