import fs from 'fs'
import path from 'path'

export default {
  name: "delfile",
  category: "owner",
  command: ["delfile", "df"],
  settings: {
    owner: true,
    loading: false
  },

  run: async (conn, m) => {
    if (!m.text) return m.reply("Contoh:\n.df ./lib/scrape/file.js")

    try {
      const inputPath = m.text.trim()

      const fullPath = path.isAbsolute(inputPath)
        ? inputPath
        : path.join(process.cwd(), inputPath)

      if (!fs.existsSync(fullPath)) {
        return m.reply("File tidak ditemukan.")
      }

      if (fs.lstatSync(fullPath).isDirectory()) {
        return m.reply("Itu folder, bukan file.")
      }

      fs.unlinkSync(fullPath)

      m.reply(`Berhasil hapus file:\n${inputPath}`)

    } catch (err) {
      console.error(err)
      m.reply("Gagal hapus file: " + err.message)
    }
  }
}