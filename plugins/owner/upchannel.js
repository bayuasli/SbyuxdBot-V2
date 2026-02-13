/** @type {import('#lib/types.js').Plugin} */
import fs from 'fs/promises'
import path from 'path'

export default {
  name: "upchannel",
  category: "owner",
  command: ["upch", "upsaluran", "sendch"],
  alias: ["ch", "channel"],
  
  settings: {
    owner: true,
    loading: false
  },

  run: async (conn, m) => {
    try {
      const text = m.text
      const quoted = m.quoted
      
      if (!text && !quoted) {
        return m.reply(`📢 *Upload ke Channel*\n\n` +
          `Kirim pesan atau reply media ke channel resmi.\n\n` +
          `*Contoh:*\n` +
          `• .upch Halo semua!\n` +
          `• Reply gambar > .upch Caption\n` +
          `• Reply video > .upch\n` +
          `• Reply audio > .upch`)
      }

      let messageOptions = {}
      let captionText = text || ""
      let mediaType = ""
      let mediaPath = ""

      
      if (quoted) {
        if (quoted.isMedia) {
          if (quoted.type === 'imageMessage') {
            mediaType = "image"
          } else if (quoted.type === 'videoMessage') {
            mediaType = "video"
          } else if (quoted.type === 'audioMessage') {
            mediaType = "audio"
          } else {
            return m.reply(`❌ Jenis media tidak didukung!\nHanya gambar, video, dan audio.`)
          }
        } else {
          return m.reply(`❌ Reply harus berupa media (gambar/video/audio)`)
        }

        m.reply(`📥 *Mendownload media...*`)
        const buffer = await quoted.download()
        
        const tmpDir = path.join(process.cwd(), 'tmp')
        await fs.mkdir(tmpDir, { recursive: true })
        
        const ext = {
          image: '.jpg',
          video: '.mp4',
          audio: '.mp3'
        }[mediaType]
        
        const fileName = `channel_${Date.now()}${ext}`
        mediaPath = path.join(tmpDir, fileName)
        await fs.writeFile(mediaPath, buffer)
      }


      if (mediaType === "audio") {
        messageOptions.audio = { url: mediaPath }
        messageOptions.mimetype = "audio/mp4"
        messageOptions.ptt = true
      } else if (mediaType) {
        messageOptions[mediaType] = { url: mediaPath }
        if (captionText) messageOptions.caption = captionText
      } else {
        messageOptions.text = captionText
      }


      let ppuser = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.imgur.com/3XxqXqQ.png')
      let pushname = m.pushname || 'User'
      
      messageOptions.contextInfo = {
        isForwarded: true,
        serverMessageId: -1,
        forwardingScore: 999,
        externalAdReply: {
          showAdAttribution: true,
          title: pushname,
          body: `📢 Channel Broadcast`,
          thumbnailUrl: ppuser,
          sourceUrl: "https://about-sbyuxd.vercel.app",
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }

      // === KIRIM KE CHANNEL (1 CHANNEL SAJA) ===
      const channelId = "120363421313094892@newsletter"
      
      m.reply(`📤 *Mengirim ke channel...*`)
      await conn.sendMessage(channelId, messageOptions)
      
      // === CLEANUP ===
      if (mediaPath) {
        await fs.unlink(mediaPath).catch(() => {})
      }

      // === RESPON ===
      let successMsg = `✅ *Pesan terkirim ke channel!*\n\n`
      successMsg += `📢 *Channel Resmi*\n`
      if (mediaType) successMsg += `📎 *Media:* ${mediaType}\n`
      if (captionText) successMsg += `📝 *Pesan:* ${captionText.slice(0, 50)}${captionText.length > 50 ? '...' : ''}\n`
      successMsg += `👤 *Pengirim:* ${pushname}`
      
      await m.reply(successMsg)

    } catch (e) {
      console.error("[UPCHANNEL ERROR]", e)
      m.reply(`❌ Gagal mengirim ke channel: ${e.message}`)
    }
  }
}