/** @type {import('#lib/types.js').Plugin} */
import fs from "fs/promises"
import path from "path"

export default {
  name: "delscrape",
  category: "owner",
  command: ["delscrape", "delscr", "rmscr"],
  alias: ["dscr", "rmscr", "hapusscr"],
  
  settings: {
    owner: true
  },

  run: async (conn, m) => {
    try {
      if (!m.args[0]) {
        return m.reply("⚠️ Masukkan nama file!\nContoh: *.delscrape getpastebin.js*\nAtau: *.delscrape --all*");
      }

      const folderPath = path.resolve("./lib/scrape");
      
      
      if (m.args[0] === "--all" || m.args[0] === "-a") {
        const confirm = m.args[1] === "--force" || m.args[1] === "-f";
        
        if (!confirm) {
          return m.reply("⚠️ *PERINGATAN!*\nAnda akan menghapus SEMUA file di folder scrape.\nKetik: *.delscrape --all --force* untuk konfirmasi.");
        }

        const files = await fs.readdir(folderPath);
        let deleted = 0;
        let failed = 0;

        for (const file of files) {
          try {
            const filePath = path.join(folderPath, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              await fs.unlink(filePath);
              deleted++;
            }
          } catch {
            failed++;
          }
        }

        return m.reply(`✅ Berhasil menghapus ${deleted} file.\n❌ Gagal: ${failed} file.`);
      }

      
      const fileName = m.args[0];
      const filePath = path.join(folderPath, fileName);

      
      try {
        await fs.access(filePath);
      } catch {
        return m.reply(`❌ File *${fileName}* tidak ditemukan.\nGunakan *.listscrape* untuk lihat daftar file.`);
      }

      const stat = await fs.stat(filePath);
      const size = stat.size < 1024 
        ? `${stat.size} B` 
        : stat.size < 1048576 
        ? `${(stat.size / 1024).toFixed(2)} KB`
        : `${(stat.size / 1048576).toFixed(2)} MB`;

      
      if (m.args[1] !== "--force" && m.args[1] !== "-f") {
        return m.reply(`⚠️ Yakin ingin menghapus *${fileName}* (${size})?\nKetik: *.delscrape ${fileName} --force*`);
      }

      await fs.unlink(filePath);
      m.reply(`✅ File *${fileName}* berhasil dihapus.\n📦 Size: ${size}`);

    } catch (e) {
      console.error("[DELSCRAPE ERROR]", e);
      m.reply(`❌ Gagal: ${e.message}`);
    }
  }
}