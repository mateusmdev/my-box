class View {
    constructor() {
        this.aside = this.getElement('aside')
        this.darkModeButton = this.getElement('#dark-mode-button')
        this.newFolderButton = this.getElement('#new-folder')
        this.uploadFileButton = this.getElement('#upload-file')
        this.editFileButton = this.getElement('#edit-item')
        this.deleteFileButton = this.getElement('#delete-item')
        this.fileInput = this.getElement('#upload-input')
        this.logoutButton = this.getElement('#logout')
        this.newFolderForm = this.getElement('#folder-form')
        this.contentArea = this.getElement('section.content')
        this.files = this.getElement('.item', true)
        this.folderListElements = this.getElement('ol li a', true)
        this.modal = this.getElement('.new-folder-wraper')
        this.body = this.getElement('body')
    }

    _addEvent(element, action, handler, prevent=true) {
        element.addEventListener(action, event => {
            if (prevent) event.preventDefault()
            handler(event)
        }, false)
    }

    async _addEventAll(elementsList, action, handler) {
        const promises = [...elementsList].map(element => {
            return new Promise(function (resolve, reject) {
                element.addEventListener(action, event => {
                    event.preventDefault()

                    handler(element, event)
                })
                resolve()
            })
        })

        await Promise.all(promises)
    }

    getElement(selector, allElements = false) {
        let element

        if (allElements) element = document.querySelectorAll(selector)
        else element = document.querySelector(selector)
        
        return element
    }

    bindChangeFiles(handler) {
        this._addEvent(this.contentArea, 'changeFiles', handler)
    }

    bindClearSelect(handler) {
        this._addEvent(this.contentArea, 'click', handler)
    }

    bindSubmitFolder(handler) {
        this._addEvent(this.newFolderForm, 'submit', handler)
    }

    bindDarkMode(handler) {
        this._addEvent(this.darkModeButton, 'click', handler)
    }

    bindDeleteFiles(handler) {
        this._addEvent(this.deleteFileButton, 'click', handler)
    }

    bindEditFiles(handler) {
        this._addEvent(this.editFileButton, 'click', handler)
    }

    bindFileInput(handler) {
        this._addEvent(this.fileInput, 'change', handler)
    }

    bindLogout(handler) {
        this._addEvent(this.logoutButton, 'click', handler)
    }

    bindNewFolderButton(handler) {
        this._addEvent(this.newFolderButton, 'click', handler)
    }

    bindSelectFiles(handler) {
        this.files = this.getElement('.item', true)
        this._addEventAll(this.files, 'click', handler)
    }

    bindOpenFiles(handler){
        this.files = this.getElement('.item', true)
        this._addEventAll(this.files, 'dblclick', handler)
    }

    bindUploadFile(handler) {
        this._addEvent(this.uploadFileButton, 'click', handler)
    }

    bindFolderList(handler) {
        this.folderListElements = this.getElement('ol li a', true)
        this._addEventAll(this.folderListElements, 'click', handler)
    }

    bindCancelModal(handler) {
        this._addEvent(this.body, 'keydown', handler, false)
        this._addEvent(this.modal, 'click', handler)
    }

    updateFolderList(list) {
        const ol = this.getElement('ol')
        let html = ''

        list.forEach((name, index)=> {
            const element = index === 0 ?`<li><a href="#" id="root-element">${name}</a></li>` : `<li>> <a href="#">${name}</a></li>`

            html += element
        })

        if (list.length === 0) html = `<li> <a href="#">/</a></li>`
        ol.innerHTML = html
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
        const modal = this.getElement('.upload-modal')
        if (modal.style.display !== 'block') modal.style.display = 'block'

        if (file.progress) {
            this.getElement('.upload-modal .progress').style.width = `${file.progress}%`
            this.getElement('.upload-modal .file-name').innerHTML = `${file.name}`
        }
    }

    _fileType(mimetype) {
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
            'video/mp4': 'fa-solid fa-file-video',
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
        const attr = (data.type !== 'folder') ? `data-url="${data.downloadURL}"` : ''
        const html = `<div class="item" data-file="${data.key}" data-type="${data.type}" data-name="${data.name}" ${attr} data-originalname="${data.originalName}">
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