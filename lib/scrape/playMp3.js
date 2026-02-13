const axios = require('axios');
const FormData = require('form-data');
const yts = require('yt-search');

/**
 * YouTube Search & Downloader (YouConvert Engine)
 * Base: youconvert.org
 * Author: Rizki (Modified by Agung)
 */
const YouConvert = {
    config: {
        postUrl: 'https://youtubemp4free.com/wp-admin/admin-ajax.php',
        baseUrl: 'https://youconvert.org/',
        agent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36'
    },

    /**
     * @param {String} query - Bisa berupa Link YouTube atawa Judul Video
     */
    play: async (query) => {
        try {
            if (!query) return { status: 400, success: false, message: "Query or URL is required." };

            let targetUrl = query;

            // Logika 1: Pariksa naha input teh URL atawa Keyword
            const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(query);

            if (!isUrl) {
                // Lamun keyword, teangan heula make yt-search
                const search = await yts(query);
                const video = search.videos[0]; // Cokot hasil pangluhurna
                if (!video) return { status: 404, success: false, message: "Video not found." };
                targetUrl = video.url;
            }

            // Logika 2: Kirim URL ka engine YouConvert
            const form = new FormData();
            form.append('action', 'yt_convert');
            form.append('youtube_url', targetUrl);

            const { data: repo } = await axios.post(YouConvert.config.postUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    "User-Agent": YouConvert.config.agent,
                    "Origin": "https://youconvert.org",
                    "Accept": "*/*"
                }
            });

            if (!repo || !repo.success || !repo.data) {
                throw new Error(repo?.message || "Failed to process video conversion.");
            }

            const v = repo.data;
            const i = repo.data.info;

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dikembangkan untuk tujuan riset integrasi API, perayapan data media, dan edukasi pemrograman sistem otomasi perangkat lunak.";

            return {
                status: 200,
                success: true,
                payload: {
                    metadata: {
                        title: i.title,
                        author: i.author || 'Unknown',
                        views: i.view_count,
                        duration: i.length_str,
                        thumbnail: i.thumbnail,
                        videoId: i.video_id,
                        description: i.description ? i.description.replace(/[\n+]/g, ' ').substring(0, 200) + '...' : null
                    },
                    download: {
                        mp3: YouConvert.config.baseUrl + v.mp3.replace(/^\/+/, ''),
                        slug_page: YouConvert.config.baseUrl + v.slug,
                        size: v.size
                    }
                },
                description: "Professional YouTube Hybrid Downloader Service" + disclaimer
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
    console.log("Searching and processing video...");
    
    // Test make Judul Video (Keyword)
    const resultByQuery = await YouConvert.play("Dua Lalaki - Doel Sumbang");
    console.log(JSON.stringify(resultByQuery, null, 2));

    /* // Test make URL Langsung
    const resultByUrl = await YouConvert.play("https://youtu.be/CVhvpuLpS-k");
    console.log(resultByUrl);
    */
})();

module.exports = YouConvert;
