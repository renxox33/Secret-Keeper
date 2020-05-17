require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const saltRounds = 10

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

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {

        const newUser = new User({
            username: req.body.username,
            password: hash
        })
        
        newUser.save((err) => {
            if(err){
                res.status(500).send(err)
            } else{  
                res.render('secrets')  
            }
        })
    } )
    
    
    
})

app.post('/login', (req, res) => {

        const password = req.body.password

        User.findOne({ username: req.body.username }, (err, foundUser) => {
            if(err){
                console.log('Error');
                
                res.status(400).send(err)
            } else{
                if(foundUser){
                    bcrypt.compare(password, foundUser.password, (err, result) => {
                        if(result === true){
                            res.render('secrets')
                        } else{
                            console.log('Username/password combination does not exist');
                        }
                    })
                } else{
                    console.log('Username/password combination does not exist');
                    
                }
            }
        })
})    

app.listen(port, () => console.log('Listening on port ' + port)
)