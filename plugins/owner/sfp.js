import fs from 'fs'
import path from 'path'

export default {
  name: 'sfp',
  category: 'owner',
  command: ['sfp', 'safeplugin'],
  settings: { owner: true },
  run: async (conn, m, { quoted }) => {
    if (!m.text) return m.reply(`Contoh: ${m.cmd} folder namaFile`)
    if (!quoted.body) return m.reply('Balas pesan berisi kode plugin!')

    const args = m.text.trim().split(/\s+/)
    if (args.length < 2) return m.reply(`Contoh: ${m.cmd} folder namaFile`)

    const [subfolder, filenameRaw] = args
    const filename = filenameRaw.endsWith('.js') ? filenameRaw : `${filenameRaw}.js`
    const fullPath = path.join('./plugins', subfolder)

    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true })
    const filePath = path.join(fullPath, filename)

    fs.writeFileSync(filePath, quoted.body)
    m.reply(`✅ Plugin tersimpan di: ${filePath}`)
  }
}