import Container from "./Container.js";
import { htmlEncode, imgSource, loadExcelFile } from "./utils.js"

const clearHtml = text => text.replace(/(<([^>]+)>)/gi, "");

const SCHEDULE_FILENAME = 'data/programa.txt'

const TEMPLATE = `
  <div style="height: 100%; display: flex; flex-direction: column;">
    <table class="schedule" style="flex-shrink: 0;">
      <colgroup>
        <col style="width: 5%;"/>
        <col style="width: 29%;"/>
        <col style="width: 1.5%;"/>
        <col style="width: 29%;"/>
        <col style="width: 1.5%;"/>
        <col style="width: 29%;"/>
        <col style="width: 5%;"/>
      </colgroup>
      <thead>
        <th></th>
        <th>Sala Ignotus</th>
        <th></th>
        <th>Sala Visiones</th>
        <th></th>
        <th>Microsedes</th>
        <th></th>
      </thead>
    </table>
    <div style="width: 100%; height: 100%; overflow-y: auto; scroll-behavior: smooth;">
      <table class="schedule">
        <colgroup>
          <col style="width: 5%;"/>
          <col style="width: 29%;"/>
          <col style="width: 1.5%;"/>
          <col style="width: 29%;"/>
          <col style="width: 1.5%;"/>
          <col style="width: 29%;"/>
          <col style="width: 5%;"/>
        </colgroup>
        <tbody>
        </tbody>
      </table>
    </div>
  </div>
`

const DATES = [
  { label: 'V 19', aria: 'Viernes 19' },
  { label: 'S 20', aria: 'Sábado 20' },
  { label: 'D 21', aria: 'Domingo 21' }]
const EVENT_STYLES = {
  'Evento oficial': 'official',
  'Mesa redonda': 'debate',
  'Entrevista': 'interview',
  'Presentaci&oacute;n': 'speech',
  'Presentaci&oacute;n de novedades': 'new'
}
const VENUES = {
  '80 Mundos': 'l80mundos',
  'Akira': 'akira',
  'Pantera Rossa': 'pantera',
  'Domus': 'domus',
  'Ins&ograve;lita': 'insolita',
  'Gigamesh': 'gigamesh'
}

const eventStyle = ({style, channel}) => !!channel ? `venue ${VENUES[channel]}` : (style || "")
const filler = time => `<td${time !== '' ? ' style="border-top: 2px dotted var(--border-color);"' : ''}></td>`
const eventCell = (event, idx, time) => !event ? filler(time) : (
  event.start < idx ? '' : `
    <td tabindex="0" data-id="${event.code}" class="event ${eventStyle(event)}" rowspan="${event.rowspan}">
      <h2 aria-label="${event.kind}: ${clearHtml(event.title)}.">${event.title}</h2>
      <span class="time" aria-label="${DATES[Math.floor(idx / 48)].aria}, ${event.from}-${event.to}, sala ${event.room}.">${event.from}-${event.to}</span>
      <span class="roster" ${(event.speakers || []).length > 0 ? `aria-label="Participantes: ${event.speakers.map(({name, surname, nickname}) => `${name} ${surname} ${nickname}`).join(', ')}"` : ''}>
      ${
        (event.speakers || []).reduce((markup, { code, name, surname, nickname, image }) => `
          ${markup}
          <img tabindex="0" src="${imgSource(image)}" class="thumbnail" aria-label="${name} ${surname} ${nickname}" data-id="${code}">
        `, '')
      }
      </span>
    </td>
  `
)

class Schedule {
  constructor({ home, navigation }) {
    this.container = new Container(home)
    this.onNavigation = navigation
    
    this._events = null
  }

  get events () { return [ ...this._events['Ignotus'], ...this._events['Visiones'], ...this._events['Microsedes']] }

  read = async () => {
    const rows = await loadExcelFile(SCHEDULE_FILENAME)

    this._events = rows.reduce((current, row, index) => {
      const [ code, room, date, duration, kind, channel, title, link ] = row
      if ((index === 0) || (code === "")) return current

      const list = current[room]
      const { dd, hh, mm } = date.match(/(?<dd>\d{2})\/(?<mo>\d{2})\/(?<yyyy>\d{4}) (?<hh>\d{2}):(?<mm>\d{2})/).groups
      const start = (48 * (parseInt(dd) - 19)) + (4 * (parseInt(hh) - 10)) + (parseInt(mm) / 15)
      const from = `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`
      const to = `${String(parseInt(hh) + Math.floor((parseInt(mm) + parseInt(duration)) / 60)).padStart(2, '0')}:${String((parseInt(mm) + parseInt(duration)) % 60).padStart(2, '0')}`

      const eventKind = htmlEncode(kind)

      const event = { code, room, date, duration, style: EVENT_STYLES[eventKind], kind: eventKind, channel: htmlEncode(channel), from, to, title: htmlEncode(title), link, start, rowspan: duration / 15 }

      return { ...current, [room]: [ ...list, event ] }
    }, { Ignotus: [], Visiones: [], Microsedes: [] })
  }

  render = async () => {
    if (!this._events) this._events = await this.read()
    
    const reversed = {
      Ignotus: this._events['Ignotus'].slice().sort((a, b) => b.start - a.start),
      Visiones: this._events['Visiones'].slice().sort((a, b) => b.start - a.start),
      Microsedes: this._events['Microsedes'].slice().sort((a, b) => b.start - a.start)
    }

    this.container.markup = TEMPLATE

    const rows = new Array(48 * 3).fill(0).map((_, idx) => {
      const i = reversed['Ignotus'].find(({start, rowspan}) => (start <= idx) && (idx < (start + rowspan)))
      const v = reversed['Visiones'].find(({start, rowspan}) => (start <= idx) && (idx < (start + rowspan)))
      const m = reversed['Microsedes'].find(({start, rowspan}) => (start <= idx) && (idx < (start + rowspan)))

      const date = (idx % 48 === 0) ? DATES[Math.floor(idx / 48)].label : ''
      const time = (idx % 4 === 0) ? `${10 + ((idx % 48)/4)}:00` : ''

      const dateHeader = `<th style="vertical-align: top;${time !== '' ? 'border-top: 2px dotted var(--border-color);' : ''}"><h1>${date}</h1></th>`
      const iEvent = eventCell(i, idx, time)
      const vEvent = eventCell(v, idx, time)
      const mEvent = eventCell(m, idx, time)
      const timeHeader = `<th style="vertical-align: top;${time !== '' ? 'border-top: 2px dotted var(--border-color);' : ''}">${time}</th>`

      return `<tr style="height: 4rem;">${dateHeader}${iEvent}${filler(time)}${vEvent}${filler(time)}${mEvent}${timeHeader}</tr>`
    })

    this.container.element.querySelector('tbody').innerHTML = rows.join('\n')
    if (!!this.onNavigation) this.container.element.querySelectorAll('img.thumbnail').forEach(avatar => avatar.addEventListener('click', ({target}) => {
      this.onNavigation(target.getAttribute('data-id'))
    }))
  }

  link = ({room, code}, speaker) => {
    const list = this._events[room]
    const index = list.findIndex(e => e.code === code)
    if (index === -1) return

    const event = list[index]

    const updated = { ...event, speakers: [ ...(event.speakers || []), speaker ]}
    this._events = { ...this._events, [room]: [ ...list.slice(0, index), updated, ...list.slice(index + 1)] }
  }
}

export default Schedule