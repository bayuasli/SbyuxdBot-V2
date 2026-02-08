/** @type {import('#lib/types.js').Plugin} */
import fetch from 'node-fetch'

export default {
  name: "translate",
  category: "tools",
  command: ["tr", "translate"],

  run: async (conn, m, { quoted }) => {
    let [lang, ...rest] = m.args
    let text = rest.join(' ')

    if (quoted?.text && !text) text = quoted.text
    if (!lang || !text) return m.reply("Contoh: .tr en halo dunia")

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    try {
      const url = new URL("https://translate.googleapis.com/translate_a/single")
      url.searchParams.append("client", "gtx")
      url.searchParams.append("sl", "auto")
      url.searchParams.append("dt", "t")
      url.searchParams.append("tl", lang)
      url.searchParams.append("q", text)

      const res = await fetch(url.href)
      const data = await res.json()
      const hasil = data[0].map(v => v[0]).join("")

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
      m.reply(hasil)

    } catch {
      m.reply("Gagal translate")
    }
  }
}