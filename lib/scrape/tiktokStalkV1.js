/**
 * By : AgungDEV
 * Note's : TikTok User Finder Scraper (Pure CJS)
 * Status : Ganas / No API Wrapper
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fungsi jang nyedot data Profile TikTok
 * @param {String} username - Username target (bebas make @ atawa henteu)
 */
async function tiktokUserFinder(username) {
    try {
        if (!username) throw new Error('Username-na mana mang?');

        const cleanUsername = username.replace(/^@/, '').trim();
        const url = `https://www.tiktok.com/@${cleanUsername}`;

        console.log(`[AgungDevx] Nuju nyiduh data: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html',
                'Referer': 'https://www.tiktok.com/'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        
        // Nyokot data tina script tag raksasa TikTok
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        if (!scriptData) throw new Error('Struktur data TikTok geus robah, mang! Kudu diupdate deui.');

        const parsedData = JSON.parse(scriptData);
        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
        const userInfo = userDetail?.userInfo;

        if (!userInfo || !userInfo.user) throw new Error('User teu kapanggih atawa akunna diprivat!');

        // Nyusun hasilna jadi JSON rapih
        const result = {
            status: true,
            creator: "AgungDEV",
            data: {
                user: userInfo.user,
                stats: userInfo.stats,
                shareMeta: parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail']?.shareMeta
            }
        };

        // Langsung nembongkeun JSON dina terminal
        console.log(JSON.stringify(result, null, 2));
        return result;

    } catch (e) {
        const errorRes = {
            status: false,
            creator: "AgungDEV",
            error: e.message
        };
        console.log(JSON.stringify(errorRes, null, 2));
        return errorRes;
    }
}

// --- TEST DI TERMUX ---
// Cara make: node namafile.js username
const input = process.argv[2];
if (input) {
    tiktokUserFinder(input);
} else {
    // Default mun maneh ngan saukur ngetik 'node file.js'
    tiktokUserFinder('tiktok');
}

module.exports = tiktokUserFinder;
