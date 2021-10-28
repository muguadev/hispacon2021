import Bookshops from "./javascript/Bookshops.js"
import { applyLinks, getLinks } from "./javascript/Links.js"
import Modal from "./javascript/Modal.js"
import RoleplayingGames from "./javascript/RoleplayingGames.js"
import Schedule from "./javascript/Schedule.js"
import Speakers from "./javascript/Speakers.js"
import { WIP } from "./javascript/status.js"

const content = document.querySelector("div.content")

const modal = new Modal()

const selectOption = ({target}) => {
  document.querySelector('div.container').classList.add('with-selection')
  document.querySelector('div.sponsors').classList.add('hidden')
  document.querySelectorAll('button.option').forEach(h => {
    h.classList.add('hidden')
    h.setAttribute('tabindex', -1)
  })
  show(target.id)
}

const goHome = () => {
  show()
  document.querySelector('div.container').classList.remove('with-selection')
  document.querySelector('div.container div.content').innerHTML = ""
  document.querySelector('div.sponsors').classList.remove('hidden')
  document.querySelectorAll('button.option').forEach(h => {
    h.classList.remove('hidden')
    h.setAttribute('tabindex', 0)
  })
}

const goToEvent = code => {
  show()
  selectOption({ target: document.querySelector('button#schedule') })
  document.querySelector(`td[data-id="${code}"]`).scrollIntoView(true)
}

const goToSpeaker = code => {
  show()
  selectOption({ target: document.querySelector('button#speakers') })
  document.querySelector(`div.speaker[data-id="${code}"]`).scrollIntoView(true)
}

const schedule = new Schedule({ home: goHome, navigation: goToSpeaker })
const speakers = new Speakers({ home: goHome, navigation: goToEvent, modal })
schedule.read()
  .then(() => speakers.read())
  .then(() => getLinks())
  .then(links => applyLinks(links, schedule, speakers))

const bookshops = new Bookshops({ home: goHome, modal })
bookshops.read()
const games = new RoleplayingGames({ home: goHome, modal })
games.read()

const show = id => {
  if (['schedule', 'speakers', 'bookfair', 'roleplaying'].includes(id)) {
    content.style.transitionDelay = "0.6s";
    content.classList.add('visible')
  } else {
    content.style.transitionDelay = "0s"
    content.classList.remove('visible')
  }

  switch (id) {
    case 'schedule':
      schedule.render()
      break
    case 'speakers':
      speakers.render()
      break
    case 'bookfair':
      bookshops.render()
      break
    case 'roleplaying':
      games.render()
      break
  }
}

const landingPage = async () => {
  document.querySelectorAll('button.option').forEach(o => {
    if (!!WIP && (o.id !== "roleplaying")) {
      o.disabled = true
      o.classList.add("wip")
    }
    o.addEventListener('click', selectOption)
  })
}

window.onload = landingPage;
