import fetch from 'node-fetch'

export default {
  name: "delweb",
  category: "webdev",
  command: ["delweb"],
  settings: { owner: true },

  run: async (conn, m) => {
    try {
      const args = m.body.split(' ').slice(1)
      const webName = args[0]?.toLowerCase()
      if (!webName) return m.reply("Gunakan format: .delweb <NamaWeb>")

      const tokenVercel = "zHKYVR3KqE2DIGZKNdyNHHPA"
      const headers = { Authorization: `Bearer ${tokenVercel}` }

      const response = await fetch(`https://api.vercel.com/v9/projects/${webName}`, {
        method: "DELETE",
        headers,
      })

      if (response.status === 200 || response.status === 204) {
        return m.reply(`✅ Website *${webName}* berhasil dihapus.`)
      } 
      else if (response.status === 404) {
        return m.reply(`⚠️ Website *${webName}* tidak ditemukan.`)
      } 
      else if (response.status === 401 || response.status === 403) {
        return m.reply(`❌ Token Vercel tidak valid atau tidak punya akses.`)
      } 
      else {
        let result = {}
        try { result = await response.json() } catch {}
        return m.reply(`Gagal menghapus website:\n${result.error?.message || "Tidak diketahui"}`)
      }

    } catch (err) {
      console.error("DELWEB ERROR:", err)
      m.reply("❌ Terjadi kesalahan saat menghapus website.")
    }
  }
}