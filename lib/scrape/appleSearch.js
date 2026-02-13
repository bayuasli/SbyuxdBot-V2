const axios = require('axios');
const cheerio = require('cheerio');

/**
 * APPLE MUSIC SEARCH SCRAPER
 * @creator AgungDevX
 * @description Scrape lagu ti Apple Music tanpa API Key
 */
async function scrapeAppleMusic(query, region = 'id') {
    const url = `https://music.apple.com/${region}/search?term=${encodeURIComponent(query)}`;
    
    try {
        const { data } = await axios.get(url, {
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        // Nyokot data tina elemen pencarian Apple
        $(".top-search-lockup, .shelf-grid__item").each((i, el) => {
            const title = $(el).find(".top-search-lockup__primary__title, .product-lockup__title").text().trim();
            const artist = $(el).find(".top-search-lockup__secondary, .product-lockup__subtitle").text().trim();
            const link = $(el).find("a.click-action, a.product-lockup__link").attr("href");
            const image = $(el).find("picture source").attr("srcset")?.split(" ")[0] 
                          || $(el).find("img").attr("src");

            if (title && artist && link) {
                results.push({
                    title,
                    artist,
                    link: link.startsWith("http") ? link : `https://music.apple.com${link}`,
                    image: image || null
                });
            }
        });

        return {
            status: true,
            creator: "AgungDevX",
            data: results.slice(0, 10) // Ambil 10 teratas biar gak kepanjangan di WA
        };

    } catch (err) {
        return {
            status: false,
            creator: "AgungDevX",
            error: err.message
        };
    }
}

// --- TESTER TERMUX ---
const q = process.argv.slice(2).join(' ') || "duka";
const reg = "id"; // Default Indonesia

scrapeAppleMusic(q, reg).then(res => {
    process.stdout.write(JSON.stringify(res, null, 2));
});

/**
*** Hasil Json' 
***
{
  "status": true,
  "creator": "AgungDevX",
  "data": [
    {
      "title": "Duka",
      "artist": "Song · Last Child",
      "link": "https://music.apple.com/id/album/duka/1160727993?i=1160728286",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/dc/24/d7/dc24d7ba-e8ae-610b-13d8-399072b0daa1/Last-Child-Duka.jpg/110x110bb.webp"
    },
    {
      "title": "Last Child",
      "artist": "Artist",
      "link": "https://music.apple.com/id/artist/last-child/936622002",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/76/dc/65/76dc65a2-3bbe-0e2d-4b86-ab7eeb43e42b/pr_source.png/110x110bb.webp"
    },
    {
      "title": "Duka",
      "artist": "Song · Last Child",
      "link": "https://music.apple.com/id/album/duka/1289128445?i=1289128519",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/4d/d7/72/4dd77239-b39c-b0f2-d29b-3a5cd1ea85c2/Cover_-_Surat_Cinta_Untuk_Starla.jpg/110x110bb.webp"
    },
    {
      "title": "DUKA",
      "artist": "Song · Happy Asmara",
      "link": "https://music.apple.com/id/album/duka/1630093558?i=1630093810",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/ec/a8/0a/eca80afe-2efb-b662-b12c-71df878e1f8d/cover.jpg/110x110bb.webp"
    },
    {
      "title": "Duka",
      "artist": "Song · Knuckle Bones",
      "link": "https://music.apple.com/id/album/duka/1671659493?i=1671659494",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/b5/87/3c/b5873cac-d1c0-03e6-2024-4916f5d466b4/198015656623.jpg/110x110bb.webp"
    },
    {
      "title": "Last Child Essentials",
      "artist": "Playlist · Apple Music Indonesian Music",
      "link": "https://music.apple.com/id/playlist/last-child-essentials/pl.40921cbcdc0c4d948811d0dd6edd2595",
      "image": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/76/dc/65/76dc65a2-3bbe-0e2d-4b86-ab7eeb43e42b/pr_source.png/110x110SC.FPESS04.webp?l=en-GB"
    }
  ]
}
**/