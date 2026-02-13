const axios = require('axios');

/**
 * SoundCloud Downloader Scraper
 * Source: sc.snapfirecdn.com
 * Owners: AgungDevX
 */
const SCDL = {
    config: {
        baseUrl: "https://sc.snapfirecdn.com",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    },

    /**
     * @param {String} url - Link lagu SoundCloud
     */
    download: async (url) => {
        try {
            if (!url) return { status: 400, success: false, owners: "AgungDevX", message: "Mana link SoundCloud-na mang?" };

            // Step 1: Nyokot info lagu jeung progressive_url
            const { data: info } = await axios.post(`${SCDL.config.baseUrl}/soundcloud`, 
                { target: url, gsc: "x" }, 
                { headers: SCDL.config.headers }
            );

            if (!info.sound || !info.sound.progressive_url) {
                throw new Error("Gagal meunangkeun info lagu. Linkna bener teu?");
            }

            // Step 2: Bypass keur meunangkeun Direct MP3 Link
            const dlUrl = `${SCDL.config.baseUrl}/soundcloud-get-dl?target=${encodeURIComponent(info.sound.progressive_url)}`;
            const { data: dl } = await axios.get(dlUrl, { headers: SCDL.config.headers });

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                result: {
                    title: info.sound.title,
                    artist: info.metadata.username,
                    thumb: info.metadata.artwork_url,
                    urls: {
                        direct: dl.url, // Ieu link download MP3-na
                        hls: info.sound.hls_url,
                        progressive: info.sound.progressive_url
                    },
                    metadata: {
                        userId: info.metadata.userid,
                        profile: info.metadata.profile_picture_url
                    }
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

// --- TEST RUN ---
(async () => {
    console.log("--- [AgungDevX] SoundCloud Downloader Testing... ---");
    const testUrl = "https://on.soundcloud.com/7XnHklPldjsqXc6oK3";
    const res = await SCDL.download(testUrl);
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = SCDL;
