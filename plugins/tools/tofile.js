import fs from 'fs'
import path from 'path'

export default {
  name: "tofile",
  category: "tools",
  command: ["tofile", "tf"],
  alias: ["txt2file", "code2file"],
  
  settings: {
    owner: false,
    loading: true
  },

  run: async (conn, m) => {
    if (!m.quoted) return m.reply("Reply teks/kode dulu")
    if (!m.text) return m.reply("Contoh: .tofile test.js")

    const filename = m.text.trim()
    if (!filename.includes('.')) return m.reply("Nama file harus ada extensi")

    const code = m.quoted.text || m.quoted.body || ''
    if (!code) return m.reply("Teks kosong")

    const tmpDir = path.join(process.cwd(), 'tmp')
    const filePath = path.join(tmpDir, filename)

    try {
      fs.mkdirSync(tmpDir, { recursive: true })
      fs.writeFileSync(filePath, code)

      const ext = path.extname(filename).toLowerCase()
      let mimetype = 'text/plain'
      
      const mimeMap = {
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.cjs': 'application/javascript',
        '.ts': 'application/typescript',
        '.py': 'text/x-python',
        '.java': 'text/x-java',
        '.cpp': 'text/x-cpp',
        '.c': 'text/x-c',
        '.h': 'text/x-c',
        '.html': 'text/html',
        '.htm': 'text/html',
        '.css': 'text/css',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
        '.sh': 'application/x-shellscript',
        '.bat': 'application/x-bat',
        '.ps1': 'application/x-powershell',
        '.php': 'application/x-php',
        '.rb': 'application/x-ruby',
        '.go': 'text/x-go',
        '.rs': 'text/x-rust',
        '.swift': 'text/x-swift',
        '.kt': 'text/x-kotlin',
        '.sql': 'application/sql',
        '.yml': 'application/x-yaml',
        '.yaml': 'application/x-yaml',
        '.ini': 'text/x-properties',
        '.cfg': 'text/x-properties',
        '.conf': 'text/x-properties',
        '.log': 'text/plain',
        '.csv': 'text/csv',
        '.svg': 'image/svg+xml'
      }

      mimetype = mimeMap[ext] || 'text/plain'

      await conn.sendMessage(m.chat, {
        document: fs.readFileSync(filePath),
        fileName: filename,
        mimetype: mimetype
      }, { quoted: m })

      fs.unlinkSync(filePath)

    } catch (err) {
      console.error(err)
      m.reply("Gagal buat file: " + err.message)
    }
  }
}