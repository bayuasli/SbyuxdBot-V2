import fs from 'fs'
import path from 'path'

export default {
  name: "modfile",
  category: "owner",
  command: ["mod"],
  settings: {
    owner: true,
    loading: false
  },

  run: async (conn, m) => {
    if (!m.isQuoted) return sendFQ(conn, m, "Reply kode yang mau disimpan.")
    if (!m.text) return sendFQ(conn, m, "Contoh: .mod lib/function.js")

    try {
      const filePathInput = m.text.trim()

      
      const cleanPath = filePathInput.replace(/^\.?\//, '')
      const absolutePath = path.join(process.cwd(), cleanPath)

      const code = m.quoted.text || m.quoted.body || ''
      if (!code) return sendFQ(conn, m, "Isi kode kosong.")

      
      const dir = path.dirname(absolutePath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

      
      fs.writeFileSync(absolutePath, code)

      sendFQ(conn, m, `✅ File berhasil diupdate:\n${cleanPath}`)

    } catch (e) {
      sendFQ(conn, m, "❌ Error:\n" + e.message)
    }
  }
}