import fetch from 'node-fetch'
import unzipper from 'unzipper'

export default {
  name: "cweb",
  category: "webdev",
  command: ["cweb"],

  run: async (conn, m) => {
    try {
      const args = m.body.split(' ').slice(1)
      const webNameRaw = args[0]
      if (!webNameRaw) return m.reply("Gunakan format: .cweb <NamaWeb>")

      const webName = webNameRaw.toLowerCase().replace(/[^a-z0-9-_]/g, "")
      const tokenVercel = "zHKYVR3KqE2DIGZKNdyNHHPA"

      const q = m.isQuoted ? m.quoted : null
      if (!q || !/zip|html/i.test((q.msg || q).mimetype || ''))
        return m.reply("Reply file *.zip* atau *.html*!")

      // cek domain sudah ada
      try {
        const check = await fetch(`https://${webName}.vercel.app`)
        if (check.status === 200)
          return m.reply(`Website *${webName}* sudah digunakan.`)
      } catch {}

      // download media
      let buffer = await conn.downloadMediaMessage(q).catch(() => null)
      if (!buffer) return m.reply("Gagal mendownload file.")

      const filesToUpload = []

      // ZIP
      if (q.msg.mimetype.includes("zip")) {
        const directory = await unzipper.Open.buffer(buffer)

        for (const file of directory.files) {
          if (file.type === "File") {
            const content = await file.buffer()
            filesToUpload.push({
              file: file.path.replace(/^\/+/g, ""),
              data: content.toString("base64"),
              encoding: "base64"
            })
          }
        }

        if (!filesToUpload.some(f => f.file.toLowerCase().endsWith("index.html")))
          return m.reply("index.html tidak ditemukan dalam ZIP.")
      }
      // HTML
      else {
        filesToUpload.push({
          file: "index.html",
          data: buffer.toString("base64"),
          encoding: "base64"
        })
      }

      const headers = {
        Authorization: `Bearer ${tokenVercel}`,
        "Content-Type": "application/json"
      }

      await fetch("https://api.vercel.com/v9/projects", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: webName })
      }).catch(() => {})

      const deploy = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: webName,
          project: webName,
          files: filesToUpload,
          projectSettings: { framework: null }
        })
      })

      const deployData = await deploy.json().catch(() => null)
      if (!deployData?.url)
        return m.reply(`Deploy gagal:\n${JSON.stringify(deployData)}`)

      const wurl = `https://${webName}.vercel.app`

      m.reply(`🌐 WEBSITE BERHASIL DIBUAT

📁 Project : *${webName}*
🔗 URL : ${wurl}
Status : ONLINE
Powered by Vercel`)

    } catch (e) {
      console.error("CWEB ERROR:", e)
      m.reply("❌ Terjadi error saat deploy web.")
    }
  }
}