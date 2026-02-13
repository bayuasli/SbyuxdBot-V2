const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Facebook Video Downloader Scraper (FDownload Engine)
 * Base: https://fdownload.app/
 * Format: Professional Clean JSON
 */
const FbFDownload = {
    config: {
        api: "https://fdownload.app/api/ajaxSearch",
        agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    },

    /**
     * @param {String} videoUrl - URL Video Facebook
     */
    download: async (videoUrl) => {
        try {
            if (!videoUrl) return { status: 400, success: false, message: "Facebook URL is required." };

            const { data } = await axios.post(
                FbFDownload.config.api,
                new URLSearchParams({
                    p: "home",
                    q: videoUrl,
                    lang: "en",
                    w: ""
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": FbFDownload.config.agent,
                        "X-Requested-With": "XMLHttpRequest",
                        "Referer": "https://fdownload.app/en"
                    }
                }
            );

            if (!data || data.status !== "ok") {
                throw new Error("Failed to fetch data from FDownload server.");
            }

            const $ = cheerio.load(data.data);
            const results = [];

            // Ngumpulkeun sakabéh link résolusi anu sayaga
            $("table tbody tr").each((_, element) => {
                const qualityText = $(element).find(".video-quality").text().trim();
                const statusText = $(element).find("td:nth-child(2)").text().trim();
                const urlLink = $(element).find("td:nth-child(3) a").attr("href");

                if (qualityText && urlLink && qualityText.match(/\d+p/)) {
                    results.push({
                        resolution: qualityText,
                        render_status: statusText,
                        url: urlLink
                    });
                }
            });

            if (results.length === 0) throw new Error("No downloadable video links found.");

            // Nyokot résolusi anu pangluhurna otomatis
            const highest = results.reduce((prev, curr) => {
                const prevNum = parseInt(prev.resolution.match(/(\d+)/)[0]);
                const currNum = parseInt(curr.resolution.match(/(\d+)/)[0]);
                return currNum > prevNum ? curr : prev;
            });

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dikembangkan untuk tujuan riset pengembangan teknologi perayapan data dan edukasi sistem ekstraksi konten digital secara otomatis.";

            return {
                status: 200,
                success: true,
                payload: {
                    source: videoUrl,
                    title: "Facebook Video Downloader",
                    best_resolution: highest.resolution,
                    download_url: highest.url,
                    available_quality: results.map(r => r.resolution)
                },
                description: "Professional Facebook Downloader Service" + disclaimer
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
    console.log("Analyzing Facebook video link...");
    // Ganti ku URL FB anu hayang di-test
    const result = await FbFDownload.download("https://fb.watch/xxxxx/");
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = FbFDownload;
