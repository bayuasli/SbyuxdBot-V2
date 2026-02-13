/** @type {import('#lib/types.js').Plugin} */
import fs from "fs"
import path from "path"

export default {
  name: "totalfiturp",
  category: "info",
  command: ["totalfitur", "ttfp", "totalplugin"],
  alias: ["tf", "ftr"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      // Path ke folder plugins (case sensitive!)
      const pluginDir = path.join(process.cwd(), "./plugins")
      
      // Cek folder exist
      if (!fs.existsSync(pluginDir)) {
        return m.reply("❌ Folder `plugins` tidak ditemukan.")
      }

      // Baca semua file .js dari folder plugins dan subfolders
      const getAllFiles = (dir) => {
        let results = []
        const list = fs.readdirSync(dir)
        
        list.forEach(file => {
          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)
          
          if (stat.isDirectory()) {
            // Recursive untuk subfolder
            results = results.concat(getAllFiles(filePath))
          } else if (file.endsWith('.js') && file !== 'loadPlugins.js') {
            results.push(filePath)
          }
        })
        
        return results
      }

      const pluginFiles = getAllFiles(pluginDir)
      
      if (pluginFiles.length === 0) {
        return m.reply("📁 Tidak ada plugin ditemukan.")
      }

      // Kategorisasi plugin
      let kategori = {
        "total": pluginFiles.length
      }
      
      let categoryCount = {}
      let commandList = []

      for (let filePath of pluginFiles) {
        try {
          const plugin = (await import(filePath)).default
          
          if (plugin) {
            // Hitung per kategori
            const category = plugin.category || "uncategorized"
            categoryCount[category] = (categoryCount[category] || 0) + 1
            
            // Kumpulkan command
            if (plugin.command) {
              const cmds = Array.isArray(plugin.command) 
                ? plugin.command 
                : [plugin.command]
              commandList.push(...cmds)
            }
            
            // Kategorisasi per tag (jika ada)
            if (plugin.tags) {
              const tags = Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags]
              tags.forEach(tag => {
                kategori[tag] = (kategori[tag] || 0) + 1
              })
            } else {
              // Default ke category
              const cat = plugin.category || "no-category"
              kategori[cat] = (kategori[cat] || 0) + 1
            }
          }
        } catch (e) {
          console.error(`Error loading plugin: ${filePath}`, e)
        }
      }

      // ===== FORMAT PESAN TEXT =====
      let message = `📊 *STATISTIK FITUR BOT*\n\n`
      message += `📁 *Total Plugin:* ${pluginFiles.length}\n`
      message += `🔧 *Total Command:* ${commandList.length}\n`
      message += `📂 *Total Kategori:* ${Object.keys(categoryCount).length}\n\n`
      
      message += `┌  *DISTRIBUSI PER KATEGORI*\n`
      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count], i) => {
          const persen = ((count / pluginFiles.length) * 100).toFixed(1)
          const bar = '█'.repeat(Math.floor(count / pluginFiles.length * 20)) || '░'
          message += `│  ${i + 1}. *${cat}*\n`
          message += `│     📦 ${count} plugin • ${persen}%\n`
        })
      message += `└\n\n`

      message += `┌  *DISTRIBUSI PER TAG*\n`
      const sortedTags = Object.entries(kategori)
        .filter(([key]) => key !== 'total')
        .sort((a, b) => b[1] - a[1])
      
      if (sortedTags.length > 0) {
        sortedTags.slice(0, 10).forEach(([tag, count], i) => {
          message += `│  ${i + 1}. #${tag}: ${count} plugin\n`
        })
        if (sortedTags.length > 10) {
          message += `│  ...dan ${sortedTags.length - 10} tag lainnya\n`
        }
      } else {
        message += `│  Tidak ada tag\n`
      }
      message += `└\n\n`

      message += `📌 *Contoh Command:*\n`
      const sampleCmds = commandList.slice(0, 5).map(cmd => `• ${cmd}`).join('\n')
      message += sampleCmds || '• Tidak ada command'
      
      // Kirim sebagai text message
      await m.reply(message)

      /* 
      // ===== ALTERNATIF: POLL MESSAGE =====
      // Hanya aktifkan jika polling message didukung
      
      const pollVotes = Object.entries(categoryCount).map(([tag, count]) => ({
        optionName: `${tag} (${count})`,
        optionVoteCount: count
      }))

      await conn.sendMessage(m.chat, {
        poll: {
          name: `📊 TOTAL FITUR BOT\nTotal: ${pluginFiles.length} Plugin`,
          values: pollVotes.map(v => v.optionName),
          selectableCount: 1
        }
      }, { quoted: m })
      */

    } catch (err) {
      console.error("[TOTALFITUR ERROR]", err)
      m.reply(`❌ Terjadi kesalahan: ${err.message}`)
    }
  }
}