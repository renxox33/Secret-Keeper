const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('./db')
const bcrypt = require('bcrypt')
require('dotenv').config()

 module.exports.initializePassportLocal = (passport) => {

   const authenticate = (username, password, done) => { 
      
      User.findOne({ username: username }, (err, foundUser) => {

         if(err) return done(err)

         if(!foundUser){
            return done(null, false, { message: 'User not found' })
         } else{
            bcrypt.compare(password, foundUser.password, (err, result) => {
               if(err) return done(err)

               if(!result){
                  return done(null, false, { message: 'Invalid password' })
               } else{
                  return done(null, foundUser)
               } 
            })
         }
      })

   }

    passport.use(new LocalStrategy(authenticate))

    passport.serializeUser((user, done) => {
       done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
      User.findById({ _id: id}, (err, user) => {
         if(err){
            return done(err)
         } else{
            if(user){
               return done(null, user)
            }
         }
      })
    })
 }

 module.exports.initializePassportGoogle = (passport) => {

   passport.use(new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/login/google-auth'
   }, (accessToken, refreshToken, profile, cb) => {
      console.log(profile.id);
            

      User.findOne({ googleId: profile.id }, (err, foundUser) => {

         if(err) return cb(err, null)
         else{
            console.log(foundUser);
            
            if(foundUser) return cb(null, foundUser)

            else{
               const newUser = new User({
                  googleId: profile.id,
                  alias: profile.name.givenName
               })
               console.log(newUser);
               
               newUser.save()
               return cb(null, newUser)
            }
         }
            

      })
   }
   
      )
   )
 }