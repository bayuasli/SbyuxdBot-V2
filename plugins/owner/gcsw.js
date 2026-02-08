/** @type {import('#lib/types.js').Plugin} */
import crypto from 'crypto'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

export default {
  name: "gcsw",
  category: "owner",
  command: ["gcsw", "swgc", "toswgc"],

  settings: {
    owner: true
  },

  run: async (conn, m) => {
    try {
      const text = m.text || ""
      conn._gcsw ??= {}

      // =========================
      // PHASE 2 (Kirim ke grup)
      // =========================
      if (/^\d+$/.test(text.trim())) {
        const session = conn._gcsw[m.sender]
        if (!session) return m.reply("Belum ada konten. Kirim teks / reply media dulu pakai .gcsw")

        const index = parseInt(text) - 1
        const group = session.groups[index]
        if (!group) return m.reply("Nomor grup tidak valid.")

        const messageSecret = crypto.randomBytes(32)

        const content = session.content

        const msg = generateWAMessageFromContent(
          group.id,
          {
            groupStatusMessageV2: {
              message: content,
              messageContextInfo: {
                messageSecret
              }
            }
          },
          { userJid: conn.user.id }
        )

        await conn.relayMessage(group.id, msg.message, {
          messageId: msg.key.id
        })

        delete conn._gcsw[m.sender]
        return m.reply(`Status berhasil dikirim ke ${group.subject}`)
      }

      // =========================
      // PHASE 1 (Prepare konten)
      // =========================
      const quoted = m.isQuoted ? m.quoted : m
      const mime = quoted?.msg?.mimetype || ""
      const teks = text || quoted?.text || quoted?.caption

      if (!/image|video/.test(mime) && !teks)
        return m.reply("Reply gambar/video atau kirim teks dulu.")

      let content

      if (/image|video/.test(mime)) {
        const buffer = await quoted.download()
        if (!buffer) return m.reply("Gagal ambil media.")

        if (buffer.length > 16 * 1024 * 1024)
          return m.reply("Media terlalu besar. Maks 16MB.")

        const type = mime.split("/")[0]

        content = {
          [type]: buffer,
          caption: teks || ""
        }
      } else {
        content = {
          text: teks,
          backgroundColor: "#000000"
        }
      }

      // =========================
      // Ambil grup (ANTI KOSONG)
      // =========================

      let groupsData

      try {
        groupsData = await conn.groupFetchAllParticipating()
      } catch {
        // fallback kalau error
        groupsData = conn.chats
      }

      const groups = Object.entries(groupsData)
        .filter(([jid]) => jid.endsWith("@g.us"))
        .map(([id, data]) => ({
          id,
          subject: data.subject || "Unknown Group"
        }))

      if (!groups.length)
        return m.reply("Bot belum terdeteksi join grup manapun. Coba restart panel setelah join grup.")

      let list = "Pilih grup tujuan:\n\n"
      groups.forEach((g, i) => {
        list += `${i + 1}. ${g.subject}\n`
      })

      list += "\nKetik: .gcsw <nomor>"

      conn._gcsw[m.sender] = { content, groups }

      return m.reply(list)

    } catch (err) {
      console.error("[GCSW ERROR]", err)
      return m.reply("Terjadi error saat menjalankan gcsw.")
    }
  }
}