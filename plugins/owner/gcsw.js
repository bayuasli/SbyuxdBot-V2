import crypto from "node:crypto"
import {
  generateWAMessageContent,
  generateWAMessageFromContent
} from "@whiskeysockets/baileys"

export default {
  name: "gcsw",
  category: "owner",
  command: ["gcsw"],

  settings: {
    owner: true,
    group: false,
    botAdmin: false
  },

  run: async (conn, m) => {
    try {
      conn._gcsw = conn._gcsw || {}

      if (m.args[0] && /^\d+$/.test(m.args[0])) {
        const data = conn._gcsw[m.sender]
        if (!data) return m.reply("⚠️ Kirim teks atau reply media dulu pakai .gcsw")

        const index = parseInt(m.args[0]) - 1
        const target = data.groups[index]
        if (!target) return m.reply("⚠️ Nomor grup tidak valid.")

        const messageSecret = crypto.randomBytes(32)

        const inside = await generateWAMessageContent(data.content, {
          upload: conn.waUploadToServer
        })

        const msg = generateWAMessageFromContent(
          target.id,
          {
            messageContextInfo: { messageSecret },
            groupStatusMessageV2: {
              message: {
                ...inside,
                messageContextInfo: { messageSecret }
              }
            }
          },
          {}
        )

        await conn.relayMessage(target.id, msg.message, {
          messageId: msg.key.id
        })

        delete conn._gcsw[m.sender]

        return m.reply(`✅ Status grup terkirim ke:\n📛 ${target.subject}`)
      }

      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || ""
      const teks = m.text || q.text || q.caption || ""

      if (!/image|video|audio/.test(mime) && !teks)
        return m.reply("⚠️ Kirim teks atau reply media dulu.")

      let content

      if (/image/.test(mime)) {
        const media = await q.download()
        if (!media) return m.reply("⚠️ Gagal mengambil media.")
        content = { image: media, caption: teks }
      } 
      else if (/video/.test(mime)) {
        const media = await q.download()
        if (!media) return m.reply("⚠️ Gagal mengambil media.")
        content = { video: media, caption: teks }
      } 
      else if (/audio/.test(mime)) {
        const media = await q.download()
        if (!media) return m.reply("⚠️ Gagal mengambil media.")
        content = { audio: media, mimetype: "audio/mp4", ptt: false }
      } 
      else {
        content = { text: teks, backgroundColor: "#0068ff" }
      }

      const groupsData = await conn.groupFetchAllParticipating()
      const groups = Object.entries(groupsData).map(([id, data]) => ({
        id,
        subject: data.subject
      }))

      if (!groups.length) return m.reply("⚠️ Bot belum gabung di grup manapun.")

      let list = "📋 Pilih grup tujuan SW:\n\n"
      groups.forEach((g, i) => {
        list += `${i + 1}. ${g.subject}\n`
      })
      list += "\nKetik .gcsw <nomor> untuk kirim."

      conn._gcsw[m.sender] = { content, groups }

      return m.reply(list)

    } catch (err) {
      console.error("GCSW ERROR:", err)
      return m.reply("❌ Terjadi error: " + err.message)
    }
  }
}