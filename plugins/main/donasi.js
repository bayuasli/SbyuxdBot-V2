/** @type {import('#lib/types.js').Plugin} */
import fs from "fs"
import path from "path"

export default {
  name: "donasi",
  category: "main",
  command: ["donasi", "donate", "support"],
  alias: ["don", "saweria"],

  settings: {
    owner: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      const imagePath = path.resolve("./media/Sbyu-qr.jpg")

      if (!fs.existsSync(imagePath)) {
        return m.reply("File QR Code tidak ditemukan di ./media/Sbyu-qr.jpg")
      }

      const imageBuffer = fs.readFileSync(imagePath)

      const caption = `*— DONASI UNTUK BOT —*

Halo kak @${m.sender.split("@")[0]} 👋

Jika kamu suka dengan bot ini dan ingin mendukung agar tetap online, bisa donasi lewat:

╭─〘 *QRIS (Scan di atas)* 〙
│ • Scan QR code di atas
╰────

╭─〘 *Transfer Manual* 〙
│ • *DANA*: 08895307489
│ • *Sawria*: saweria.co/sibayuxd
│ • *A/n*: SbyuXd
╰────

💰 Berapapun nominalnya sangat berarti untuk maintain bot ini.

Terima kasih atas dukungannya 🙏
– *SbyuXd*`

      await conn.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption,
          mentions: [m.sender]
        },
        { quoted: m }
      )

    } catch (err) {
      m.reply("Error: " + err.message)
    }
  }
}