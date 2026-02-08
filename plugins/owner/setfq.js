/** @type {import('#lib/types.js').Plugin} */
import { setFQ } from '#lib/fakeQuoted.js'

export default {
  name: "setfq",
  category: "owner",
  command: ["setfq"],

  settings: { owner: false },

  run: async (conn, m) => {
    if (!m.text) return m.reply("Contoh: .setfq kontak")

    setFQ(m.chat, m.text.toLowerCase())
    m.reply(`FQ default di chat ini diubah ke: ${m.text}`)
  }
}