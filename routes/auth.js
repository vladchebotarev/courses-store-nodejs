const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const {registerValidators, resetPasswordValidator} = require('../utils/validators')

const router = Router()

const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: process.env.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    isLogin: true,
    error: req.flash('error'),
    success: req.flash('success')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body

    const candidate = await User.findOne({email})

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)
      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('error', 'Wrong email or password!')
        res.redirect('/auth/login')
      }
    } else {
      req.flash('error', 'Wrong email or password!')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/register', async (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    isLogin: true,
    error: req.flash('error')
  })
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {name, email, password} = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/auth/register')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email, name, password: hashPassword, cart: {items: []}
    })
    await user.save()
    req.flash('success', 'Account has been created!')
    res.redirect('/auth/login')
    await transporter.sendMail(regEmail(email))

  } catch (e) {
    console.log(e)
  }
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forgot Password',
    error: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something wrong! Please try again later.')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const candidate = await User.findOne({email: req.body.email})

      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
        await candidate.save()
        await transporter.sendMail(resetEmail(candidate.email, token))
        req.flash('success', 'Email password with reset link was sent!')
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'User not exist!')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Set new password',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/password', resetPasswordValidator, async (req, res) => {
  try {
    const {userId, token, password} = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect(`/auth/password/${token}`)
    }

    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (user) {
      user.password = await bcrypt.hash(password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      req.flash('success', 'New password is set!')
      res.redirect('/auth/login')
    } else {
      req.flash('error', 'Reset token is expired!')
      res.redirect('/auth/login')
    }

  } catch (e) {
    console.log(e)
  }
})

module.exports = router