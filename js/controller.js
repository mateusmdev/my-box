class Controller {
    constructor(view, model, storage) {
        this._view = view
        this._model = model
        this._storage = storage

        this.initEvents()
    }

    initEvents() {
        this._view.bindNewFolder(this.handleNewFolder)
        this._view.bindDarkMode(this.handleDarkMode)
        this._view.bindUploadFile(this.handleUploadFile)
        this._view.bindFileInput(this.handleInputChange)

        this.loadPreferences()
    }

    loadPreferences = () => {
        const storage = localStorage.getItem('my-box')
        //console.log(storage)
        if (storage === 'dark-mode'){
            const body = this._view.getElement('body')
            body.classList.add(storage)
        }

        if (storage !== 'dark-mode' && storage !== ''){
            localStorage.setItem('my-box', '')
        }
    }

    handleInputChange = async () => {
        const inputFile = this._view.getElement('#upload-input')
        const files = inputFile.files

        const storageInstance = this._storage.getStorage()
        const fileRef = this._storage.refStorage(storageInstance, 'files')

        const promises = [...files].map(file => {
            return new Promise((resolve, reject) => {
                let formData = new FormData()
                formData.append('upload-file', file)

                fetch('https://www.google.com/', {
                    method: 'POST',
                    body: formData
                })
                .then(response => resolve)
                .catch(err => reject)
            })
        })

        try {
            const result = await Promise.all(promises)
            console.log(result)
        } catch (error) {
            throw error
        }

        console.log(promises)
    }

    handleNewFolder() {


    }

    handleDarkMode = () => {
        let storage = localStorage.getItem('my-box') || ''
        storage = (storage === 'dark-mode') ? '' : 'dark-mode'
        //if (storage !== 'dark-mode' && storage)
        
        const body = this._view.getElement('body')
        if (!body) return

        localStorage.setItem('my-box', storage)
        
        if (storage === 'dark-mode'){
            body.classList.add('dark-mode')
        }else{
            body.classList.remove('dark-mode')
        }
    }

    handleUploadFile = () => {
        const uploadElement = this._view.getElement('#upload-input')
        uploadElement.click()
    }

}