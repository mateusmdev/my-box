const express = require('express')
const router = express.Router()
const { autorization } = require('../utils/jwtToken')

const controller = require('../controller/pages.js')

router.get('/', controller.index)

router.get('/login', controller.login)

router.get('/main', controller.main)

router.get('/signup', controller.signup)

module.exports = router