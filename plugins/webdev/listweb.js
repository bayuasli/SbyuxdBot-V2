import fetch from 'node-fetch'

export default {
  name: "listweb",
  category: "webdev",
  command: ["listweb"],

  run: async (conn, m) => {
    try {
      const tokenVercel = "zHKYVR3KqE2DIGZKNdyNHHPA"
      const headers = { Authorization: `Bearer ${tokenVercel}` }

      const res = await fetch(`https://api.vercel.com/v9/projects`, {
        method: "GET",
        headers,
      })

      if (!res.ok) {
        const errText = await res.text()
        return m.reply(`Gagal mengambil daftar:\n${errText}`)
      }

      const data = await res.json()
      if (!data.projects?.length)
        return m.reply("Tidak ada web yang ditemukan.")

      let textList = `📄 *Daftar Web Vercel:*\n\n`
      data.projects.forEach((proj, i) => {
        textList += `${i + 1}. *${proj.name}*\n`
        textList += `🔗 https://${proj.name}.vercel.app\n\n`
      })

      m.reply(textList.trim())

    } catch (err) {
      console.error("LISTWEB ERROR:", err)
      m.reply("❌ Terjadi kesalahan saat mengambil daftar web.")
    }
  }
}