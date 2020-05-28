require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const initializePassport = require('./passportInit')
const User = require('./db')
const bcrypt = require('bcrypt')

const app = express()
const port = process.env.port || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

initializePassport.initializePassportLocal(passport)
initializePassport.initializePassportGoogle(passport)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session());

const checkAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next()
    }

    return res.redirect('/login')
}

const checkNotAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.redirect('/secrets')
    }

    return next()
}

app.get('/', checkNotAuthenticated, (req,res) => {
    res.render('home')
})

app.get('/login',checkNotAuthenticated, (req,res) => {
    res.render('login')
})

app.get('/register',checkNotAuthenticated, (req,res) => {
    res.render('register')
})

app.post('/register', async (req,res) => {

    //check if email already exists

    User.findOne({ username: req.body.email }, (err, foundUser) => {
        if(err){
            console.log(err);
            
        }else{
            if(foundUser){
                console.log('Looks like you are already registered. Go ahead and login !' );
                res.redirect('/login')  
            } else{
                bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                    if(err){
                        console.log(err);
                        
                    } else{
                        const newUser = new User({
                            username: req.body.email,
                            password: hashedPassword,
                            alias: req.body.alias
                        })

                        newUser.save()
                        res.redirect('/secrets')
                    }
                })
            }
        }
    })  
    
})

app.get('/secrets', checkAuthenticated, (req, res) => {
    
    if(req.isAuthenticated()){
        res.render('secrets', { name: req.user.alias })
    } else {
        res.redirect('/login')
    }
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secrets',
    failureRedirect: '/login'
}))

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get('/login/google-auth', passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
    
    res.redirect('/secrets')
} )

app.listen(port, () => console.log('Listening on port ' + port)
)