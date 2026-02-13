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

  run: async (conn, m, { args }) => {
    try {
      const folderPath = path.resolve("./lib/scrape")
      const files = (await fs.readdir(folderPath)).filter(v => v.endsWith(".js"))

      if (!files.length) {
        return m.reply("Folder scraper kosong.")
      }

      if (!args[0]) {
        const list = files
          .map((v, i) => `${i + 1}. ${v.replace(".js", "")}`)
          .join("\n")

        return m.reply(`Pilih nomor file:\n\n${list}`)
      }

      const index = parseInt(args[0]) - 1
      if (isNaN(index) || index < 0 || index >= files.length) {
        const list = files
          .map((v, i) => `${i + 1}. ${v.replace(".js", "")}`)
          .join("\n")

        return m.reply(`Nomor tidak valid.\n\n${list}`)
      }

      const fileName = files[index]
      const filePath = path.join(folderPath, fileName)
      const fileBuffer = await fs.readFile(filePath)

      await conn.sendMessage(m.chat, {
        document: fileBuffer,
        mimetype: "application/javascript",
        fileName
      })

    } catch (e) {
      m.reply("Gagal: " + e.message)
    }
  }
}