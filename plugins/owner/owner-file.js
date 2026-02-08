import fs from 'fs'
import path from 'path'

export default {
  name: "owner-file",
  category: "owner",
  command: ["setfile","setjs","upfile"],
  settings: { owner: true },

  run: async (conn, m) => {
    const cmd = m.command

    // ================= SETFILE =================
    if (cmd === "setfile" || cmd === "setjs") {
      if (!m.text.includes('|')) return m.reply("Format:\n.setfile path|isi file")

      const [rawPath, ...contentArr] = m.text.split('|')
      const content = contentArr.join('|').trim()
      if (!content) return m.reply("Isi file kosong")

      const safePath = path.resolve(rawPath.trim())
      fs.mkdirSync(path.dirname(safePath), { recursive: true })

      fs.writeFileSync(safePath, content)
      return m.reply(`✅ File berhasil disimpan\n📂 ${safePath}`)
    }

    // ================= UPFILE =================
    if (cmd === "upfile") {
      if (!m.isQuoted || !m.quoted.isMedia)
        return m.reply("Reply media + ketik:\n.upfile ./lib/namafile.mp3")

      if (!m.text) return m.reply("Masukkan path penyimpanan.\nContoh: .upfile ./lib/sound.mp3")

      const rawPath = m.text.trim()
      const safePath = path.resolve(rawPath)

      fs.mkdirSync(path.dirname(safePath), { recursive: true })

      const buffer = await m.quoted.download()
      fs.writeFileSync(safePath, buffer)

      return m.reply(`✅ File upload berhasil\n📂 ${safePath}`)
    }
  }
}