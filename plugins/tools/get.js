/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "get",
  category: "tools",
  command: ["get"],
  alias: [],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, { quoted }) => {
    try {
      // ambil url dari arg atau reply
      let url = m.text || quoted?.text || quoted?.caption

      if (!url) return m.reply("Kirim / reply link yang mau diambil.")

      if (!/^https?:\/\//i.test(url)) {
        return m.reply("Link tidak valid.")
      }

      await conn.sendPresenceUpdate("composing", m.chat)

      const res = await fetch(url)

      const size = Number(res.headers.get("content-length")) || 0
      if (size > 100 * 1024 * 1024) {
        return m.reply(`File terlalu besar.\nSize: ${size} bytes`)
      }

      const type = res.headers.get("content-type") || ""

      if (type.startsWith("image/")) {
        return conn.sendMessage(m.chat, {
          image: { url }
        }, { quoted: m })
      }

      if (type.startsWith("video/")) {
        return conn.sendMessage(m.chat, {
          video: { url }
        }, { quoted: m })
      }

      if (type.startsWith("audio/")) {
        return conn.sendMessage(m.chat, {
          audio: { url },
          mimetype: "audio/mpeg",
          ptt: true
        }, { quoted: m })
      }

      let buffer = await res.arrayBuffer()
      let text = Buffer.from(buffer).toString()

      try {
        text = JSON.stringify(JSON.parse(text), null, 2)
      } catch {}

      return m.reply(text.slice(0, 65536))

    } catch (err) {
      console.error(err)
      return m.reply("Gagal mengambil data.")
    }
  }
}