const axios = require('axios');
const https = require('https');

const SaveNow = {
    _api: 'https://p.savenow.to',
    _key: 'dfcb6d76f2f6a9894gjkege8a4ab232222',
    _agent: new https.Agent({ rejectUnauthorized: false }),

    // Fungsi jang nunggu prosÃ©s konversi video nepi ka rÃ©ngsÃ©
    poll: async (url, limit = 40) => {
        for (let i = 0; i < limit; i++) {
            try {
                const { data } = await axios.get(url, { httpsAgent: SaveNow._agent });
                if (data.success === 1 && data.download_url) return data;
                if (data.success === -1) break; // Error ti serverna
            } catch (e) { /* malÃ©pir mun error */ }
            await new Promise(resolve => setTimeout(resolve, 2500));
        }
        return null;
    },

    /**
     * Downloader Utama
     * @param {string} url - Link YouTube
     * @param {string} res - Resolusi (360, 720, 1080)
     */
    download: async (url, res = '720') => {
        try {
            if (!url) return { status: 400, success: false, message: "Linkna mana euy?" };

            // Mimiti nembak API jang nyieun job download
            const { data: init } = await axios.get(`${SaveNow._api}/ajax/download.php`, {
                params: { copyright: 0, format: res, url: url, api: SaveNow._key },
                httpsAgent: SaveNow._agent
            });

            if (!init.success) throw new Error("Gagal nyieun antrian download.");

            const result = await SaveNow.poll(init.progress_url);

            if (!result) throw new Error("Lila teuing nungguan, uah-aÃ©h serverna.");

            const disclaimer = "\n\n---\n_**Educational Purpose Only**_\n_Konten ini dibagikan secara terbuka hanya untuk tujuan edukasi pemrograman dan riset pengembangan perangkat lunak (Software Development). Tidak bermaksud melanggar ketentuan layanan mana pun._";

            return {
                status: 200,
                success: true,
                payload: {
                    title: init.info?.title || "No Title",
                    thumbnail: init.info?.image,
                    duration: init.info?.duration,
                    quality: res + 'p',
                    download_url: result.download_url,
                    note: "Mun link paÃ©h, tembak deui baÃ©."
                },
                description: "YouTube Downloader by SaveNow" + disclaimer
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

// --- TEST DI TERMUX ---
(async () => {
    const target = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    console.log("[WAIT]: Keur diprosÃ©s...");
    const res = await SaveNow.download(target, "720");
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = SaveNow;