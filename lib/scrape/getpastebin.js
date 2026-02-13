import axios from 'axios'
import https from 'https'

async function scrapeAllSimpleRecent() {
  const agent = new https.Agent({ rejectUnauthorized: false })
  const res = await axios.get('https://pastebin.allsimple.net/api/recent', { httpsAgent: agent })
    .catch(() => ({ data: [] }))
  return Array.isArray(res.data) ? res.data : []
}

async function scrapeAllSimplePaste(pasteId) {
  const agent = new https.Agent({ rejectUnauthorized: false })
  const url = `https://pastebin.allsimple.net/api/paste/${pasteId}`
  const res = await axios.get(url, { httpsAgent: agent })
    .catch(() => ({ data: null }))
  return res.data
}

async function scrapeAllSimpleTrending() {
  const agent = new https.Agent({ rejectUnauthorized: false })
  const res = await axios.get('https://pastebin.allsimple.net/api/trending', { httpsAgent: agent })
    .catch(() => ({ data: [] }))
  return Array.isArray(res.data) ? res.data : []
}

function rupiahin(num) {
  const a = String(num).split('').reverse()
  for (let i = 0; i < a.length; i++) {
    if ((i + 1) % 3 === 0 && i !== a.length - 1) a[i] = '.' + a[i]
  }
  return a.reverse().join('')
}

export {
  scrapeAllSimpleRecent,
  scrapeAllSimpleTrending,
  scrapeAllSimplePaste,
  rupiahin
}