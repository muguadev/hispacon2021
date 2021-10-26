import Container from "./Container.js";
import { loadExcelFile, loadHtml, paragraphs } from "./utils.js";

const GAMES_FILENAME = 'data/jornadas.txt'
const INFO_FILENAME = '/assets/static/jornadas/info.html'

const LANGUAGES = {
  gallego: 'ga',
  catalán: 'ct',
  catalan: 'ct',
  euskera: 'pv',
  vasco: 'pv',
  valenciano: 'vc'
}

const localeFlag = (language) => {
  if (!language) return
  const lang = language.toLocaleLowerCase()
  return lang === 'castellano' ? '' : `<div class="language ${LANGUAGES[lang]}"></div>`
}

const GameEntry = (day, entry) => {
  const {id, from, to, title, system, master, adult, language, rookies} = entry
  return !id ? '' : `
    <div class="game-entry" data-day="${day}" data-id="${id}">
      <div style="text-align: right;"><small><strong>${from}&ndash;${to}</strong></small></div>
      <h3>${title}</h3>
      <div><small>Partida de <strong>${system}</strong></small></div>
      <div><small>Dirigida por <strong>${master}</strong></small></div>
      <div class="additional">
        ${!!adult ? '<div class="adult"></div>': ''}
        ${!!rookies ? '<div class="rookies"></div>' : ''}
        ${localeFlag(language)}
      </div>
      <div class="more"></div>
    </div>
  `
}

const card = (day, {from, to, image, title, system, master, players, adult, webcam, broadcasted, recorded, tw, safety, bots, tools, text, rookies, language}) => (
  {
    title,
    content: `
      <div class="game-card" style="background-image: url(images/jornadas/games/${image})">
        <div class="game-info">
          <div class="game-info-contents">
            <div class="additional">
              ${!!adult ? '<div class="adult"></div>' : ''}
              ${!!rookies ? '<div class="rookies"></div>' : ''}
              ${localeFlag(language)}
            </div>
            <div class="field date">${day.slice(1)}/11 ${from}&ndash;${to}</div>
            <div class="field master">${master}</div>
            <div class="field franchise">${system}</div>
            <div class="field players">${players[0] === players[1] ? players[0] : `${players[0]} a ${players[1]}`}</div>
            <small class="field webcam">${webcam.toLocaleLowerCase() === "no" ? 'No (solo audio)' : webcam}</small>
            <small class="field bots">${!!bots ? 'Sí' : 'No'}</small>
            ${tools !== "" ? `<small class="field tools">${tools}</small>` : ''}
          </div>
        </div>
        <div class="game-text">
          ${paragraphs(text)}
          ${(!!recorded || !!broadcasted || !!tw || !!safety) ? '<hr><ul>' : ''}
          ${!!recorded ? (
              `<li>La partida se grabará${!!broadcasted ? ' y se emitirá' : '.</li>'}`
            ) : (
              !!broadcasted ? '<li>La partida se emitirá.</li>' : ''
            )}
            ${!!safety ? `<li><strong>Herramientas de seguridad: </strong>${safety}</li>` : ''}
            ${!!tw ? `<li><strong>Avisos de contenido sensible: </strong>${tw}</li>` : ''}
          ${(!!recorded || !!broadcasted || !!tw || !!safety) ? '</ul>' : ''}
        </div>
      </div>  
    `
  }
)

class RoleplayingGames {
  constructor({ home, modal }) {
    this.container = new Container(home)
    this.games = null

    this.modal = modal

    this.template = ""
    loadHtml(INFO_FILENAME).then(markup => this.template = `
      <div id="rpg-content">
        ${markup}
        <div class="rpg-games">
          <h1 tabindex="0">Partidas</h1>
          <table>
            <colgroup>
              <col class="rpg-col">
              <col class="rpg-col">
              <col class="rpg-col">
            </colgroup>
            <thead><tr>
              <th>Viernes 19</th>
              <th>Sábado 20</th>
              <th>Domingo 21<th>
            </tr></thead>
          </table>
          <div style="height: 100%; overflow-y: auto; scroll-behavior: smooth;">
            <table style="width: 100%;">
              <colgroup>
                <col class="rpg-col">
                <col class="rpg-col">
                <col class="rpg-col">
              </colgroup>
              <tbody id="games-list">
              </tbody>
            </table>
          </div>
        </div>
      </div> 
      <div id="rpg-footer">
        <div class="rpg-footer-panel">
          <a href="https://crisiscreativarol.wordpress.com/" target="_blank"><img aria-label="Crisis Creativa Rol" src="images/jornadas/sponsors/crisiscreativa.jpg"></a>
          <a href="https://naufragio.net/" target="_blank"><img aria-label="El naufragio" src="images/jornadas/sponsors/naufragio.png"></a>
          <a href="https://www.exregnum.com/" target="_blank"><img aria-label="Ex Regnum" src="images/jornadas/sponsors/exregnum.png"></a>
          <a href="https://grapasymapas.com/" target="_blank"><img aria-label="Grapas y mapas" src="images/jornadas/sponsors/grapasymapas.png"></a>
          <a href="https://htpublishers.es/" target="_blank"><img aria-label="H T Publishers" src="images/jornadas/sponsors/ht.png"></a>
          <a href="https://www.nosolorol.com/es/" target="_blank"><img aria-label="No solo rol" src="images/jornadas/sponsors/nosolorol.png"></a>
          <a href="http://www.other-selves.com/" target="_blank"><img aria-label="Other selves" src="images/jornadas/sponsors/otherselves.png"></a>
          <a href="https://seijo.my-online.store/" target="_blank"><img aria-label="Seijo" src="images/jornadas/sponsors/seijo.png"></a>
          <a href="https://ikanart.onlineweb.shop/" target="_blank"><img aria-label="Ikan" src="images/jornadas/sponsors/ikan.png"></a>
          <a href="https://shadowlands.es/" target="_blank"><img aria-label="Shadowlands Ediciones" src="images/jornadas/sponsors/shadowlands.png"></a>
          <a href="https://sugaareditorial.com/" target="_blank"><img aria-label="Sugaar Editorial" src="images/jornadas/sponsors/sugaar.png"></a>
          <a href="https://www.unleashedgames.es/" target="_blank"><img aria-label="Unleashed Games" src="images/jornadas/sponsors/unleashed.png"></a>
          <a href="https://www.facebook.com/yotambiensoyunfriki/" target="_blank"><img aria-label="Yo también soy un friki" src="images/jornadas/sponsors/friki.png"></a>
        </div>
        <div class="rpg-footer-panel">
          <a href="https://www.exitocritico.es/" target="_blank"><img aria-label="Éxito Crítico" src="images/jornadas/sponsors/exitocritico.png"></a>
        </div>  
      </div>
    `)
  }

  read = async () => {
    const rows = await loadExcelFile(GAMES_FILENAME)
    const games = rows.reduce((current, row, index) => {
      const [id, from, to, title, master, system, language, text, image, adult, rookies, minPlayers, maxPlayers, webcam, tw, safety, bots, tools, broadcasted, recorded] = row
      if ((index === 0) || (id === "")) return current
      
      const { dd, hh, mm } = from.match(/(?<dd>\d{2})\/(?<mo>\d{2})\/(?<yyyy>\d{4}) (?<hh>\d{2}):(?<mm>\d{2})/).groups
      const { hora, minuto } = to.match(/(?<dia>\d{2})\/(?<mes>\d{2})\/(?<anio>\d{4}) (?<hora>\d{2}):(?<minuto>\d{2})/).groups
      return {
        ...current,
        [`D${dd}`]: [
          ...current[`D${dd}`],
          {
            id,
            from: `${hh}:${mm}`,
            to: `${hora}:${minuto}`,
            title,
            master,
            system,
            language,
            text: text.replaceAll('"', ''),
            image,
            adult: (adult.toLocaleLowerCase() === "sí"),
            rookies: (rookies.toLocaleLowerCase() === "sí"),
            players: [parseInt(minPlayers), parseInt(maxPlayers)],
            webcam,
            tw: tw.replaceAll('"', ''),
            safety,
            bots: (bots.toLocaleLowerCase() === "sí"),
            tools,
            broadcasted: (broadcasted.toLocaleLowerCase() === "sí"),
            recorded: (recorded.toLocaleLowerCase() === "sí"),
          }]
      }
    }, { D19: [], D20: [], D21: [] })

    this.games = games
  }

  render = () => {
    this.container.markup = this.template

    document.querySelectorAll('li[role="link"]').forEach(link => link.addEventListener('click', ({target}) => {
      document.querySelector(`#${target.getAttribute('data-section')}`).scrollIntoView(true)
    }))

    document.querySelectorAll('h3 img').forEach(link => link.addEventListener('click', () => {
      document.querySelector('span#index').scrollIntoView(true)
    }))

    if (!this.games) return
    const { D19, D20, D21 } = this.games
    const longest = Math.max(D19.length, D20.length, D21.length)
    const d19Games = [ ...D19.sort((a, b) => a.from.localeCompare(b.from)), ...new Array(longest - D19.length).fill({})]
    const d20Games = [ ...D20.sort((a, b) => a.from.localeCompare(b.from)), ...new Array(longest - D20.length).fill({})]
    const d21Games = [ ...D21.sort((a, b) => a.from.localeCompare(b.from)), ...new Array(longest - D21.length).fill({})]

    const rows = d19Games.reduce((markup, current, index) => {
      return `${markup}<tr><td>${GameEntry('D19', current)}</td><td>${GameEntry('D20', d20Games[index])}</td><td>${GameEntry('D21', d21Games[index])}</td></tr>`
    }, '')

    this.container.element.querySelector('tbody#games-list').innerHTML = rows;

    this.container.element.querySelectorAll('tbody#games-list div.more').forEach(button => button.addEventListener('click', ({target}) => {
      const entry = target.closest('div.game-entry')
      const day = entry.getAttribute('data-day')
      const id = entry.getAttribute('data-id')

      const game = this.games[day].find(game => game.id === id)

      if (!!game && !!this.modal) this.modal.show(card(day, game)) 
    }))

  }
}

export default RoleplayingGames