const bcrypt = require('bcrypt')
const { generateToken, decodeToken } = require('../utils/jwtToken')
const firebase = require('../utils/firebase')

module.exports = {
    async create(req, res) {
        try {
            const user = {
                ...req.body,
                password: await bcrypt.hash(req.body.password, 10),
                createdAt: Date.now(),
                usedStorage: 0,
                totalStorage: 262144000,
                files: {}
            }

            await firebase.saveRealtimeDatabase('/users', user)

            return res.status(201).json({
                message: 'New user successfully created',
                status: 201
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: error,
                status: 500
            })
        }
    },

    async authentication(req, res) {
        try {
            const user = await firebase.findOne('users', { email: req.body.email })

            if (!user) {
                res.status(201).redirect('/login')
            }

            const compareResult = await bcrypt.compare(req.body.password, user.password)
            console.log(user)

            if (compareResult) {
                const token = generateToken({
                    email: user.name,
                    name: user.name,
                    id: user.id,
                    usedStorage: (user.usedStorage / (1024 * 1024)).toFixed(3),
                    totalStorage: (user.totalStorage / (1024 * 1024)).toFixed(3)
                })


                req.session.user = token
                res.status(201).redirect('/main')
            } else {
                res.status(201).redirect('/login')
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                error: error,
                status: 500
            })
        }
    },

    async logout(req, res) {
        try {
            req.session.destroy(function (err) {
                if (err) {
                    throw err
                }

                res.status(201).json({
                    logout: true,
                    status: 201
                })
            })

        } catch (error) {
            throw error
        }
    },

    async index(req, res) {
        try {
            res.status(200).render('index')
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    async login(req, res) {
        try {
            res.status(200).render('login')
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    async signup(req, res) {
        try {
            res.status(200).render('signup')
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    async main(req, res) {
        try {
            if (req.session.user) {
                let data = req.session.user
                data = await decodeToken(data)

                if (data !== {}) {
                    res.status(200).render('main', { data })
                } else {
                    res.status(200).redirect('/login',)
                }

            } else
                res.status(200).redirect('/login',)

        } catch (error) {
            console.log(error)
            throw error
        }
    },

    async upload(req, res) {
        try {
            const { id } = req.params
            await firebase.saveRealtimeDatabase(`/users/${id}/files`, req.body)
            const bytes = await firebase.findOne(`users/${id}/usedStorage`)
            await firebase.uploadRealtimeDatabase(`/users/${id}/usedStorage`, bytes + req.body.size)
            res.status(201).json({})
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    async editFile(req, res){
        try {
            const { id, fileId } = req.params
            const file = await firebase.findOne(`users/${id}/files/${fileId}`)
            console.log(file)
            await firebase.uploadRealtimeDatabase(`/users/${id}/files/${fileId}/name`, req.body.name)
            console.log(fileId)
            res.status(201).json({})
        }catch(error){
            console.log(error)
            throw error
        }
        
    }
}