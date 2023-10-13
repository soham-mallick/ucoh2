if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const path = require("path")
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fs = require('fs')



app.use (express.static(__dirname+"/public"))
// const publicPath = path.join(__dirname, "public");
// const image=path.join(__dirname,"public/picture")
// app.get('/image', checkAuthenticated,express.static(publicPath));


const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



app.get('/html', checkNotAuthenticated, (req, res) => {
  res.writeHead(200, { "Content-type": "text/html" });
  const html = fs.createReadStream(__dirname + '/index.html', 'utf-8');
  html.pipe(res)

})

app.get('/', checkAuthenticated, (req, res) => {


  //  const soham= app.use (express.static(__dirname+"/public"), { name: req.user.name })
  // res.sendFile(`${publicPath}/INDEX.html`)
  // res.sendFile(`${image}/home.png`)
  //  res.sendFile(path.join(__dirname+"/INDEX.html"));
  //  console.log(soham)
  
     
   res.render(
  "index1.ejs",
    { name: req.user.name }
   )

  // res.render(path.join(pathLocation,'./index.html'), { name: req.user.name }))
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,

    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete("/logout", (req, res) => {
  // req.logOut(req.user, err => {
  //   if (err) return next(err)
  //   res.redirect("/login")
  // })
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
})
})
// app.delete('/logout', (req, res) => {
//   req.logOut()
//   res.redirect('/login')
// })

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(80, console.log(users))