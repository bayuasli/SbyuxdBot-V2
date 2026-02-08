import axios from "axios"

export default {
  name: "ssweb",
  category: "tools",
  command: ["ssweb", "ss"],
  limit: true,

  run: async (conn, m) => {
    try {
      const args = m.body.split(" ").slice(1)
      if (!args[0]) return m.reply("❌ contoh:\n.ssweb google.com")

      let url = args[0].trim()
      if (!/^https?:\/\//i.test(url)) url = "https://" + url

      const pick = (k, d) => {
        const f = args.find(a => a.startsWith(`--${k}=`))
        return f ? f.split("=").slice(1).join("=").trim() : d
      }
      const toBool = v => /^(1|true|on|ya|y)$/i.test(String(v))

      const width  = parseInt(pick("w", 1280))
      const height = parseInt(pick("h", 720))
      const full   = toBool(pick("full", false))
      const scale  = parseInt(pick("scale", 1))

      const { data } = await axios.post(
        "https://gcp.imagy.app/screenshot/createscreenshot",
        {
          url,
          browserWidth: width,
          browserHeight: height,
          fullPage: full,
          deviceScaleFactor: scale,
          format: "png",
        },
        {
          headers: {
            "content-type": "application/json",
            referer: "https://imagy.app/full-page-screenshot-taker/",
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/137.0.0.0 Mobile Safari/537.36",
          },
          timeout: 30000,
        }
      )

      if (!data?.fileUrl) return m.reply("Gagal ambil file screenshot ❌")

      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.fileUrl },
          caption: `✅ Screenshot berhasil\n🌐 URL: ${url}`,
        },
        { quoted: m }
      )
    } catch (e) {
      console.error(e)
      m.reply("⚠️ " + (e.message || "Terjadi kesalahan"))
    }
  },
}