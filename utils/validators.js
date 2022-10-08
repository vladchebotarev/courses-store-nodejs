const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
  body('name')
    .isLength({min: 3})
    .withMessage('Name must be at least tree symbols!')
    .trim(),
  body('email', 'Please input correct email!')
    .isEmail()
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({email: value})
        if (user) {
          return Promise.reject('This user already exist!')
        }
      } catch (e) {
        console.log(e)
      }
    })
    .normalizeEmail(),
  body('password', 'Password must be at least six symbols!')
    .isLength({min: 6, max: 56})
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password conformation is not the same!')
      }
      return true
    })
    .trim()
]

exports.courseValidators = [
  body('title').isLength({min: 3}).withMessage('Name must be at least tree symbols!').trim(),
  body('price').isNumeric().withMessage('Please input correct price!'),
  body('img', 'Please input correct image url!').isURL(),
]