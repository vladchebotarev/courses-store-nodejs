module.exports = function (email) {
  return {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Account was created',
    html: `
      <h1>Welcome to our store!</h1>
      <p>Account was created successfully with email - ${email}</p>
      <hr />
      <a href="${process.env.BASE_URL}">Courses Store</a>
    `
  }
}