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
        return m.reply("📁 Folder kosong. Belum ada file tersimpan.");
      }

      
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file);
          const stat = await fs.stat(filePath);
          return {
            name: file,
            size: stat.size,
            modified: stat.mtime,
            isFile: stat.isFile()
          };
        })
      );

      const validFiles = fileStats.filter(f => f.isFile);
      

      let message = `📂 *DAFTAR FILE SCRAPE*\n`;
      message += `┌  📁 Total: ${validFiles.length} file\n`;
      message += `│\n`;
      
      validFiles.sort((a, b) => b.modified - a.modified).forEach((file, i) => {
        const size = file.size < 1024 
          ? `${file.size} B` 
          : file.size < 1048576 
          ? `${(file.size / 1024).toFixed(2)} KB`
          : `${(file.size / 1048576).toFixed(2)} MB`;
        
        const date = file.modified.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        message += `│  ${i + 1}. 📄 ${file.name}\n`;
        message += `│     📦 ${size} • 🕐 ${date}\n`;
      });
      
      message += `│\n`;
      message += `└  Gunakan *.getscrape <nama_file>* untuk mengambil`;
      
      await m.reply(message);

    } catch (e) {
      console.error("[LISTSCRAPE ERROR]", e);
      m.reply(`❌ Gagal: ${e.message}`);
    }
  }
}