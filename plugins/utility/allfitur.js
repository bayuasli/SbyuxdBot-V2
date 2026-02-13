/** @type {import('#lib/types.js').Plugin} */
import fs from "fs/promises"
import path from "path"

async function countJS(dir) {
  let total = 0
  const list = await fs.readdir(dir, { withFileTypes: true })

  for (let file of list) {
    const fullPath = path.join(dir, file.name)
    if (file.isDirectory()) {
      total += await countJS(fullPath)
    } else if (file.name.endsWith(".js")) {
      total++
    }
  }

  return total
}

export default {
  name: "allfitur",
  category: "utility",
  command: ["allfitur", "listfitur"],

  run: async (conn, m) => {
    try {
      const pluginPath = path.resolve("./plugins")
      const scrapePath = path.resolve("./lib/scrape")

      let totalPlugin = 0
      let totalScrape = 0

      try {
        totalPlugin = await countJS(pluginPath)
      } catch {}

      try {
        const files = await fs.readdir(scrapePath)
        totalScrape = files.filter(v => v.endsWith(".js")).length
      } catch {}

      const totalAll = totalPlugin + totalScrape

      m.reply(
`📦 *TOTAL FITUR BOT*

🔌 Total Plugin : ${totalPlugin}
🧪 Total Scrape : ${totalScrape}
✨ Total Semua  : ${totalAll}`
      )

    } catch (e) {
      m.reply("Error: " + e.message)
    }
  }
}