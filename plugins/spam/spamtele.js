/** @type {import('#lib/types.js').Plugin} */
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  name: "spamtele",
  category: "spam",
  command: ["spamtele", "spamtelegram", "tgspam"],
  alias: ["tspam", "tele"],
  
  settings: {
    owner: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      const q = m.text
      
      if (!q) {
        return m.reply(`📱 *Spam Telegram*\n\n` +
          `*Format:*\n${m.prefix + m.command} token,id,pesan,jumlah\n\n` +
          `*Contoh:*\n${m.prefix + m.command} 123456:ABC, -100123456, Halo, 10\n\n` +
          `*Reply gambar:*\n${m.prefix + m.command} token,id,pesan,jumlah`)
      }

      let [token, id, pesan, jumlahStr] = q.split(',').map(v => v.trim())
      const jumlah = parseInt(jumlahStr)
      let fotoUrl = 'https://telegra.ph/file/1f7e0a0e5e3e3a3b3c3d4.jpg' // 

      if (!token || !id || !pesan || isNaN(jumlah)) {
        return m.reply(`❌ Format salah!\nContoh: ${m.prefix + m.command} token,id,pesan,jumlah`)
      }

      
      if (m.quoted && m.quoted.isMedia) {
        const isImage = m.quoted.type === 'imageMessage'
        
        if (!isImage) {
          return m.reply('❌ Reply harus berupa gambar!')
        }

        m.reply('📤 *Mengupload gambar...*')
        
        const buffer = await m.quoted.download()
        const tmpDir = path.join(process.cwd(), 'tmp')
        
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true })
        }
        
        const mediaPath = path.join(tmpDir, `tele_${Date.now()}.jpg`)
        fs.writeFileSync(mediaPath, buffer)

        try {
          const form = new FormData()
          form.append('reqtype', 'fileupload')
          form.append('fileToUpload', fs.createReadStream(mediaPath))

          const upload = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
          })

          fotoUrl = upload.data
        } catch (uploadErr) {
          console.error('Upload error:', uploadErr)
        } finally {
          fs.unlinkSync(mediaPath)
        }
      }

      const initialMsg = await conn.sendMessage(m.chat, { 
        text: `🚀 *Spam Telegram*\n\n📨 Target: ${id}\n🔁 Jumlah: ${jumlah}\n✅ 0 | ❌ 0` 
      }, { quoted: m })

      let sukses = 0, gagal = 0
      const randomNames = [
        "BOT SAMPAH", "BOT TOLOL", "BOT IDIOT", 
        "LonteBot", "DongoBot", "OWNER TOLOL",
        "GoblokBot", "Bot Sampah", "Bot Ngeselin",
        "SpamBot", "AnjayBot", "MabarBot"
      ]

      for (let i = 0; i < jumlah; i++) {
        try {
         
          const newName = randomNames[Math.floor(Math.random() * randomNames.length)]
          await axios.get(`https://api.telegram.org/bot${token}/setMyName?name=${encodeURIComponent(newName)}`)

       
          const res = await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
            chat_id: id,
            photo: fotoUrl,
            caption: pesan,
            parse_mode: "HTML",
            disable_notification: false,
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 SPAM BY BOT", url: "https://t.me/bayuror" }]
              ]
            }
          })

          if (res.status === 200) sukses++
          else gagal++
          
        } catch (e) {
          gagal++
          console.error(`[${i+1}] Error:`, e.message)
        }

        if (initialMsg?.key) {
          await conn.sendMessage(m.chat, {
            text: `🚀 *Spam Telegram*\n\n📨 Target: ${id}\n🔁 Proses: ${i+1}/${jumlah}\n✅ Berhasil: ${sukses}\n❌ Gagal: ${gagal}`,
            edit: initialMsg.key
          }).catch(() => {})
        }

        await sleep(1000)
      }

      
      const finalMsg = `✅ *Spam Telegram Selesai!*\n\n` +
        `📨 Target: ${id}\n` +
        `📤 Total: ${jumlah}\n` +
        `✅ Berhasil: ${sukses}\n` +
        `❌ Gagal: ${gagal}`

      if (initialMsg?.key) {
        await conn.sendMessage(m.chat, {
          text: finalMsg,
          edit: initialMsg.key
        }).catch(() => m.reply(finalMsg))
      } else {
        m.reply(finalMsg)
      }

    } catch (err) {
      console.error('[SPAMTELE ERROR]', err)
      m.reply(`❌ Error: ${err.message}`)
    }
  }
}