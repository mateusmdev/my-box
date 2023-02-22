const express = require('express')
const router = express.Router()
const { autorization } = require('../utils/jwtToken')

const controller = require('../controller/user.js')

router.post('/logout', controller.logout)

router.post('/user/authentication', controller.authentication)

router.post('/user/create', controller.create)

router.post('/user/:id', controller.upload)

router.put('/user/:id/files/:fileId', controller.editFile)

router.delete('/user/:id/files', controller.deleteFile)

module.exports = router