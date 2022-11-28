class View {
    constructor() {
        this.aside = this.getElement('aside')
        this.darkModeButton = this.getElement('#dark-mode-button')
        this.newFolderButton = this.getElement('#new-folder')
        this.uploadFileButton = this.getElement('#upload-file')
        this.fileIput = this.getElement('#upload-input')
    }

    getElement(selector) {
        const element = document.querySelector(selector)
        if (!element) throw new Error("Element doesn't exist")
        return element
    }

    _addEvent(element, action, handler){
        element.addEventListener(action, event => {
            event.preventDefault()

            handler()
        }, false)
    }

    bindDarkMode(handler){
        this._addEvent(this.darkModeButton, 'click', handler)
    }

    bindDeleteItems(handler) {
        //this._addEvent
    }

    bindNewFolder(handler) {
        //this.newFolderButton.addEventListener('click', handler)
    }

    bindUploadFile(handler) {
        this._addEvent(this.uploadFileButton, 'click', handler)
    }

    bindFileInput(handler){
        this._addEvent(this.fileIput, 'change', handler)
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
}