/** @type {import('#lib/types.js').Plugin} */
import fs from 'fs'
import path from 'path'

export default {
  name: "sendcmd",
  category: "owner",
  command: ["sendcmd", "scmd"],

  settings: {
    owner: true,
    loading: false
  },

  run: async (conn, m) => {
    if (!m.text.includes('|')) {
      return m.reply("Format salah.\nContoh:\n.sendcmd downloader/gitclone|628xxxx")
    }

    const [input, number] = m.text.split('|').map(v => v.trim())
    if (!input || !number) return m.reply("Kategori/file atau nomor tidak valid.")

    const pluginPath = path.join(process.cwd(), 'plugins', input + '.js')

    if (!fs.existsSync(pluginPath)) {
      return m.reply("Plugin tidak ditemukan.")
    }

    const code = fs.readFileSync(pluginPath, 'utf8')
    const jid = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    await conn.sendMessage(jid, { text: code })
    m.reply("Berhasil dikirim.")
  }
}