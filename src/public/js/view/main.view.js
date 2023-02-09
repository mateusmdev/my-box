class View {
    constructor() {
        this.aside = this.getElement('aside')
        this.darkModeButton = this.getElement('#dark-mode-button')
        this.newFolderButton = this.getElement('#new-folder')
        this.uploadFileButton = this.getElement('#upload-file')
        this.editFileButton = this.getElement('#edit-item')
        this.fileInput = this.getElement('#upload-input')
        this.logoutButton = this.getElement('#logout')
        this.newFolderForm = this.getElement('#folder-form')
        this.contentArea = this.getElement('section.content')
        this.files = this.getAllElements('.item')
    }

    getElement(selector) {
        const element = document.querySelector(selector)
        //if (!element) throw new Error("Element doesn't exist")
        return element
    }

    getAllElements(selector) {
        const element = document.querySelectorAll(selector)
        //if (!element) throw new Error("Elements doesn't exist")
        return element
    }

    _addEvent(element, action, handler) {
        element.addEventListener(action, event => {
            event.preventDefault()
            handler(event)
        }, false)
    }

    async _addEventAll(elementsList, action, handler) {
        /*
        console.log(elementsList);
        [...elementsList].forEach(element => {
            element.addEventListener(action, event => {
                event.preventDefault()
                handler()
            })
        })*/


        const promises = [...elementsList].map(element => {
            return new Promise(function (resolve, reject) {
                element.addEventListener(action, event => {
                    event.preventDefault()

                    handler(element, event)
                })
                resolve()
            })
        })

        const result = await Promise.all(promises)
        //console.log(result)
        //console.log('resultado promise')

    }

    bindDarkMode(handler) {
        this._addEvent(this.darkModeButton, 'click', handler)
    }

    bindDeleteItems(handler) {
        //this._addEvent
    }

    bindNewFolderButton(handler) {
        this._addEvent(this.newFolderButton, 'click', handler)
    }

    bindUploadFile(handler) {
        this._addEvent(this.uploadFileButton, 'click', handler)
    }

    bindLogout(handler) {
        this._addEvent(this.logoutButton, 'click', handler)
    }

    bindFileInput(handler) {
        this._addEvent(this.fileInput, 'change', handler)
    }

    bindCreateFolder(handler) {
        this._addEvent(this.newFolderForm, 'submit', handler)
    }

    bindSelectFiles(handler) {
        this.files = this.getAllElements('.item')
        this._addEventAll(this.files, 'click', handler)
    }

    bindEditFiles(handler) {
        this._addEvent(this.editFileButton, 'click', handler)
    }

    bindClearSelect(handler) {
        this._addEvent(this.contentArea, 'click', handler)
    }

    bindChangeFiles(handler) {
        this._addEvent(this.contentArea, 'changeFiles', handler)
    }

    displayModalFolder() {
        let template = `
        <div class="new-folder-wraper">
        <form action="#">
            <div>Nova Pasta</div>
            <div>
                <input type="text">
                <button type="submit" class="btn-enter"><i class="fa-solid fa-square-check"></i></button>
            </div>
        </form>
    </div>
        `

        return template
    }

    renderUploadProgress(file) {
        if (file.progress < 100) {
            this.getElement('.upload-modal .progress').style.width = `${file.progress}%`
            this.getElement('.upload-modal .file-name').innerHTML = `${file.name}`
        }
    }

    _fileType(mimetype) {
        console.log(mimetype)
        const icons = {
            'text/x-csrc': 'fa-sharp fa-solid fa-c',
            'text/css': 'fa-brands fa-css3-alt',
            'folder': 'fas fa-folder',
            'image/gif': 'fa-solid fa-image',
            'text/html': 'fa-brands fa-html5',
            'text/x-java': 'fa-brands fa-java',
            'application/x-javascript': 'fa-brands fa-square-js',
            'image/jpeg': 'fa-solid fa-image',
            'audio/mpeg': 'fa-solid fa-file-audio',
            //mp4: '',
            'application/pdf': 'fa-solid fa-file-pdf',
            'application/x-php': 'fa-brands fa-php',
            'text/x-python': 'fa-brands fa-python',
            'application/vnd.rar': 'fa-solid fa-file-zipper',
            'vue': 'fa-brands fa-vuejs',
            'application/zip': 'fa-solid fa-file-zipper',
        }

        let iconSelected = icons[mimetype]
        if (!iconSelected) iconSelected = 'fas fa-file'

        return iconSelected
    }

    createFile(data) {
        const html = `<div class="item" data-file="${data.key}">
        <div class="folder">
            <i class="${this._fileType(data.type)}"></i>
            <span>${data.name}</span>
        </div>
    </div>`

        const fileItem = document.createElement('div')
        fileItem.innerHTML = html
        return fileItem
    }
}