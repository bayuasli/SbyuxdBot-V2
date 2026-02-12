/**
 * @type {import('#lib/types.js').Plugin}
 */
export default {
  name: "cekidch",
  category: "tools",
  command: ["idch", "cekidch"],

  settings: {
    owner: false,
    group: false,
    botAdmin: false
  },

  run: async (conn, m, { text, quoted }) => {
    try {
      const input = text || quoted?.text || quoted?.caption || ""

      if (!input.includes("whatsapp.com/channel/"))
        return m.reply("Masukkan link channel WhatsApp yang valid.")

      const code = input.split("whatsapp.com/channel/")[1].trim()

      const res = await conn.newsletterMetadata("invite", code)

      return m.reply(res.id)

    } catch (err) {
      console.error(err)
      return m.reply("Gagal mengambil ID channel.")
    }
  }
}