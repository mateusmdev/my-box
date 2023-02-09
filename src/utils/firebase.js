require('dotenv').config()
const { initializeApp } = require('firebase/app')
const realtimeDatabase = require('firebase/database')

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

            await set(push(ref), obj)
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
            if(result) return "Data Update Success"
            else return "Data Update Failed"
        } catch (error) {
            return error
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
}

module.exports = new Firebase()