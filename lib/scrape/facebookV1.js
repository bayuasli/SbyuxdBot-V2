const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Facebook Video Downloader Scraper (FSaver Engine)
 * Base: https://fsaver.net/
 * Format: Professional Clean JSON
 */
const FSaver = {
    config: {
        base: 'https://fsaver.net',
        agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    },

    /**
     * @param {String} videoUrl - URL Video Facebook
     */
    download: async (videoUrl) => {
        try {
            if (!videoUrl) return { status: 400, success: false, message: "URL is required." };

            const fetchUrl = `${FSaver.config.base}/download/?url=${encodeURIComponent(videoUrl)}`;
            
            const { data } = await axios.get(fetchUrl, {
                headers: {
                    "Upgrade-Insecure-Requests": "1",
                    "User-Agent": FSaver.config.agent,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Referer": "https://fsaver.net/"
                },
                timeout: 15000
            });

            const $ = cheerio.load(data);
            const videoSrc = $('.video__item').attr('src');

            if (!videoSrc) {
                return { 
                    status: 404, 
                    success: false, 
                    message: "Video resource not found. Make sure the link is public." 
                };
            }

            // Gabungkeun base URL mun linkna mangrupa path relatif
            const fullUrl = videoSrc.startsWith('http') ? videoSrc : FSaver.config.base + videoSrc;

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dikembangkan untuk tujuan riset pengembangan teknologi ekstraksi media digital dan edukasi pemrograman sistem perangkat lunak secara otomatis.";

            return {
                status: 200,
                success: true,
                payload: {
                    title: "Facebook Video Downloader",
                    source: videoUrl,
                    video_url: fullUrl,
                    format: "mp4"
                },
                description: "Professional Facebook Downloader Service (FSaver)" + disclaimer
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                message: err.message
            };
        }
    }
};

// --- RUN TEST ON TERMUX ---
(async () => {
    console.log("Processing Facebook video via FSaver...");
    // Ganti URL di handap ku video FB nu hayang di-test
    const testUrl = "https://www.facebook.com/watch/?v=123456789";
    const result = await FSaver.download(testUrl);
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = FSaver;
