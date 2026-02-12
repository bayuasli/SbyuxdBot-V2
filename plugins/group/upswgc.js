import crypto from "node:crypto"
import {
  generateWAMessageContent,
  generateWAMessageFromContent
} from "@whiskeysockets/baileys"

/**
@type {import('#lib/types.js').Plugin}
*/
export default {
  name: "upswgc",
  category: "group",
  command: ["toswgc", "swgc", "swgrup"],

  settings: {
    owner: false,
    group: true,
    botAdmin: false
  },

  run: async (conn, m, { quoted }) => {
    try {
      if (!m.isGroup) return

      const q = quoted || m
      const mime = (q.msg || q).mimetype || ""
      const text = m.text?.trim()

      let payload = {}

      if (/image/.test(mime)) {
        payload = {
          image: await q.download(),
          caption: text || q.text || ""
        }
      }
      else if (/video/.test(mime)) {
        payload = {
          video: await q.download(),
          caption: text || q.text || ""
        }
      }
      else if (/audio/.test(mime)) {
        payload = {
          audio: await q.download(),
          mimetype: "audio/mp4",
          ptt: false
        }
      }
      else if (text) {
        payload = {
          text,
          backgroundColor: "#7ACAA7"
        }
      }
      else {
        return m.reply("Reply media atau kirim teks untuk dijadikan status grup.")
      }

      const groupStatus = async (jid, content) => {
        const { backgroundColor } = content
        delete content.backgroundColor

        const inside = await generateWAMessageContent(content, {
          upload: conn.waUploadToServer,
          backgroundColor
        })

        const messageSecret = crypto.randomBytes(32)

        const msg = generateWAMessageFromContent(
          jid,
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

        await conn.relayMessage(jid, msg.message, {
          messageId: msg.key.id
        })

        return msg
      }

      const sent = await groupStatus(m.chat, payload)

      await conn.sendMessage(m.chat, {
        react: { text: "✅", key: m.key }
      })

      await conn.sendMessage(
        m.chat,
        { text: "status grup berhasil kekirim, cek reply pesan ini" },
        { quoted: sent }
      )

    } catch (err) {
      console.error(err)

      await conn.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      })

      m.reply("Gagal mengirim status grup.")
    }
  }
}