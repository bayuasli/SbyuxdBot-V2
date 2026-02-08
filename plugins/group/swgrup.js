import { generateWAMessageContent, generateWAMessageFromContent } from "@whiskeysockets/baileys"
import crypto from "crypto"

export default {
  name: "swgroup",
  category: "group",
  command: ["swgroup", "swgrup"],

  async run(conn, m) {
    try {
      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || ""
      const caption = m.body.replace(/^\.swgrup\s*/i, "").trim()
      const jid = m.chat

      if (!jid.endsWith("@g.us")) return m.reply("Fitur ini cuma bisa dipakai di grup.")

      let content = null

      if (/image/.test(mime)) {
        const media = await conn.downloadMediaMessage(q)
        content = { image: media, caption }
      } else if (/video/.test(mime)) {
        const media = await conn.downloadMediaMessage(q)
        content = { video: media, caption }
      } else if (/audio/.test(mime)) {
        const media = await conn.downloadMediaMessage(q)
        content = { audio: media, mimetype: "audio/ogg; codecs=opus", ptt: true }
      } else if (caption) {
        content = { text: caption, backgroundColor: "#008069" }
      } else {
        return m.reply("Reply media atau kirim teks.\nContoh: .swgrup halo semua")
      }

      const messageSecret = crypto.randomBytes(32)

      const inside = await generateWAMessageContent(content, {
        upload: conn.waUploadToServer
      })

      const msg = generateWAMessageFromContent(
        jid,
        {
          messageContextInfo: { messageSecret },
          groupStatusMessageV2: {
            message: { ...inside, messageContextInfo: { messageSecret } }
          }
        },
        {}
      )

      await conn.relayMessage(jid, msg.message, { messageId: msg.key.id })

      m.react("✅")
    } catch (e) {
      console.log("SWGROUP ERROR:", e)
      m.reply("Gagal kirim SW Grup.\n" + e.message)
    }
  }
}