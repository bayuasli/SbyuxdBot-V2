const axios = require('axios');

/**
 * LrcLib Lyrics Scraper
 * Diropea ku: Agung
 */
const Lyrics = {
    search: async (title) => {
        try {
            if (!title) return { status: 400, success: false, message: "Judulna naon euy? Eusian heula!" };

            // Nembak API LrcLib jang nyari lirik
            const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });

            if (!data || !data[0]) throw new Error("Lirikna teu kapanggih, duka kamana.");

            const song = data[0];
            const lyricsRaw = song.plainLyrics || song.syncedLyrics;

            if (!lyricsRaw) throw new Error("Aya laguna tapi euweuh lirikna, hampura.");

            // Ngabersihkeun lirik tina tag waktu [00:00.00]
            const cleanLyrics = lyricsRaw.replace(/\[.*?\]/g, '').trim();

            const disclaimer = "\n\n---\n_**Educational Purpose Only**_\n_Konten ini dibagikan secara terbuka hanya untuk tujuan edukasi pemrograman dan riset pengembangan perangkat lunak (Software Development). Tidak bermaksud melanggar ketentuan layanan mana pun._";

            // Balikeun hasilna jadi JSON rapih
            return {
                status: 200,
                success: true,
                payload: {
                    title: song.trackName,
                    artist: song.artistName,
                    album: song.albumName,
                    duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'Unknown',
                    lyrics: cleanLyrics + disclaimer
                }
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
    const query = "Lamunan - Wahyu F Giri";
    console.log(`[SEARCH]: Keur neangan lirik ${query}...`);
    const hasil = await Lyrics.search(query);
    console.log(JSON.stringify(hasil, null, 2));
})();

module.exports = Lyrics;