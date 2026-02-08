/** @type {import('#lib/types.js').Plugin} */
import axios from "axios"

export default {
  name: "shortlink",
  category: "tools",
  command: ["shortlink", "tinyurl"],

  settings: { loading: true },

  run: async (conn, m) => {

    const text = m.body.replace(m.prefix + m.command, '').trim()

    if (!text)
      return m.reply("❌ Kirim link yang mau di-short!\nContoh: .shortlink https://google.com")

    try {
      const { data } = await axios.get(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`
      )

      m.reply(`✅ Shortlink berhasil dibuat:\n${data}`)

    } catch (e) {
      m.reply("❌ Gagal membuat shortlink: " + e.message)
    }
  }
}