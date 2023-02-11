const { decodeToken } = require('../utils/jwtToken')

module.exports = {
    async index(req, res) {
        try {
            res.status(200).render('index')
        } catch (error) {
            res.status(200).render('index')
        }
    },

    async login(req, res) {
        try {
            res.status(200).render('login')
        } catch (error) {
            res.status(200).render('login')
        }
    },

    async main(req, res) {
        try {
            if (req.session.user) {
                let data = req.session.user
                data = await decodeToken(data)

                if (data !== {})
                    res.status(201).render('main', { data })

                else
                    res.status(302).redirect('/login')
            }else{
                res.status(302).redirect('/login')
            }
            
        } catch (error) {
            console.log(error)
            throw error
            res.status(302).redirect('/login')
        }
    },

    async signup(req, res) {
        try {
            res.status(201).render('signup')
        } catch (error) {
            res.status(201).render('signup')
        }
    },
}