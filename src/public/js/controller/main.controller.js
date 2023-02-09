class Controller {
    constructor(view, model, storage, database) {
        this._view = view
        this._model = model
        this._storage = storage
        this._database = database


        this.initEvents()
    }

    initEvents() {
        this.loadPreferences()
        this.loadFiles()

        this._view.bindNewFolderButton(this.handleFolderModal)
        this._view.bindDarkMode(this.handleDarkMode)
        this._view.bindUploadFile(this.handleUploadFile)
        this._view.bindFileInput(this.handleInputChange)
        this._view.bindLogout(this.handleLogout)
        this._view.bindCreateFolder(this.handleCreateFolder)
        this._view.bindClearSelect(this.handleClearSelect)
        this._view.bindChangeFiles(this.handleChangeFiles)
        this._view.bindEditFiles(this.handleEditModal)
    }

    loadPreferences = () => {
        const storage = localStorage.getItem('my-box') || ''

        if (storage === 'dark-mode') {
            const body = this._view.getElement('body')
            body.classList.add(storage)
        }

        if (storage !== 'dark-mode' && storage !== '') {
            localStorage.setItem('my-box', '')
            body.classList.remove('dark-mode')
        }
    }

    loadFiles = async () => {
        const id = this._view.getElement('#uniqueID').dataset.id
        const filesBox = this._view.getElement('section.content')
        filesBox.innerHTML = ''

        try {
            const { instance } = this._database
            const filesReference = this._database.ref(instance, `users/${id}/files`)
            const usedStorageReference = this._database.ref(instance, `users/${id}/usedStorage`)

            this._database.onValue(filesReference, snapshot => {
                const data = snapshot.val()

                if (data) {
                    const files = Object.values(data)
                    const keys = Object.keys(data)
                    //filesBox.innerHTML = ''

                    files.forEach((file, index) => {
                        console.log(files)
                        console.log(keys)
                        const newFile = this._view.createFile({ ...file, key: keys[index] })
                        filesBox.appendChild(newFile)
                    })

                    this._view.bindSelectFiles(this.handleSelectFiles)
                }
            })

            this._database.onValue(usedStorageReference, snapshot => {
                const data = snapshot.val()

                if (data) {
                    const storage = this._view.getElement('.storage span')
                    const progress = this._view.getElement('.progress')

                    let totalStorage = storage.innerHTML.split('/')[1]
                    const usedStorage = (data / (1024 * 1024)).toFixed(3)

                    storage.innerHTML = `${usedStorage}/${totalStorage}`

                    progress.style.width = `${(usedStorage / totalStorage) * 100}%`

                }
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    handleClearSelect = (event) => {
        const selectedFiles = this._view.getAllElements('.item.selected')
        if (!selectedFiles || selectedFiles.length < 1) return
        if (event.currentTarget !== event.target) return

        [...selectedFiles].forEach((element) => {
            console.log(element)
            element.classList.remove('selected')
        })

        const files = this._view.contentArea
        files.dispatchEvent(new Event('changeFiles'))
    }

    handleInputChange = async () => {
        const inputFile = this._view.getElement('#upload-input')
        const files = inputFile.files

        const storageInstance = this._storage.getStorage()

        const promises = [...files].map(file => {
            return new Promise((resolve, reject) => {
                const fileRef = this._storage.refStorage(storageInstance, 'aaa/' + file.name)
                const uploadTask = this._storage.uploadBytesResumable(fileRef, file)

                const upload = snapshot => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    //console.log(snapshot.totalBytes)
                    this._view.renderUploadProgress({ name: file.name, progress })
                }

                const completeUpload = async () => {
                    try {

                        const url = await this._storage.getDownloadURL(uploadTask.snapshot.ref)

                        const body = {
                            name: file.name,
                            size: file.size,
                            type: file.type || file.name.split('.')[1],
                            date: Date.now(),
                            downloadURL: url
                        }

                        const id = this._view.getElement('#uniqueID').dataset.id

                        const response = await fetch(`/user/${id}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        })
                        const json = await response.json()

                        /*if (json.token && json.token !== '') {
                            localStorage.setItem('mybox-token', json.token)
                            localStorage.setItem('mybox-id', json.id)
                            //window.location.assign('main.html')
                        }*/
                    } catch (error) {
                        throw error
                    }
                }

                uploadTask.on('state_changed', upload, null, completeUpload)
                resolve()
            })
        })

        try {
            const result = await Promise.all(promises)
        } catch (error) {
            throw error
        }

    }

    handleChangeFiles = () => {
        const selectedFiles = [...this._view.files].filter(file => {
            const hasClass = file.classList.contains('selected')
            if (hasClass) return true
        })

        const editBtn = this._view.getElement('#edit-item')
        const deleteBtn = this._view.getElement('#delete-item')

       switch(selectedFiles.length){
            case 0:
                editBtn.classList.add('disabled')
                deleteBtn.classList.add('disabled')
                break
            case 1:
                editBtn.classList.remove('disabled')
                deleteBtn.classList.remove('disabled')
                break
            default:
                editBtn.classList.add('disabled')
                deleteBtn.classList.remove('disabled')
                
       }
    }

    handleCreateFolder = async () => {
        const element = this._view.getElement('#new-folder-input')
        const modal = this._view.getElement('.new-folder-wraper')

        //console.log(element)

        const body = {
            name: this._view.getElement('#new-folder-input').value,
            type: 'folder'
        }

        const id = this._view.getElement('#uniqueID').dataset.id

        if (!modal.classList.contains('edit')){
            try {
                const response = await fetch(`/user/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                })

                const json = await response.json()
            } catch (error) {
                throw error
            }
        }else{
            const folderSelected = this._view.getElement('.item.selected')
            const folderId = folderSelected.dataset.file
            console.log(folderId)

            
            try {
                const response = await fetch(`/user/${id}/files/${folderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this._view.getElement('#new-folder-input').value
                    })
                })

                const json = await response.json()
            } catch (error) {
                throw error
            }
        }

        
    }

    handleEditModal = () => {
        const modal = this._view.getElement('.new-folder-wraper')
        const elementDescription = this._view.getElement('.new-folder-box span')

        modal.classList.add('edit')
        elementDescription.innerHTML = 'Novo Nome: '
        modal.style.display = 'block';
    }

    handleFolderModal = () => {

        modal.classList.remove('edit')
        const modal = this._view.getElement('.new-folder-wraper')
        const elementDescription = this._view.getElement('.new-folder-box span')

        elementDescription.innerHTML = 'Nova Pasta: '
        modal.style.display = 'block';
    }

    handleLogout = async () => {
        try {

            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const json = await response.json()
            if (json.logout) {
                alert(json.logout)
                window.location.assign('/login')
            }
        } catch (error) {
            throw error
        }
    }

    handleSelectFiles = (element, event) => {
        if (!element || !event) throw new Error('Parameter "element" and "event" cannot be null.')

        const action = {
            default: () => {
                const selectedFiles = this._view.getAllElements('.item.selected');
                [...selectedFiles].forEach(file => file.classList.remove('selected'))
                element.classList.add('selected')
            },
            ctrlKey: () => {
                element.classList.toggle('selected')
            },
            shiftKey: () => {
                const firstElement = this._view.getElement('.item.selected')

                if (firstElement) {
                    const secondElement = element
                    const parent = secondElement.parentElement.parentElement
                    const allElements = parent.childNodes
                    const indexElements = [];

                    [...allElements].forEach((element, index) => {
                        const [realElement] = element.childNodes
                        realElement.classList.remove('selected')

                        if (realElement === firstElement) indexElements.push(index)
                        else if (realElement === secondElement) indexElements.push(index)
                    })

                    const [start, end] = indexElements.sort()

                    for (let i = start; i <= end; i++) {
                        const element = allElements[i]
                        const [realElement] = element.childNodes

                        realElement.classList.add('selected')
                    }

                    return
                }

                element.classList.add('selected')
            }
        }

        const keys = ['ctrlKey', 'shiftKey']
        const keyPressed = keys.find(keyPressed => event[keyPressed]) || 'default'
        let method = action[keyPressed]

        method()
        const files = this._view.contentArea
        files.dispatchEvent(new Event('changeFiles'))
	
    }

    handleDarkMode = () => {
        let storage = localStorage.getItem('my-box') || ''
        storage = (storage === 'dark-mode') ? '' : 'dark-mode'
        //if (storage !== 'dark-mode' && storage)

        const body = this._view.getElement('body')
        if (!body) return

        localStorage.setItem('my-box', storage)

        if (storage === 'dark-mode') {
            body.classList.add('dark-mode')
        } else {
            body.classList.remove('dark-mode')
        }
    }

    handleUploadFile = () => {
        const uploadElement = this._view.getElement('#upload-input')
        uploadElement.click()
    }

}