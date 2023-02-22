class User{
    constructor(){
        this._currentFolder
        this._folderList = []
        this._keyList = []
    }

    get currentFolder(){
    	return this._currentFolder
    }

    set currentFolder(value){
    	this._currentFolder = value
    }

    get folderList(){
    	return this._folderList
    }

    set folderList(value){
    	this._folderList = value
    }

    get keyList(){
    	return this._keyList
    }

    set keyList(value){
    	this._keyList = value
    }
}