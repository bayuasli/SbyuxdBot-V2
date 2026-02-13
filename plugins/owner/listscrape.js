/** @type {import('#lib/types.js').Plugin} */
import fs from "fs/promises"
import path from "path"

export default {
  name: "listscrape",
  category: "owner",
  command: ["listscrape", "lsscr", "lists"],
  alias: ["lss", "files"],
  
  settings: {
    owner: true
  },

  run: async (conn, m) => {
    try {
      const folderPath = path.resolve("./lib/scrape");
      
      try {
        await fs.access(folderPath);
      } catch {
        return m.reply("📁 Folder `./lib/scrape/` belum ada.");
      }

      const files = await fs.readdir(folderPath);
      
      if (files.length === 0) {
        return m.reply("📁 Folder kosong.");
      }

      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file);
          const stat = await fs.stat(filePath);
          return {
            name: file,
            isFile: stat.isFile()
          };
        })
      );

      const validFiles = fileStats.filter(f => f.isFile).map(f => f.name);
      
      let message = `📂 *LIST SCRAPE*\n`;
      message += `┌  Total: ${validFiles.length} file\n`;
      message += `│\n`;
      
      validFiles.sort().forEach((file, i) => {
        message += `│  ${i + 1}. ${file}\n`;
      });
      
      message += `│\n`;
      message += `└  Mau ambil scrape ketik *.getscrape [nama.js]*`;
      
      await m.reply(message);

    } catch (e) {
      console.error("[LISTSCRAPE ERROR]", e);
      m.reply(`❌ Gagal: ${e.message}`);
    }
  }
}