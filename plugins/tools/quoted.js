/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "quoteinfo",
  category: "tools",
  command: ["q", "quote", "quotedinfo"],
  
  settings: {
    owner: true,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      if (!m.isQuoted) {
        return m.reply(`❌ Reply pesan yang ingin dilihat strukturnya`);
      }

      const quoted = m.quoted;
      
      // Ambil data lengkap pesan
      const messageData = {
        type: quoted.mtype || 'unknown',
        sender: quoted.sender || 'unknown',
        chat: quoted.chat || 'unknown',
        timestamp: quoted.timestamp || Date.now(),
        text: quoted.text || quoted.body || '',
        caption: quoted.caption || '',
        mimetype: quoted.mimetype || '',
        isForwarded: quoted.isForwarded || false,
        forwardingScore: quoted.forwardingScore || 0,
        hasMedia: quoted.hasMedia || false,
        quoted: quoted.isQuoted || false,
        key: quoted.key || {}
      };

      // Jika ada media, tambah info download
      if (quoted.hasMedia) {
        try {
          const mediaBuffer = await conn.downloadMediaMessage(quoted);
          messageData.mediaSize = mediaBuffer ? mediaBuffer.length : 0;
          messageData.mediaDownloaded = !!mediaBuffer;
        } catch (e) {
          messageData.mediaError = e.message;
        }
      }

      // Format output JSON
      const jsonData = JSON.stringify(messageData, null, 2);
      
      // Kirim dengan format code block
      await conn.sendMessage(m.chat, {
        text: `📋 *Quote Information*\n\n\`\`\`json\n${jsonData}\n\`\`\``,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }, { quoted: m });

    } catch (error) {
      console.error('[QUOTEINFO ERROR]', error);
      m.reply('❌ Gagal mengambil informasi quote');
    }
  }
};