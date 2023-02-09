class DAO{
    constructor({ database, ref, set, child, push, onValue }){
        this._database = database
        this._child = child
        this._push = push
        this._ref = ref
        this._set = set
        this._onValue = onValue
    }

    save(model){
       const primaryKey = this._push(this._child(
           this._ref(this._database),
           'users'
       )).key

       this._set(this._ref(this._database, 'users/' + primaryKey), model);
    }

    read(){
        const users = this._ref(this._database, 'users/')
        this._onValue(users, (snapshot) => {
            const data = snapshot.val()
            console.log(data)
        })
    }
}
