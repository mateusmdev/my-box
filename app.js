const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const session = require('express-session')
require('dotenv').config()

const userRouter = require('./src/routes/user.js')
//const clientRouter = require('./routes/client.js')

app.use(session({
    secret: process.env.SESSION || 'keyboard',
    resave: true,
    saveUninitialized: true
}))

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.engine('ejs', require('ejs').renderFile)
app.set('view engine', 'ejs')
app.use('/public', express.static(path.join(__dirname, '/src/public')))
app.set('views', path.join(__dirname, '/src/view'))

app.use('/', userRouter)
//app.use('/', clientRouter)

module.exports = app