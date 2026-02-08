import fs from 'fs'
import path from 'path'

export default {
  name: "tofile",
  category: "tools",
  command: ["tofile"],

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

      await conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(filePath),
          fileName: filename,
          mimetype: 'application/octet-stream'
        },
        { quoted: m }
      )

      fs.unlinkSync(filePath)

    } catch (err) {
      console.error(err)
      m.reply("Gagal buat file: " + err.message)
    }
  }
}