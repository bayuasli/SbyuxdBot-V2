const axios = require('axios');

/**
 * Noto Emoji Downloader Scraper
 * Source: fonts.gstatic.com
 * Owners: AgungDevX
 */
const NotoEmoji = {
    /**
     * Ngarobah emoji jadi kode Unicode (hex)
     * @param {String} input 
     */
    toUnicode: (input) => {
        let pairs = [];
        for (let i = 0; i < input.length; i++) {
            if (input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
                if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                    pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
                    i++;
                }
            } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
                pairs.push(input.charCodeAt(i));
            }
        }
        return pairs.map(val => val.toString(16)).join('_');
    },

    /**
     * @param {String} emoji - Karakter emoji (misal: 😊)
     */
    download: async (emoji) => {
        try {
            if (!emoji) return { status: 400, success: false, owners: "AgungDevX", message: "Emojina mana mang?" };

            const unicode = NotoEmoji.toUnicode(emoji);
            // URL Google Noto Emoji (WebP format)
            const url = `https://fonts.gstatic.com/s/e/notoemoji/latest/${unicode}/512.webp`;

            // Mariksa naha emojina aya atawa henteu
            const check = await axios.head(url).catch(() => null);
            if (!check) throw new Error("Emoji teu di-dukung atawa kode salah.");

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                result: {
                    emoji: emoji,
                    unicode: unicode,
                    url: url
                }
            };
        } catch (err) {
            return {
                status: 500,
                success: false,
                owners: "AgungDevX",
                message: err.message
            };
        }
    }
};

// --- LANGSUNG JALAN DI TERMUX ---
(async () => {
    console.log("--- [AgungDevX] Noto Emoji Downloader Testing... ---");
    // Cobaan make emoji naon bae
    const res = await NotoEmoji.download("😅");
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = NotoEmoji;
