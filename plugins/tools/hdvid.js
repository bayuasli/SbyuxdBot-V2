/** @type {import('#lib/types.js').Plugin} */
import { hdvid } from '#lib/scrape/HDConvert.js';
import path from 'path';
import fs from 'fs/promises';

export default {
    name: "hdvid",
    category: "tools",
    command: ["hdvid", "vid2hd"],
    
    settings: {
        loading: false
    },

    run: async (conn, m) => {
        try {
            if (!m.isQuoted) {
                return m.reply('❌ Reply video yang ingin di-convert ke HD!');
            }

            const quoted = m.quoted;
            
            if (!quoted.isMedia || quoted.type !== 'videoMessage') {
                return m.reply('❌ Reply harus berupa video!');
            }

            m.reply('🔄 *Mengconvert video ke HD...*');

            const buffer = await quoted.download();
            const result = await hdvid(buffer);

            if (!result?.buffer) {
                return m.reply('❌ Gagal mengconvert video.');
            }

            await conn.sendMessage(m.chat, {
                video: result.buffer,
                caption: `✅ *Video HD Selesai!*\n📦 ${(result.size / 1048576).toFixed(2)} MB`,
                mimetype: 'video/mp4'
            }, { quoted: m });

            await fs.unlink(result.path).catch(() => {});

        } catch (e) {
            console.error('[HD ERROR]', e);
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};