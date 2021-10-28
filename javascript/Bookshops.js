import { BOOKSHOPS } from "../data/feria.js";
import Container from "./Container.js";
import { WIP } from "./status.js";
import { loadHtml } from "./utils.js";

const TEMPLATE = (markup) => `
  ${!!WIP ? '<div class="wip"></div><div class="peekaboo left"></div><div class="peekaboo right"></div><div class="peekaboo fighter"></div>' : ''}
  <div id="bookfair-filters"></div>
  <div id="bookfair-content">
    ${markup}
  </div>
`

const setupCard = async ({ name, logo, link, promotional }) => {
  const markup = await loadHtml(`data/fvlg/${promotional}`)
  return {
    title: name,
    content: `
      <img class="bookshop-dialog-logo" src="images/fvlg/bookstores/${logo}">
      <div class="bookshop-dialog-promo">
        ${markup}
      </div>
      <a class="bookshop-dialog-buy" href="${link}" target="_blank"><div class="buy-button"></div></a>
    `
  }
}

const BookshopEntry = ({ id, name, logo }) => `<div data-id="${id}" tabindex="0" role="button" class="bookshop-entry" style="background-image: url(images/fvlg/bookstores/${logo});"><h3>${name}</h3></div>`

class Bookshops {
  constructor({home, modal}) {
    this.container = new Container(home)
    this.bookshops = null

    this.modal = modal
  }

  read = async () => {
    const rows = BOOKSHOPS.split('\n').map(b => b.split('\t'))
    this.bookshops = rows.reduce((list, row, index) => {
      const [id, name, logo, link, promotional] = row
      if ((index === 0) || (id === "")) return list

      return [ ...list, { id, name, logo, link, promotional} ]
    }, [])
  }

  render = () => {
    const markup = (!this.bookshops ? '' : (
      this.bookshops.reduce((html, shop) => {
        return `${html}${BookshopEntry(shop)}`
      }, '')
    ))

    this.container.markup = TEMPLATE(markup)

    this.container.element.querySelectorAll('div.bookshop-entry').forEach(entry => entry.addEventListener('click', ({target}) => {
      const bookshop = this.bookshops.find(({id}) => id === target.closest('div.bookshop-entry').getAttribute('data-id'))
      if (!!bookshop.promotional) {
        setupCard(bookshop).then(card => this.modal.show(card))
      } else {
        window.open(bookshop.link, '_blank')
      }
    }))
  }
}

export default Bookshops