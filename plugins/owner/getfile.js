/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "getfile",
  category: "owner",
  command: ["getfile", "file", "gfile"],
  
  settings: {
    owner: true,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    const { text, args, command, sender } = m
    const { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin } = context
    
    if (!text) {
      await m.reply(`📁 *GET FILE*\n\nMasukkan nama file!\nContoh: .getfile case.js\n.getfile plugins/tools/sticker.js`)
      return
    }
    
    try {
      
      const fs = await import('fs')
      const path = await import('path')
      
      const filePath = path.join(process.cwd(), text.trim())
      
     
      if (!fs.existsSync(filePath)) {
        await m.reply(`❌ File "${text}" tidak ditemukan!\n\nPastikan path file benar.`)
        return
      }
      
     
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        
        const files = fs.readdirSync(filePath)
        const fileList = files
          .slice(0, 20)
          .map(f => {
            const fullPath = path.join(filePath, f)
            const isDir = fs.statSync(fullPath).isDirectory()
            return `${isDir ? '📁' : '📄'} ${f}`
          })
          .join('\n')
        
        const dirInfo = `📁 *DIRECTORY: ${path.basename(filePath)}*\n\n`
        let content = dirInfo + fileList
        if (files.length > 20) content += `\n\n📊 Total: ${files.length} item (menampilkan 20 pertama)`
        
        await m.reply(content)
        return
      }
      
      
      const fileName = path.basename(filePath)
      const fileExt = path.extname(filePath).toLowerCase()
      const fileSize = stat.size
      const modified = stat.mtime.toLocaleString('id-ID')
      
      
      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      }
      
      
      const mime = (await import('mime-types')).default
      const mimetype = mime.lookup(filePath) || 'application/octet-stream'
      
      
      const maxSize = 100 * 1024 * 1024
      if (fileSize > maxSize) {
        await m.reply(`❌ File terlalu besar!\n\nUkuran: ${formatBytes(fileSize)}\nMaksimal: ${formatBytes(maxSize)}`)
        return
      }
      
      
      const linesCount = await countFileLines(filePath)
      
      
      const fileInfo = `
📄 *FILE INFORMATION*

🔹 *Nama:* ${fileName}
🔹 *Path:* \`${text}\`
🔹 *Ukuran:* ${formatBytes(fileSize)}
🔹 *Tipe:* ${mimetype}
🔹 *Extensi:* ${fileExt || 'unknown'}
🔹 *Diubah:* ${modified}
🔹 *Line:* ${linesCount} baris

⏳ Mengirim file...
      `.trim()
      
      await m.reply(fileInfo)
      
      
      const fileBuffer = fs.readFileSync(filePath)
      
      
      await conn.sendMessage(sender, {
        document: fileBuffer,
        fileName: fileName,
        mimetype: mimetype,
        caption: `📁 ${fileName}\n📦 ${formatBytes(fileSize)}\n👤 Request by: @${sender.split('@')[0]}\n⏰ ${new Date().toLocaleTimeString('id-ID')}`
      }, { quoted: m })
      
      
      if (m.chat !== sender) {
        await m.reply(`✅ File *${fileName}* berhasil dikirim ke private chat!`)
      }
      
    } catch (error) {
      console.error('[GETFILE ERROR]', error)
      await m.reply(`❌ Gagal mengambil file!\n\nError: ${error.message}`)
    }
  }
}


async function countFileLines(filePath) {
  try {
    const fs = await import('fs')
    const content = fs.readFileSync(filePath, 'utf8')
    return content.split('\n').length
  } catch {
    return 'N/A'
  }
}