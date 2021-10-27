import { SPEAKERS } from "../data/ponentes.js"
import Container from "./Container.js"
import { htmlEncode, imgSource, loadExcelFile, loadText } from "./utils.js"

// const SPEAKERS_FILENAME = 'data/ponentes.txt'
const SOCIAL_FILENAME = 'data/social.txt'

const TEMPLATE = `
  <div id="speakers-content" style="height: 100%; display: flex; flex-direction: column;">
    <div id="speakers_search">
      <input id="search_box" type="search" aria-label="Buscar ponentes">
      <span id="buttons"></span>
    </div>
    <div id="speakers_list">
    </div>
  </div>
`

const sortingToken = ([ _code, _name, surname, nickname, _image ]) => {
  if (surname === "") return nickname
  return surname.split(" ").find(token => token[0] === token[0].toUpperCase())
}

const WEEKDAYS = ['V', 'S', 'D']

const Speaker = ({ code, name, surname, nickname, image, bio, events, social }) => {
  const fullName = !surname ? (
    `<h2><span class="nick bright">${nickname}</span></h2>` 
  ) : (
    `<h2>${[name, `<span class="bright">${surname}</span>`].join(" ")}${!!nickname ? ` <span class="nick">${nickname}</span>` : ''}</h2>`
  )

  const searchString = `${name}${surname}${nickname}`.replace(/\s+/g, '').toLocaleLowerCase()
  return `
    <div class="speaker" data-searchstring="${searchString}" data-id="${code}" aria-label="${name} ${surname} ${nickname}" tabindex="0">
      ${fullName}
      <img class="picture" src="${imgSource(image)}">
      <div class="social">
        ${!!social ? (
          Object.entries(social).map(([platform, url]) => `<a href="${url}" target="_blank"><div class="platform ${platform}"></div></a>`).join('\n')
        ) : ''}
      </div>
      <div class="events">
        ${
          (!!events && !!events.length) ? (
            `
              <strong>Agenda</strong>
              <table>
                <colgroup>
                  <col style="width: 10%;">
                  <col style="width: 85%;">
                  <col style="width: 5%;">
                </colgroup>
                ${
                  events.reduce((markup, event) => `
                    ${markup}
                    <tr data-event-id="${event.code}">
                      <td class="icon ${event.style}"></td>
                      <td class="event_link">${event.title}</td>
                      <td class="small">${WEEKDAYS[parseInt(event.date.substring(0, 2)) -19]} ${event.date.substring(0, 2)} ${event.from}</td>
                    </tr>
                  `, "")
                }
              </table>
            `
          ) : ''
        }
      </div>
      ${!!bio ? `<div class="more" tabindex="0" role="button" aria-label="Biografía de ${!!surname ? `${name} ${surname}` : nickname}"></div>` : ''}
    </div>
  `
}

const setupCard = async ({name, surname, nickname, image, bio}) => {
  const fullName = `${name} ${surname}${!!nickname ? `&laquo;${nickname}&raquo;` : ''}`

  const rawText = await loadText(`data/bios/${bio}`)
  const text = rawText.replaceAll('\r', '').split('\n').reduce((markup, paragraph) => {
    if (paragraph === "") return markup
    return `${markup}<p>${paragraph}</p>`
  }, "")

  return {title: fullName, content: `
    <img class="author-picture" src="${imgSource(image)}">
    <div class="author-bio" tabindex="0">
      ${text}
    </div>
  `}
}

class Speakers {
  constructor({ home, navigation, modal }) {
    this.container = new Container(home)    
    this.speakers = null
    this.onNavigation = navigation

    this.modal = modal
  }

  get roster () { return this.speakers }

  read = async () => {
    const rows = SPEAKERS.split('\n').map(s => s.split('\t'))
    const platforms = await loadExcelFile(SOCIAL_FILENAME)

    const social = platforms.reduce((presence, row, index) => {
      const [id, platform, url] = row
      if ((index === 0) || id === '') return presence

      return { ...presence, [id]: { ...(presence[id] || {}), [platform]: url } }
    }, {})

    this.speakers = rows.filter((r, index) => (index > 0) && (r.length > 1) && (r.slice(1, 4).join("") !== "")).sort((a, b) => {
      const s1 = sortingToken(a)
      const s2 = sortingToken(b)

      if (s1 === s2) {
        a[1].localeCompare(b[1], 'es-ES', { sensitivity: 'base' })
      } else {
        return s1.localeCompare(s2, 'es-ES', { sensitivity: 'base' })
      }
    }).map(row => {
      const [ code, name, surname, nickname, image, by, bio, pronouns ] = row
      return {
        code,
        name: htmlEncode(name),
        surname: htmlEncode(surname),
        nickname: htmlEncode(nickname),
        image,
        by,
        bio,
        social: social[code],
        token: sortingToken(row).normalize("NFD").replace(/\p{Diacritic}/gu, "")
      }
    })
  }

  render = () => {
    if (this.speakers.length === 0) return

    this.container.markup = TEMPLATE

    const blocks = this.speakers.reduce((current, { code, name, surname, nickname, image, events, token, social, bio }) => {
      const list = current[token[0]] || []

      return { ...current, [token[0]]: [ ...list, { code, name, surname, nickname, events, image, social, bio }]}
    }, {})

    Object.entries(blocks).forEach(([key, speakers]) => {
      document.querySelector('div#speakers_list').innerHTML += `
        <div id="block-${key.toLocaleUpperCase()}" class="block" tabindex="0" aria-label="Letra ${key.toLocaleUpperCase()}">
          <h1>${key.toLocaleUpperCase()}</h1>
          ${
            speakers.reduce((markup, speaker) => `${markup}${Speaker(speaker)}`, '')
          }
        </div>
      `
      document.querySelector('div#speakers_search span#buttons').innerHTML += `<button class="button" data-block="block-${key.toLocaleUpperCase()}" aria-label="Ir a letra ${key.toLocaleUpperCase()}">${key.toLocaleUpperCase()}</button>`
    })

    document.querySelectorAll('div#speakers_search span#buttons button.button').forEach(button => button.addEventListener('click', ({target}) => {
      const block = document.querySelector(`div.block#block-${target.textContent.toLocaleUpperCase()}`)
      block.scrollIntoView(true)
      block.focus(true)
    }))

    document.querySelectorAll('tr[data-event-id]').forEach(tr => tr.addEventListener('click', ({target}) => {
      const code = target.closest('tr').getAttribute('data-event-id')
      if (!!this.onNavigation && !!code) this.onNavigation(code)
    }))

    document.querySelectorAll('div.more').forEach(button => {
      button.addEventListener('click', ({target}) => {
        const speaker =  this.speakers.find(({code}) => code === target.closest('div.speaker').getAttribute("data-id"))
        setupCard(speaker).then(card => this.modal.show(card))
      })
    })

    let wait;

    document.querySelector('input#search_box').addEventListener('input', ({target}) => {
      clearTimeout(wait)
      if (target.value === "") {
        this.filter("")
      } else {
        wait = setTimeout(() => this.filter(target.value), 1000)
      }
    })
  }

  filter = text => {
    if (text === "") {
      document.querySelectorAll('div#speakers_search span#buttons button.button').forEach(button => { button.disabled = false })
      document.querySelectorAll('div#speakers-content .hidden').forEach(item => item.classList.remove('hidden'))
      document.querySelector('div.block:first-child').focus()
    } else {
      const nonMatching = `div#speakers-content div.speaker:not([data-searchstring*="${text.replace(/\s+/g, '').toLocaleLowerCase()}"])`
      const matching = `div#speakers-content div.speaker[data-searchstring*="${text.replace(/\s+/g, '').toLocaleLowerCase()}"]`
      document.querySelectorAll(nonMatching).forEach(item => item.classList.add('hidden'))
      document.querySelectorAll(matching).forEach(item => item.classList.remove('hidden'))
      document.querySelectorAll('div#speakers_search span#buttons button.button').forEach(button => {
        const block = document.querySelector(`div.block#${button.getAttribute('data-block')}`)
        if (block.querySelectorAll('div.speaker:not(.hidden)').length === 0 ) {
          block.classList.add('hidden')
          button.disabled = true
        } else {
          block.classList.remove('hidden')
          button.disabled = false
        }
      })
    }
  }

  link = (event, speakerId) => {
    const index = this.speakers.findIndex(({code}) => code === speakerId)
    if (index === -1) return
    
    const current = this.speakers[index]
    const { events } = current
    this.speakers = [
      ...this.speakers.slice(0, index),
      { ...current, events: [ ...(events || []), event] },
      ...this.speakers.slice(index+1)
    ]
  }
}

export default Speakers