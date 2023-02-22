const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/jwtToken')
const firebase = require('../utils/firebase')

module.exports = {
    async authentication(req, res) {
        try {
            const user = await firebase.findOne('users', { email: req.body.email })

            if (!user) {
                res.status(201).redirect('/login')
            }

            const compareResult = await bcrypt.compare(req.body.password, user.password)

            if (compareResult) {
                const token = generateToken({
                    email: user.name,
                    name: user.name,
                    id: user.id,
                    usedStorage: (user.usedStorage / (1024 * 1024)).toFixed(3),
                    totalStorage: (user.totalStorage / (1024 * 1024)).toFixed(3)
                })


                req.session.user = token
                res.status(302).redirect('/main')
            }else{
                res.status(302).redirect('/login')
            }  

        } catch (error) {
            throw error
            res.status(302).redirect('/login')
        }
    },

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

            res.status(302).redirect('/login')

        } catch (error) {
            res.status(302).redirect('/signup')
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
            res.status(500).json({
                status:500,
                message: 'Server error.'
            })
        }
    },


    async upload(req, res) {
        try {
            const { id } = req.params
            await firebase.saveRealtimeDatabase(`/users/${id}/files`, req.body)
            const bytes = await firebase.findOne(`users/${id}/usedStorage`)
            await firebase.uploadRealtimeDatabase(`/users/${id}/usedStorage`, bytes + req.body.size)

            res.status(201).json({
                status:201,
                upload: true
            })
        } catch (error) {
            res.status(500).json({
                status:500,
                upload: false
            })
        }
    },

    async editFile(req, res){
        try {
            const { id, fileId } = req.params
            const file = await firebase.findOne(`users/${id}/files/${fileId}`)
            const result = await firebase.uploadRealtimeDatabase(`/users/${id}/files/${fileId}/name`, req.body.name)

            res.status(201).json({
                status: 201,
                editedFile: true
            })
        }catch(error){
            res.status(500).json({
                status: 500,
                editedFile: false,
            })
        }
        
    },

    async deleteFile(req, res){
        try {
            const { id } = req.params
            const { key, type } = req.body 

            const query = await firebase.findOne(`users/${id}/files`)
            const files = Object.values(query)
            const filesKeys = Object.keys(query)

            console.log(files)

            if (type === 'folder') {
                const tasks = files.map((file, index) => {
                    return new Promise(async function (resolve, reject){
                        let folderParent = file.folderParent.split('/')

                        const result = folderParent.find(parent => {
                            return parent === key
                        })

                        if (result){
                            const filename = file.date + file.name
                            console.log(filename)
                            await firebase.deleteStorageFile(filename)
                            await firebase.deleteOne(`users/${id}/files/${filesKeys[index]}`)
                        }

                        resolve()
                    })
                })

                await Promise.all(tasks)

            }else {
                const { date, name} = req.body

                const filename = '/' + date + name
                await firebase.deleteStorageFile(filename)
            }

            await firebase.deleteOne(`users/${id}/files/${key}`)

            res.status(201).json({
                status: 201,
                deletedFile: true
            })

        }catch(error){
            console.error(error)
            res.status(500).json({
                status: 500,
                deletedFile: false,
            })
        }
    }

}