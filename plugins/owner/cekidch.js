/**
 * @type {import('#lib/types.js').Plugin}
 */
export default {
  name: "cekidch",
  category: "owner",
  command: ["cekidch", "ch"],
  settings: {
    owner: true,
    group: false,
    botAdmin: false
  },

  run: async (conn, m, { text, quoted }) => {
    try {
      // Ambil link dari argumen atau reply
      const input = text || quoted?.text || quoted?.caption || ""

      if (!input.includes("whatsapp.com/channel/"))
        return m.reply("Masukkan link channel yang valid.")

      const code = input.split("whatsapp.com/channel/")[1].trim()
      const res = await conn.newsletterMetadata("invite", code)

      const teks = `
ID : ${res.id}
Nama : ${res.name}
Total Pengikut : ${res.subscribers}
Status : ${res.state}
Verified : ${res.verification === "VERIFIED" ? "Terverifikasi" : "Tidak"}
      `.trim()

      return m.reply(teks)

    } catch (err) {
      console.error(err)
      return m.reply("Gagal mengambil data channel.")
    }
  }
}