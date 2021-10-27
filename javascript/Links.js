import { LINKS } from "../data/participacion.js"

export const getLinks = () => {
  const [_header, ...rows] = LINKS.split('\n')
  return rows.map(l => l.split('\t'))
}

export const applyLinks = (links, schedule, speakers) => {
  const events = schedule.events
  const roster = speakers.roster
  
  links.forEach(r => {
    if (r[0] === '') return
    const [ eventId, _title, speakerId, _name, _surname, _alias, role ] = r
    const event = events.find(({code}) => code === eventId)
    const speaker = roster.find(({ code }) => code === speakerId)
    speakers.link(event, speakerId)
    schedule.link(event, speaker)
  })
}
