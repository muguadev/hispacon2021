import { imgSource, loadText } from "./utils.js"

class Modal {
  constructor() {
    this.backdrop = document.createElement('div')
    this.backdrop.className = "backdrop"
    this.backdrop.innerHTML = `
      <div class="modal-dialog" tabindex="0">
        <div class="modal-header">
          <h2 class="modal-title"></h2>
          <div class="modal-close" aria-label="Cerrar" tabindex="0"></div>
        </div>
        <div class="modal-body">
        </div>
      </div>
    `

    document.body.appendChild(this.backdrop)
    this.title = this.backdrop.querySelector('h2.modal-title')
    this.body = this.backdrop.querySelector('div.modal-body')

    this.backdrop.addEventListener('click', ({target}) => {
      if ((target === this.backdrop) || (target.classList.contains('modal-close') )) this.hide()
    })
  }

  show (body) {
    const { title, content } = body
    this.title.innerHTML = title
    this.title.setAttribute('aria-label', title)
    this.body.innerHTML = content
    this.backdrop.classList.add("visible")
    this.backdrop.querySelector('div.modal-dialog').focus()
  }

  hide () {
    this.backdrop.classList.remove("visible")
  } 
}

export default Modal