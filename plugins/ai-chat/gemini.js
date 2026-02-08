import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "gemini",
  category: "ai-chat",
  command: ["gemini", "gm", "sibayu"],
  alias: ["gmi"],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    const { Func } = context; // Utility kalau perlu

    let text = m.text?.trim();
    if (!text) {
      return conn.sendMessage(m.chat, { 
        text: 'Contoh:\n.gemini Halo, apa kabar?\n\nSet persona: .gemini --inst "Kamu adalah sibayu ai yang ceria" Halo!\n\nReset session: .gemini --reset' 
      }, { quoted: m });
    }

    const sender = m.sender; // Key unik per user (e.g., 628xxx@s.whatsapp.net)
    const sessionsDir = path.join(process.cwd(), 'sessions');
    const sessionFile = path.join(sessionsDir, `${sender.replace(/[@:.]/g, '_')}.json`);

    let instruction = '';
    let sessionId = null;
    let sessionData = {};

    // Buat folder sessions kalau belum ada
    await fs.mkdir(sessionsDir, { recursive: true }).catch(() => {});

    // Handle commands spesial
    if (text.includes('--inst')) {
      const parts = text.split('--inst');
      text = parts[0].trim();
      instruction = parts[1]?.trim() || '';
    }

    if (text.includes('--reset')) {
      await fs.rm(sessionFile).catch(() => {});
      return conn.sendMessage(m.chat, { text: '✅ Session AI direset. Mulai chat baru ya!' }, { quoted: m });
    }

    // Load session existing
    try {
      const data = await fs.readFile(sessionFile, 'utf-8');
      sessionData = JSON.parse(data);
      sessionId = sessionData.sessionId;

      // Cek expire (misal 1 jam = 3600000 ms)
      if (Date.now() - sessionData.lastUsed > 3600000) {
        await fs.rm(sessionFile);
        sessionId = null; // Reset kalau expired
      }
    } catch (e) {
      // No session → baru
    }

    // Limit session (contoh: max 5 session aktif global, tapi ini per user jadi aman)
    // Kalau mau global limit, pakai file terpisah untuk count

    try {
      const result = await gemini({
        message: text,
        instruction: instruction || sessionData.instruction || '', // Pertahankan instruction lama
        sessionId: sessionId
      });

      // Simpan/update session
      await fs.writeFile(sessionFile, JSON.stringify({
        sessionId: result.sessionId,
        instruction: result.instruction || instruction, // Simpan instruction untuk persist
        lastUsed: Date.now()
      }, null, 2));

      // Balas tanpa tampilkan session
      await conn.sendMessage(m.chat, { text: result.text }, { quoted: m });

    } catch (err) {
      console.error('[GEMINI PLUGIN ERROR]', err);
      await conn.sendMessage(m.chat, {
        text: `❌ Error: ${err.message || 'Gagal terhubung ke Gemini. Coba lagi atau reset session.'}`
      }, { quoted: m });
    }
  }
};

/**
 * Fungsi Gemini unofficial (update kecil: return juga instruction)
 */
async function gemini({ message, instruction = '', sessionId = null }) {
  try {
    if (!message) throw new Error('Message is required.');

    let resumeArray = null;
    let cookie = null;
    let savedInstruction = instruction;

    if (sessionId) {
      try {
        const sessionData = JSON.parse(Buffer.from(sessionId, 'base64').toString());
        resumeArray = sessionData.resumeArray;
        cookie = sessionData.cookie;
        savedInstruction = instruction || sessionData.instruction || '';
      } catch (e) {
        console.error('Error parsing session:', e.message);
      }
    }

    if (!cookie) {
      const { headers } = await axios.post(
        'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c',
        'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        }
      );

      cookie = headers['set-cookie']?.[0]?.split('; ')[0] || '';
      if (!cookie) throw new Error('Gagal mendapatkan cookie awal.');
    }

    const requestBody = [
      [message, 0, null, null, null, null, 0],
      ["en-US"],
      resumeArray || ["", "", "", null, null, null, null, null, null, ""],
      null, null, null, [1], 1, null, null, 1, 0, null, null, null, null, null,
      [[0]], 1, null, null, null, null, null,
      ["", "", savedInstruction, null, null, null, null, null, 0, null, 1, null, null, null, []],
      null, null, 1, null, null, null, null, null, null, null,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 1, null, null, null, null, [1]
    ];

    const payload = [null, JSON.stringify(requestBody)];

    const { data } = await axios.post(
      'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c',
      new URLSearchParams({ 'f.req': JSON.stringify(payload) }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'x-goog-ext-525001261-jspb': '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
          'cookie': cookie
        }
      }
    );

    const match = Array.from(data.matchAll(/^\d+\n(.+?)\n/gm));
    if (match.length < 4) throw new Error('Format response tidak dikenali.');

    const array = match.reverse();
    const selectedArray = array[3][1];
    const realArray = JSON.parse(selectedArray);
    const parse1 = JSON.parse(realArray[0][2]);

    const newResumeArray = [...parse1[1], parse1[4][0][0]];
    let text = parse1[4][0][1][0] || 'Tidak ada respon.';
    text = text.replace(/\*\*(.+?)\*\*/g, '*$1*');

    const newSessionId = Buffer.from(JSON.stringify({
      resumeArray: newResumeArray,
      cookie: cookie,
      instruction: savedInstruction
    })).toString('base64');

    return { text, sessionId: newSessionId, instruction: savedInstruction };

  } catch (error) {
    throw new Error(error.message || 'Gagal memproses request ke Gemini.');
  }
}