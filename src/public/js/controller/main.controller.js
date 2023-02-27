class Controller {
    constructor(view, model, storage, database) {
        this._view = view
        this._model = model
        this._storage = storage
        this._database = database

        this.initEvents()
    }

    async initEvents() {
        this.loadPreferences()
        this.loadFiles()

        this._view.bindChangeFiles(this.handleChangeFiles)
        this._view.bindClearSelect(this.handleClearSelect)
        this._view.bindDarkMode(this.handleDarkMode)
        this._view.bindEditFiles(this.handleEditModal)
        this._view.bindFileInput(this.handleInputChange)
        this._view.bindLogout(this.handleLogout)
        this._view.bindNewFolderButton(this.handleFolderModal)
        this._view.bindSubmitFolder(this.handleSubmitFolder)
        this._view.bindUploadFile(this.handleUploadFile)
        this._view.bindDeleteFiles(this.handleDeleteFiles)
        this._view.bindCancelModal(this.handleCancelModal)
    }

    loadPreferences = () => {
        const storage = localStorage.getItem('my-box') || ''
        const body = this._view.getElement('body')

        if (storage === 'dark-mode') {
            body.classList.add(storage)
        }

        if (storage !== 'dark-mode' && storage !== '') {
            localStorage.setItem('my-box', '')
            body.classList.remove('dark-mode')
        }
    }

    handleOpenFiles = (element, event) => {
        const userId = this._view.getElement('#uniqueID').dataset.id
        const filesContainer = this._view.getElement('section.content')
        const selectedFiles = this._view.getElement('.item.selected', true)

        const { instance } = this._database
        const type = element.dataset.type

        if (type === 'folder') {
            this._model.keyList.push(element.dataset.file)
            this._model.folderList.push(element.dataset.name)

            const filesRef = this._database.ref(instance, `users/${userId}/files/`)
            this._openFolder(filesRef, filesContainer)

            this.handleChangeFiles()
        } else {
            window.open(element.dataset.url)
        }
    }

    async loadFiles() {
        try {
            const userId = this._view.getElement('#uniqueID').dataset.id
            const filesContainer = this._view.getElement('section.content')
            this._clearFilesContainer(filesContainer)

            const { instance } = this._database
            const filesRef = this._database.ref(instance, `users/${userId}/files`)
            const usedStorageRef = this._database.ref(instance, `users/${userId}/usedStorage`)

            this._openFolder(filesRef, filesContainer)
            this._updateStorage(usedStorageRef)
        } catch (error) {
            alert('Não foi possível carregar os arquivos.')
            throw error
        }
    }

    _openFolder(filesRef, filesContainer) {
        if (this._model.folderList.length === 0) {
            const root = this._view.getElement('#root-folder').innerHTML
            this._model.folderList.push(root)
        }

        const folder = this._database.onValue(filesRef, snapshot => {
            const filesData = snapshot.val()

            if (filesData) {
                const files = Object.values(filesData)
                const keys = Object.keys(filesData)
                this._clearFilesContainer(filesContainer)
                files.forEach((file, index) => {
                    if (this._model.keyList.join('/') === file.folderParent) {
                        const newFile = this._view.createFile({ ...file, key: keys[index] })
                        filesContainer.appendChild(newFile)
                    }
                })

                this._view.bindSelectFiles(this.handleSelectFiles)
                this._view.bindOpenFiles(this.handleOpenFiles)
                this._view.updateFolderList(this._model.folderList)
                this._view.bindFolderList(this.handleFolderList)

                this.handleChangeFiles()

            } else filesContainer.innerHTML = ''
        })

        this._model.currentFolder = folder
    }

    handleFolderList = (element, event) => {
        const userId = this._view.getElement('#uniqueID').dataset.id
        const filesContainer = this._view.getElement('section.content')
        const { instance } = this._database

        const index = this._model.folderList.indexOf(element.innerHTML)
        const count = this._model.folderList.length - (index + 1)

        this._model.folderList.splice((index + 1), count)
        this._model.keyList.splice((index), count)

        const filesRef = this._database.ref(instance, `users/${userId}/files/`)
        this._openFolder(filesRef, filesContainer)
    }

    _updateStorage(usedStorageRef) {
        this._database.onValue(usedStorageRef, snapshot => {
            const usedStorageData = snapshot.val()
            const changeProgress = (usedStorageData != undefined && usedStorageData > -1)
            const progress = this._view.getElement('.progress')

            if (changeProgress) {
                const storage = this._view.getElement('.storage span')
                const totalStorage = storage.innerHTML.split('/')[1]
                let usedStorage = Math.abs((usedStorageData / (1024 * 1024)))
                usedStorage = usedStorage === 0 ? usedStorage : usedStorage.toFixed(3)
                usedStorage = parseFloat(usedStorage) >= 0.001 ? usedStorage : 0

                storage.innerHTML = `${usedStorage} / ${totalStorage}`
                progress.style.width = `${(usedStorage / totalStorage) * 100}%`
            } else {
                progress.style.width = '0%'
            }
        })
    }

    _clearFilesContainer = (container) => {
        container.innerHTML = ''
    }

    handleChangeFiles = () => {
        const selectedFiles = [...this._view.files].filter(file => {
            const hasClass = file.classList.contains('selected')
            if (hasClass) return true
        })

        const editBtn = this._view.getElement('#edit-item')
        const deleteBtn = this._view.getElement('#delete-item')
        const content = this._view.getElement('section.content')

        switch (selectedFiles.length) {
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

        if (content.innerHTML === '') {
            editBtn.classList.add('disabled')
            deleteBtn.classList.add('disabled')
        }
    }

    handleClearSelect = (event) => {
        const selectedFiles = this._view.getElement('.item.selected', true)
        if (!selectedFiles || selectedFiles.length < 1) return
        if (event.currentTarget !== event.target) return

        [...selectedFiles].forEach((element) => {
            element.classList.remove('selected')
        })

        const files = this._view.contentArea
        files.dispatchEvent(new Event('changeFiles'))
    }

    handleDeleteFiles = async (event) => {
        const deleteBtn = this._view.getElement('#delete-item')

        if (deleteBtn.classList.contains('disabled')) return

        try {
            const userId = this._view.getElement('#uniqueID').dataset.id
            const selectedFiles = [...this._view.files].filter(file => {
                const hasClass = file.classList.contains('selected')
                if (hasClass) return true
            })

            const tasks = selectedFiles.map(item => {
                return new Promise(async (resolve, reject) => {
                    const body = {
                        originalName: item.dataset.originalname,
                        key: item.dataset.file,
                        type: item.dataset.type
                    }

                    try {
                        const response = await Fetch.delete(`/user/${userId}/files`, body)
                        const json = await response.json()

                        if (response.status !== 201) {
                            throw new Error(`Failed to delete file`)
                        }

                        resolve(json)
                    } catch (error) {
                        reject(error)
                    }
                })
            })

            await Promise.all(tasks)
            this.handleChangeFiles()
        } catch (error) {
            alert('Erro ao deletar arquivo')
        }

    }

    handleSubmitFolder = async () => {
        const input = this._view.getElement('#new-folder-input')
        const modal = this._view.getElement('.new-folder-wraper')
        const id = this._view.getElement('#uniqueID').dataset.id

        const body = {
            name: input.value,
            type: 'folder',
            folderParent: this._model.keyList.join('/')
        }

        let url, method, folderId

        if (!modal.classList.contains('edit')) {
            url = `/user/${id}/create`
            method = 'post'
        } else {
            const folderSelected = this._view.getElement('.item.selected')
            folderId = folderSelected.dataset.file

            url = `/user/${id}/files/${folderId}`
            method = 'put'
            body.name = input.value
        }

        try {
            const response = await Fetch[method](url, body)
            const json = await response.json()
            modal.style.display = 'none'
            input.value = ''
        } catch (error) {
            alert('Ocorreu um erro ao criar a pasta. Por favor, tente novamente.')
        }
    }

    handleDarkMode = () => {
        let storage = localStorage.getItem('my-box') || ''
        storage = (storage === 'dark-mode') ? '' : 'dark-mode'

        const body = this._view.getElement('body')
        if (!body) return

        localStorage.setItem('my-box', storage)

        if (storage === 'dark-mode') {
            body.classList.add('dark-mode')
        } else {
            body.classList.remove('dark-mode')
        }
    }

    handleCancelModal = (event) => {
        const modal = this._view.getElement('.new-folder-wraper')

        const keydownCondition = (event.type === 'keydown' && event.keyCode === 27)
        const clickCondition = (event.type === 'click' && event.currentTarget === event.target)

        if (clickCondition || keydownCondition) {
            const input = this._view.getElement('#new-folder-input')

            modal.style.display = 'none'
            input.value = ''
        }
    }

    handleEditModal = () => {
        const editBtn = this._view.getElement('#edit-item')

        if (editBtn.classList.contains('disabled')) return

        const modal = this._view.getElement('.new-folder-wraper')
        const elementDescription = this._view.getElement('.new-folder-box span')

        modal.classList.add('edit')
        elementDescription.innerHTML = 'Novo Nome: '
        modal.style.display = 'block'
    }

    handleFolderModal = () => {
        const modal = this._view.getElement('.new-folder-wraper')
        const elementDescription = this._view.getElement('.new-folder-box span')

        modal.classList.remove('edit')
        elementDescription.innerHTML = 'Nova Pasta: '
        modal.style.display = 'block'
    }

    handleInputChange = async () => {
        const inputFile = this._view.getElement("#upload-input")
        const files = inputFile.files

        const storageInstance = this._storage.getStorage()

        const promises = [...files].map((file) => {

            return new Promise((resolve, reject) => {
                const now = Date.now()
                const originalName = "/" + now + file.name

                const fileRef = this._storage.refStorage(
                    storageInstance,
                    originalName
                )

                const uploadTask = this._storage.uploadBytesResumable(fileRef, file)

                const upload = (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    this._view.renderUploadProgress({
                        name: file.name,
                        progress,
                    })
                }

                const completeUpload = async () => {
                    try {
                        this._view.getElement('.upload-modal').style.display = 'none'

                        const url = await this._storage.getDownloadURL(
                            uploadTask.snapshot.ref
                        )

                        const body = {
                            originalName: originalName,
                            name: file.name,
                            size: file.size,
                            type: file.type || file.name.split(".")[1],
                            date: now,
                            downloadURL: url,
                            folderParent: this._model.keyList.join('/')
                        }

                        const id = this._view.getElement("#uniqueID").dataset.id

                        const response = await Fetch.post(`/user/${id}`, body)
                        const json = await response.json()

                        if (json.status === 403) {
                            alert('Você não tem espaço suficiente para fazer upload deste arquivo')
                        }

                    } catch (error) {
                        alert("Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.")
                    }
                }

                const modal = this._view.getElement('.upload-modal')
                const progress = this._view.getElement('.upload-modal .progress')

                progress.style.witdth = '0'
                modal.style.display = 'block'
                uploadTask.on("state_changed", upload, null, completeUpload)
                resolve()
            })
        })

        try {
            const result = await Promise.all(promises)
        } catch (error) {
            console.error(error)
            alert("Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.")
        }
    }

    handleLogout = async () => {
        try {
            const response = await Fetch.post('/logout', {})
            const json = await response.json()

            if (json.logout) window.location.assign('/login')
        } catch (error) {
            throw error
        }
    }

    handleSelectFiles = (element, event) => {
        if (!element || !event) throw new Error('Parameter "element" and "event" cannot be null.')

        const action = {
            default: () => {
                const selectedFiles = this._view.getElement('.item.selected', true);
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

    handleUploadFile = () => {
        const uploadElement = this._view.getElement('#upload-input')
        uploadElement.click()
    }
}