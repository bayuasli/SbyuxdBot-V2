import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export default {
  name: "bp",
  category: "owner",
  command: ["bp"],
  settings: { owner: true },

  run: async (conn, m) => {
    try {
      const sessionPath = "./session"

      // Hapus file session selain creds.json
      if (fs.existsSync(sessionPath)) {
        const files = fs.readdirSync(sessionPath)
        for (const file of files) {
          if (file !== "creds.json") {
            const filePath = path.join(sessionPath, file)
            if (fs.lstatSync(filePath).isDirectory()) {
              fs.rmSync(filePath, { recursive: true, force: true })
            } else {
              fs.unlinkSync(filePath)
            }
          }
        }
      }

      // Ambil semua file kecuali yg tidak perlu
      const ls = execSync("ls")
        .toString()
        .split("\n")
        .filter(pe =>
          pe &&
          pe !== "node_modules" &&
          pe !== "package-lock.json" &&
          pe !== "yarn.lock" &&
          pe !== "tmp"
        )

      execSync(`zip -r backup.zip ${ls.join(" ")}`)

      await conn.sendMessage(m.chat, {
        document: fs.readFileSync("./backup.zip"),
        fileName: "SbyuXd-bxxBot.zip",
        mimetype: "application/zip",
        caption: "✅ Backup berhasil dibuat"
      }, { quoted: m })

      execSync("rm -rf backup.zip")

    } catch (err) {
      console.error("BACKUP ERROR:", err)
      m.reply("❌ Gagal membuat backup.")
    }
  }
}