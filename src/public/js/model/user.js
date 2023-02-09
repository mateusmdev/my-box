

class User{
    constructor(){
        this._email = 'jogh@mail.com'
        this._name = 'dfdsfsd'
        this._files = []
        this._folderPath = []
        this._createdAt = Date.now()
    }

    get email(){
        return this._email
    }

    set email(value){
        this._email = value
    }

    get files(){
        return [].concat(this._files)
    }

    set files(value){
        this._files = value
    }

    get folderPath(){
        return [].concat(this._folderPath)
    }

    set folderPath(value){
        this._folderPath = value
    }

    get createdAt(){
        return this._createdAt
    }
}