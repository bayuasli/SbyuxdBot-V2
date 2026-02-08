import fs from 'fs'

const dbPath = './database/fq_settings.json'

function loadDB() {

  if (!fs.existsSync(dbPath)) return {}

  return JSON.parse(fs.readFileSync(dbPath))

}

function saveDB(db) {

  fs.mkdirSync('./database', { recursive: true })

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

}

export function setFQ(chat, type) {

  const db = loadDB()

  db[chat] = type

  saveDB(db)

}

export function getFQ(chat) {

  const db = loadDB()

  return db[chat] || null

}

export function buildFQ(type, pushname = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱") {

  const ownername = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱"

  const map = {

    kontak: {

      contactMessage: {

        displayName: ownername,

        vcard: `BEGIN:VCARD

VERSION:3.0

N:XL;${ownername},;;;

FN:${ownername}

item1.TEL;waid=628895307489:628895307489

item1.X-ABLabel:Mobile

END:VCARD`

      }

    },

    order: {

      orderMessage: {

        productId: "8569472943180260",

        currencyCode: "IDR",

        priceAmount1000: "91000",

        message: pushname,

        surface: ownername

      }

    }

    // bisa tambah type lain nanti

  }

  return map[type] || null

}

export async function sendFQ(conn, m, text) {

  const type = getFQ(m.chat)

  if (!type) return m.reply(text)

  const quoted = buildFQ(type)

  if (!quoted) return m.reply(text)

  await conn.relayMessage(m.chat, {

    extendedTextMessage: {

      text,

      contextInfo: {

        mentionedJid: [m.sender],

        forwardingScore: 999,

        isForwarded: true,

        quotedMessage: quoted,

        participant: "0@s.whatsapp.net",

        stanzaId: "BAE5C9E3C9A6C8D6"

      }

    }

  }, {})

}