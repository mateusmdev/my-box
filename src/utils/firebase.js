require('dotenv').config()
const { initializeApp } = require('firebase/app')
const realtimeDatabase = require('firebase/database')
const storage = require('firebase/storage')

class Firebase {
    constructor() {
        this.app = initializeApp(this._config())
    }

    _config() {
        return {
            apiKey: process.env.API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            databaseURL: process.env.DATABASE_URL,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.MESSAGING_SENDER_ID,
            appId: process.env.APP_ID,
            measurementId: process.env.MEASUREMENT_ID
        }
    }

    async saveRealtimeDatabase(path, obj) {
        try {
            const { set, push } = realtimeDatabase

            const database = realtimeDatabase.getDatabase(this.app)
            const ref = realtimeDatabase.ref(database, path)

            let result = await set(push(ref), obj)

            return result || 'Data saved success'
        } catch (error) {
            throw error
        }
    }

    async uploadRealtimeDatabase(path, obj) {
        try {
            const { update } = realtimeDatabase
            const database = realtimeDatabase.getDatabase(this.app)
            const ref = realtimeDatabase.ref(database)

            if(!path || !obj){
                throw new Error("Missing parameters, please check path and obj parameters")
            }

            const updates = {}
            updates[path] = obj

            const result = await update(ref, updates)

            return result || "Data Update Success"

        } catch (error) {
            throw error
        }
    }

    async findOne(path, where = {}) {
        try {
            const { get, child } = realtimeDatabase
    
            const database = realtimeDatabase.getDatabase(this.app)
            const ref = realtimeDatabase.ref(database, path)
    
            const query = function () {
                return new Promise(async (resolve, reject) => {
                    const snapshot = await get(child(ref, '/'))
                    if (snapshot.exists()) {
                        resolve(snapshot.val())
                    } else {
                        resolve({});
                    }
                })
            }
    
            let result = await query()
    
            if (Object.keys(where).length === 0) {
                return result;
            }
    
            const keys = Object.keys(result)
            result = Object.values(result)
    
            const [user] = result.filter((user, index) => {
                if (user.email === where.email) {
                    user.id = keys[index]
                    return true
                }
            })
    
            return user
    
        } catch (error) {
            throw error
        }
    }

    async deleteOne(path){
        try {
            const { remove } = realtimeDatabase
            const database = realtimeDatabase.getDatabase(this.app)
            const ref = realtimeDatabase.ref(database, path)

            await remove(ref)

            return true
        } catch (error) {
            throw error
        }
    }

    async deleteStorageFile(filename){
        try {
            console.log(filename)
            const ref = storage.ref(storage.getStorage(), filename)
            const result = await storage.deleteObject(ref)
            console.log('Arquivo deletado')
            
        }catch(error){
            throw error
        }
    }
}

module.exports = new Firebase()