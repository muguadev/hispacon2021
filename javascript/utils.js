const HTML_ENTITIES = {
  "!": 'excl', "\"": 'quot', "#": 'num', "$": 'dollar', "%": 'percent', "&": 'amp', "'": 'apos', "©": 'copy', "ª": 'ordf', "«": 'laquo', "®": 'reg', "º": 'ordm', "»": 'raquo',
  "¿": 'iquest', "À": 'Agrave', "Á": 'Aacute', "Â": 'Acirc', "Ã": 'Atilde', "Ä": 'Auml', "Ç": 'Ccedil', "È": 'Egrave', "É": 'Eacute', "Ê": 'Ecirc', "Ë": 'Euml', "Ì": 'Igrave',
  "Í": 'Iacute', "Î": 'Icirc', "Ï": 'Iuml', "Ñ": 'Ntilde', "Ò": 'Ograve', "Ó": 'Oacute', "Ô": 'Ocirc', "Õ": 'Otilde', "Ö": 'Ouml', "Ù": 'Ugrave', "Ú": 'Uacute', "Û": 'Ucirc',
  "Ü": 'Uuml', "Ý": 'Yacute', "à": 'agrave', "á": 'aacute', "â": 'acirc', "ã": 'atilde', "ä": 'auml', "ç": 'ccedil', "è": 'egrave', "é": 'eacute', "ê": 'ecirc', "ê": 'euml',
  "ì": 'igrave', "í": 'iacute', "î": 'icirc', "ï": 'iuml', "ñ": 'ntilde', "ò": 'ograve', "ó": 'oacute', "ô": 'ocirc', "õ": 'otilde', "ö": 'ouml', "ù": 'ugrave', "ú": 'uacute',
  "û": 'ucirc', "ü": 'uuml', "ý": 'yacute', "ÿ": 'yuml', "?": 'quest', "¡": 'iexcl', "|": 'brvbar', "—": 'mdash', "…": 'hellip', "Π": 'Pi', "π": 'pi'
}

export const htmlEncode = text => text.replace(/./g, m => HTML_ENTITIES[m] ? `&${HTML_ENTITIES[m]};` : m)

const HEADERS = new Headers().append('Content-Type', 'text-plain; charset=UTF-8')
const DECODER = new TextDecoder('windows-1252')

export const loadExcelFile = async (filename) => {
  const csv = await fetch(filename, HEADERS)
    .then(response => response.arrayBuffer())
    .then(buffer => DECODER.decode(buffer))

  return csv.split('\r\n').map(row => row.split('\t'))
}

export const imgSource = image => `images/speakers/${image !== "" ? `pictures/${image}` : 'filler.png'}`

export const loadHtml = async (filename) => await fetch(filename).then(response => response.text())

export const loadText = async (filename) => {
  const text = await fetch(filename).then(response => response.text())
  return htmlEncode(text)
}

export const paragraphs = text => text.replaceAll('\r', '').split('\n').reduce((all, paragraph) => {
  if (paragraph === "") return all
  return `${all}<p>${paragraph}</p>`
}, '')
