/** @type {import('#lib/types.js').Plugin} */
import fs from "fs/promises"
import path from "path"

export default {
  name: "savescrape",
  category: "owner",
  command: ["savescrape", "addscr", "svscr"],
  alias: ["sscrape", "addskrep"],
  
  settings: {
    owner: true
  },

  run: async (conn, m, context) => {
    const { quoted } = context;
    
    try {
      
      if (!m.isQuoted && !m.args.length) {
        return m.reply(`⚠️ *Cara penggunaan:*\n` +
          `1. Reply file/media\n` +
          `2. Reply teks/code: *.svscr nama_file.js*\n` +
          `3. Tulis langsung: *.svscr nama_file.js isi kode*`);
      }

      const folderPath = path.resolve("./lib/scrape");
      await fs.mkdir(folderPath, { recursive: true });


      if (m.isQuoted && quoted.isMedia) {
        const buffer = await quoted.download();
        const fileName = quoted.msg?.fileName || `${Date.now()}.${quoted.msg?.mimetype?.split('/')[1] || 'bin'}`;
        const filePath = path.join(folderPath, fileName);
        
        await fs.writeFile(filePath, buffer);
        return m.reply(`✅ Media tersimpan: ${fileName}\n📁 Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      }
      

      if (m.isQuoted && !quoted.isMedia && m.args[0]) {
        const fileName = m.args[0];
        const content = quoted.body || quoted.text; 
        const filePath = path.join(folderPath, fileName);
        
        await fs.writeFile(filePath, content);
        return m.reply(`✅ Kode tersimpan: ${fileName}\n📁 Path: ${filePath}\n📝 Length: ${content.length} chars`);
      }


      if (!m.isQuoted && m.args.length >= 2) {
        const fileName = m.args[0];
        const content = m.args.slice(1).join(" ");
        const filePath = path.join(folderPath, fileName);
        
        await fs.writeFile(filePath, content);
        return m.reply(`✅ Kode tersimpan: ${fileName}\n📁 Path: ${filePath}`);
      }
      
    } catch (e) {
      console.error("[SAVESCRAPE ERROR]", e);
      m.reply(`❌ Gagal: ${e.message}`);
    }
  }
}