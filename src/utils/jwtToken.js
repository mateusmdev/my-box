const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = {
    generateToken: (dataObject) => {
        return jwt.sign(dataObject, process.env.SECRET_JWT, {
            expiresIn: (60 * 60)
        })
    },

    decodeToken: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
                if (err) {
                    resolve({})
                }
                resolve(decoded)
            })
        })
    }
}