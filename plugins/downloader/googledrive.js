import axios from "axios"

export default {
  name: "gdrive",
  category: "downloader",
  command: ["googledrivedl", "gdrive", "gdv"],

  async run(conn, m, { text }) {
    if (!text) return m.reply("Contoh:\n.gdrive https://drive.google.com/file/d/xxxx/view")

    try {
      const res = await drivedl(text)

      // 📁 FOLDER
      if (res.type === "folder") {
        let caption = `📁 *GOOGLE DRIVE FOLDER*\n\n`
        caption += `*Nama:* ${res.details.name}\n`
        caption += `*Total File:* ${res.details.totalFiles}\n`
        caption += `*Dibuat:* ${res.details.createdTime}\n\n`

        res.contents.slice(0, 10).forEach((f, i) => {
          caption += `${i + 1}. ${f.name} (${f.size})\n`
        })

        if (res.contents.length > 10) {
          caption += `\nDan ${res.contents.length - 10} file lainnya...`
        }

        return m.reply(caption)
      }

      // 📄 FILE
      const info = res.details
      let caption = `📄 *GOOGLE DRIVE FILE*\n\n`
      caption += `*Nama:* ${info.name}\n`
      caption += `*Ukuran:* ${info.size}\n`
      caption += `*Tipe:* ${info.mimeType}\n`
      caption += `*Dibuat:* ${info.createdTime}\n`

      await conn.sendMessage(m.chat, {
        document: { url: res.downloadUrl },
        fileName: info.name,
        mimetype: info.mimeType,
        caption
      }, { quoted: m })

    } catch (e) {
      m.reply("❌ Gagal ambil file:\n" + e.message)
    }
  }
}


async function drivedl(url) {
  const API_KEY = "AIzaSyAA9ERw-9LZVEohRYtCWka_TQc6oXmvcVU" // API langsung

  const extractFileId = (driveUrl) => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]+)$/
    ]
    for (const p of patterns) {
      const m = driveUrl.match(p)
      if (m) return m[1]
    }
    return null
  }

  const fileId = extractFileId(url)
  if (!fileId) throw new Error("URL Google Drive tidak valid")

  const { data: metadata } = await axios.get(
    `https://www.googleapis.com/drive/v3/files/${fileId}?key=${API_KEY}&fields=id,name,mimeType,size,webContentLink,createdTime`
  )

  // 📁 Kalau folder
  if (metadata.mimeType === "application/vnd.google-apps.folder") {
    const { data: list } = await axios.get(
      `https://www.googleapis.com/drive/v3/files?key=${API_KEY}&q='${fileId}'+in+parents&fields=files(id,name,mimeType,size,createdTime)`
    )

    return {
      type: "folder",
      details: {
        name: metadata.name,
        createdTime: metadata.createdTime,
        totalFiles: list.files.length
      },
      contents: list.files.map(f => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : "N/A",
        createdTime: f.createdTime,
        downloadUrl: `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`
      }))
    }
  }

  // 📄 Kalau file biasa
  return {
    type: "file",
    details: {
      id: metadata.id,
      name: metadata.name,
      mimeType: metadata.mimeType,
      size: metadata.size ? `${(metadata.size / 1024 / 1024).toFixed(2)} MB` : "N/A",
      createdTime: metadata.createdTime
    },
    downloadUrl: `https://www.googleapis.com/drive/v3/files/${metadata.id}?alt=media&key=${API_KEY}`
  }
}