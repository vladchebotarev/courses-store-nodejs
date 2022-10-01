const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const homeRoutes = require('./routes/home')
const cartRoutes = require('./routes/cart')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')

const User = require('./models/user')

const app = express()

const hbs = expressHandlebars.create({
  defaultLayout: 'main',
  extname: 'hbs',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async (req, res, next) => {
  try {
    const user = await User.findById('63383aa6d0e338b24a4be368')
    req.user = user
    next()
  } catch (e) {
    console.log(e)
  }
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)

const PORT = process.env.PORT || 3000

async function start() {
  try {
    const url = 'mongodb+srv://admin:2Jw4Jw3kcYZGKUCP@mongodb-cluster.foasff6.mongodb.net/shop'
    await mongoose.connect(url, {useNewUrlParser: true})

    const candidate = await User.findOne()
    if (!candidate) {
      const user = new User({
        email: 'vlad.bmx4@gmail.com',
        name: 'Vlad',
        cart: {item: []}
      })
      await user.save()
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    })
  } catch (e) {
    console.log(e)
  }

}

start()

