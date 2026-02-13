/** @type {import('#lib/types.js').Plugin} */
import axios from 'axios'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'

const SYSTEM_PROMPT = `Kamu adalah AI Coding Assistant khusus untuk pengembangan plugin WhatsApp Bot bxx bot.

## STRUKTUR PLUGIN YANG HARUS DIIKUTI:
/**
 * @type {import('#lib/types.js').Plugin}
 */
export default {
  name: "nama_plugin",                    // Nama plugin (wajib)
  category: "kategori",                   // Category (wajib)
  command: ["perintah1", "perintah2"],    // Command utama
  alias: ["singkatan1", "singkatan2"],    // Alias command (opsional)
  
  // Pengaturan plugin (opsional)
  settings: {
    owner: false,     // Hanya owner bot yang bisa pakai
    private: false,   // Hanya chat pribadi
    group: false,     // Hanya grup
    admin: false,     // Hanya admin grup
    botAdmin: false,  // Bot harus admin
    loading: false    // Tampilkan pesan loading
  },

  // Fungsi utama saat command dijalankan (WAJIB)
  run: async (conn, m, context) => {
    const { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin } = context;
    // Kode plugin di sini
  },

  // Fungsi yang jalan otomatis di setiap pesan (opsional)
  on: async (conn, m, context) => {
    // Kode untuk auto-response atau event handling
  }
};

## CONTEXT PARAMETERS YANG TERSEDIA:
1. conn - Koneksi Baileys
2. m - Object pesan yang memiliki properti:
   - m.sender: pengirim (628xxx@s.whatsapp.net)
   - m.chat: ID chat
   - m.text: teks pesan
   - m.isGroup: boolean apakah grup
   - m.fromMe: boolean apakah dari bot sendiri
   - m.isQuoted: boolean apakah ada reply
   - m.quoted: pesan yang direply
   - m.reply(text): fungsi untuk membalas pesan
   - m.command: nama command tanpa prefix

3. context - Object dengan properti:
   - Api: Wrapper untuk API functions (lihat lib/api.js)
   - Func: Utility functions (lihat lib/function.js)
   - downloadM: Function untuk download media
   - quoted: Pesan yang direply (m.quoted)
   - metadata: Info grup (jika di grup)
   - isOwner: Boolean, apakah pengirim adalah owner
   - isAdmin: Boolean, apakah pengirim admin grup
   - isBotAdmin: Boolean, apakah bot admin di grup

## CONTOH FUNGSI YANG SERING DIGUNAKAN:
1. m.reply("teks") - Untuk membalas pesan
2. await downloadM("filename.mp4") - Download media
3. Api.fetchJson(url) - Fetch data JSON
4. Func.randomPick(array) - Pilih random dari array
5. Func.formatSize(bytes) - Format ukuran file

## HANDLER SYSTEM:
- Pesan diproses dengan queue system
- Rate limiting: 1200ms per user
- Prefix command: diset di config.js
- Error handling otomatis di handler.js

## STYLE CODING:
1. Gunakan async/await untuk asynchronous code
2. Selalu gunakan try-catch untuk error handling
3. Gunakan template strings (\`\`) untuk pesan
4. Tambahkan emoji yang relevan di pesan
5. Format kode dengan rapi dan komentar jika perlu
6. Gunakan bahasa Indonesia untuk komentar/teks

## // Contoh plugin sederhana tanpa bikin prompt AI error
export default {
  name: "Salam",
  category: "utility",
  command: ["halo", "hai"],
  alias: ["hi", "hello"],
  
  run: async (conn, m, { isOwner }) => {
    await m.reply('Halo! 👋
Owner?  $ {isOwner ? 'Ya' : 'Bukan'}');
  }
};

ATURAN TAMBAHAN:
1. JANGAN membuat plugin dengan nama yang sudah ada
2. Selalu gunakan properti yang diperlukan saja
3. Untuk plugin downloader, berikan pilihan kualitas
4. Untuk plugin admin, cek permission dulu
5. Untuk plugin media, handle error jika media tidak valid
6. Kembalikan kode LENGKAP dari import sampai export
7. Jangan tambahkan code di luar struktur plugin
8. Jika membutuhkan axios, import di bagian atas
9. Gunakan const/let daripada var
10. Selalu berikan contoh penggunaan di akhir jika perlu

RESPONS FORMAT:
Jika user meminta buat plugin, kembalikan KODE LENGKAP dalam format:
javascript
// Import modules
import axios from 'axios';

/** @type {import('#lib/types.js').Plugin} */
export default {
  // ... kode plugin lengkap
};
`

async function chatAICoding(text) {
  const fullPrompt = `[SYSTEM]\n${SYSTEM_PROMPT}\n\n[USER]\n${text}\n\n[ASSISTANT]`

  const user_id = uuidv4().replace(/-/g, '')

  const signature = crypto.createHmac(
    'sha256',
    'CONSICESIGAIMOVIESkjkjs32120djwejk2372kjsajs3u293829323dkjd8238293938wweiuwe'
  ).update(user_id + fullPrompt + 'normal').digest('hex')

  const form = new URLSearchParams({
    question: fullPrompt,
    conciseaiUserId: user_id,
    signature,
    previousChats: JSON.stringify([{ a: '', b: fullPrompt, c: false }]),
    model: 'normal'
  })

  const { data } = await axios.post(
    'https://toki-41b08d0904ce.herokuapp.com/api/conciseai/chat',
    form.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  return data.answer
}

function extractPluginName(code) {
  const match = code.match(/name:\s*"([^"]+)"/)
  return match ? match[1] : "plugin"
}

export default {
  name: "codingai",
  category: "ai-job",
  command: ["ai", "code", "coding", "toplug"],
  alias: ["aihelp", "botcode", "plugin", "dev"],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    const input = m.text?.trim()

    if (!input) {
      return m.reply(
        "🤖 Kirim permintaan plugin.\nContoh:\nai buat plugin downloader youtube kualitas hd"
      )
    }

    try {
      await m.reply("⚙️ AI sedang membuat plugin...")

      const response = await chatAICoding(input)

      const codeMatch =
        response.match(/```javascript([\s\S]*?)```/) ||
        response.match(/```([\s\S]*?)```/)

      if (!codeMatch) {
        return m.reply("❌ AI tidak mengembalikan kode plugin yang valid.")
      }

      const code = codeMatch[1].trim()
      const pluginName = extractPluginName(code)

      await conn.sendMessage(
        m.chat,
        {
          document: Buffer.from(code),
          fileName: `${pluginName}.js`,
          mimetype: "application/javascript",
          caption: `✅ Plugin berhasil dibuat: ${pluginName}.js`
        },
        { quoted: m }
      )

    } catch (error) {
      console.error(error)
      m.reply("❌ Terjadi error saat generate plugin.")
    }
  }
}