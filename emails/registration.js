const keys = require('../keys')

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Account was created',
    html: `
      <h1>Welcome to our store!</h1>
      <p>Account was created successfully with email - ${email}</p>
      <hr />
      <a href="${keys.BASE_URL}">Courses Store</a>
    `
  }
}