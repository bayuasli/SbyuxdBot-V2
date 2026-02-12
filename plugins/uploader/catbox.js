import fetch from "node-fetch"
import FormData from "form-data"
import { fileTypeFromBuffer } from "file-type"

/**
 * @type {import('#lib/types.js').Plugin}
 */
export default {
  name: "catbox",
  category: "uploader",
  command: ["upcb", "upcatbox", "tourlv2"],

  settings: {
    group: false,
    owner: false,
    botAdmin: false
  },

  run: async (conn, m, { quoted }) => {
    try {
      const q = quoted || m
      const mime = (q.msg || q).mimetype || ""

      if (!mime) return m.reply("Reply media yang ingin diupload.")

      const media = await q.download()

      const type = await fileTypeFromBuffer(media)
      if (!type?.ext) return m.reply("Format file tidak dikenali.")

      const form = new FormData()
      form.append("fileToUpload", media, `file.${type.ext}`)
      form.append("reqtype", "fileupload")

      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form
      })

      const url = await res.text()

      if (!url.startsWith("https"))
        return m.reply("Upload gagal.")

      const sizeMB = (media.length / 1024 / 1024).toFixed(2)

      const text = `successfully uploaded to catbox

url: ${url}
expired: No expiration
size: ${sizeMB} MB`

      await m.reply(text)

    } catch (err) {
      console.error(err)
      m.reply("Upload error.")
    }
  }
}