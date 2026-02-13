/** @type {import('#lib/types.js').Plugin} */
import fs from "fs/promises"
import path from "path"

export default {
  name: "getscrape",
  category: "owner",
  command: ["getscrape", "gs"],

  settings: {
    owner: true
  },

  run: async (conn, m) => {
    try {
      const name = m.args?.[0]
      if (!name) return m.reply("Contoh: .getscrape getpastebin")

      const folderPath = path.resolve("./lib/scrape")
      const fileName = name.endsWith(".js") ? name : name + ".js"
      const filePath = path.join(folderPath, fileName)

      await fs.access(filePath).catch(() => {
        throw new Error("File tidak ditemukan")
      })

      const fileBuffer = await fs.readFile(filePath)

      await conn.sendMessage(
        m.chat,
        {
          document: fileBuffer,
          mimetype: "application/javascript",
          fileName
        },
        { quoted: m }
      )

    } catch (e) {
      m.reply("Gagal: " + e.message)
    }
  }
}