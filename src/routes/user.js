const express = require('express')
const router = express.Router()
const { autorization } = require('../utils/jwtToken')

const controller = require('../controller/user.js')

//router.get('/user', controller.findAll)

router.get('/', controller.index)

router.get('/login', controller.login)

router.post('/logout', controller.logout)

router.get('/signup', controller.signup)

router.get('/main', controller.main)

router.post('/user/authentication', controller.authentication)

router.post('/user/create', controller.create)

router.post('/user/:id', controller.upload)

router.put('/user/:id/files/:fileId', controller.editFile)

module.exports = router