const CONTAINER_SELECTOR = 'div.content'

class Container {
  constructor (callback) {
    this.root = document.querySelector(CONTAINER_SELECTOR)
    this.homeButton = document.createElement('button')
    this.homeButton.className = "home"
    this.homeButton.innerHTML = "&#x21E6; Volver"
    this.homeButton.ariaLabel = "Volver al menú principal"
    this.callback = callback
  }

  get element () { return this.root }

  set markup (html) {
    this.root.innerHTML = ""
    this.root.appendChild(this.homeButton)
    this.root.innerHTML += html
    if (!!this.callback) this.root.querySelector('button.home').addEventListener('click', this.callback)
  }
}

export default Container