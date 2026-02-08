import fetch from "node-fetch"
import FormData from "form-data"

export default {
  name: "tourl",
  category: "uploader",
  command: ["tourl"],

  run: async (conn, m) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ""

    if (!mime)
      return m.reply("Reply atau kirim media dengan caption .tourl")

    if (/webp/.test(mime))
      return m.reply("File .webp tidak didukung.")

    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    try {
      const media = await q.download?.()
      if (!media) return m.reply("Gagal mengambil media.")

      const sizeKB = (media.length / 1024).toFixed(2)
      const sizeMB = (media.length / (1024 * 1024)).toFixed(2)
      const fileSize = sizeMB >= 1 ? `${sizeMB} MB` : `${sizeKB} KB`

      const form = new FormData()
      form.append("reqtype", "fileupload")

      let ext = mime.split("/")[1] || ""
      if (ext) ext = "." + ext
      form.append("fileToUpload", media, `file${ext}`)

      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form
      })

      const url = (await res.text()).trim()

      await conn.sendMessage(m.chat, {
        text: `URL: ${url}\nUkuran: ${fileSize}`
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    } catch (e) {
      console.error(e)
      m.reply("Gagal upload file.")
    }
  },
}