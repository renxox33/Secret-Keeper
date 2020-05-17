require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

const app = express()
const port = process.env.port || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true})

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

userSchema.plugin(encrypt, { secret: process.env.SECRET, excludeFromEncryption: ['username'] });

const User = mongoose.model('User', userSchema)

app.get('/', (req,res) => {
    res.render('home')
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.get('/register', (req,res) => {
    res.render('register')
})

app.post('/register', (req,res) => {
    
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })
    
    newUser.save((err) => {
        if(err){
            res.status(500).send(err)
        } else{
            console.log(newUser);
            res.render('secrets')
            
        }
    })
    
})

app.post('/login', (req, res) => {

    User.findOne({ username: req.body.username, password: req.body.password }, (err, foundUser) => {
        if(err){
            console.log('Error');
            
            res.status(400).send(err)
        } else{
            if(foundUser){
                res.render('secrets')
            } else{
                console.log('no result found');
                
            }
        }
    })
    
})

app.listen(port, () => console.log('Listening on port ' + port)
)