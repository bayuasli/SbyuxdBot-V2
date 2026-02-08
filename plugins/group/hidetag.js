/** @type {import('#lib/types.js').Plugin} */
import { getFQ } from '#lib/fakeQuoted.js'

export default {
  name: "hidetag",
  category: "group",
  command: ["hidetag", "ht"],
  settings: {
    owner: true,
    group: true,
    admin: false,
    botAdmin: false
  },

  run: async (conn, m, { metadata }) => {
    // Ambil teks dari reply atau dari command
    const text = m.quoted?.text || m.text?.replace(/^(\.hidetag|\.ht)\s*/i, "")
    if (!text) return m.reply("❌ Masukkan teks atau balas pesan lalu ketik command ini")

    // Ambil semua peserta grup
    const mentions = metadata.participants.map(p => p.id)

    // Ambil tipe fake quoted untuk chat ini
    const fqType = getFQ(m.chat)

    // Kirim pesan dengan mention semua peserta
    await conn.sendMessage(
      m.chat,
      {
        text,
        mentions
      },
      {
        quoted: m,
        fakeForwarded: fqType ? true : false,
        fakeForwardedMsg: fqType || undefined
      }
    )
  }
}