const axios = require('axios');

async function simpleWikiScrape(searchTerm) {
    console.log(`🔍 Cari: ${searchTerm}`);
    
    // User Agent yang work
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json'
    };
    
    try {
        // 1. Cari dulu
        const searchRes = await axios.get(
            'https://id.wikipedia.org/w/api.php',
            {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: searchTerm,
                    format: 'json',
                    srlimit: 3
                },
                headers
            }
        );
        
        const results = searchRes.data.query.search;
        if (!results || results.length === 0) {
            return { error: 'Tidak ditemukan' };
        }
        
        const pageTitle = results[0].title;
        
        // 2. Ambil ringkasan saja (lebih mudah)
        const pageRes = await axios.get(
            'https://id.wikipedia.org/w/api.php',
            {
                params: {
                    action: 'query',
                    titles: pageTitle,
                    prop: 'extracts|info',
                    exintro: 1,
                    explaintext: 1,
                    inprop: 'url',
                    format: 'json'
                },
                headers
            }
        );
        
        const pages = pageRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        // 3. Hasil sederhana
        return {
            status: 'success',
            title: page.title,
            url: page.fullurl,
            summary: page.extract,
            search_results: results.map(r => ({
                title: r.title,
                snippet: r.snippet
            }))
        };
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        
        // Fallback: Gunakan Wikipedia mobile
        try {
            const mobileRes = await axios.get(
                `https://id.m.wikipedia.org/wiki/${encodeURIComponent(searchTerm)}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Mobile Safari/537.36'
                    }
                }
            );
            
            return {
                status: 'mobile_fallback',
                title: searchTerm,
                url: `https://id.m.wikipedia.org/wiki/${encodeURIComponent(searchTerm)}`,
                note: 'Diambil dari versi mobile'
            };
            
        } catch (mobileError) {
            return {
                status: 'error',
                error: mobileError.message
            };
        }
    }
}

// Jalankan
const search = process.argv[2] || 'Jokowi';
simpleWikiScrape(search).then(result => {
    console.log(JSON.stringify(result, null, 2));
});

/**
*** Versi 2
***
const axios = require('axios');

/**
 * WIKIPEDIA SCRAPER ULTRA DETAIL
 * Ngala sakabeh eusi artikel dumasar kana bab (sections)
 */
async function wikiDeepSearch(judul) {
    try {
        const res = await axios.get('https://id.wikipedia.org/w/api.php', {
            params: {
                action: 'parse',
                format: 'json',
                page: judul,
                prop: 'text|images|sections|displaytitle',
                formatversion: 2,
                redirects: true
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
            }
        });

        if (res.data.error) throw new Error("Artikelna euweuh, pariksa deui judulna lur!");

        let html = res.data.parse.text;

        // --- PROSES MEMBERSIHKAN HTML AGAR JADI TEKS BERSIH ---
        // Miceun tabel, gaya, jeung elemen navigasi rungsing
        html = html.replace(/<table[^>]*>[\s\S]*?<\/table>/g, '');
        html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
        html = html.replace(/<div class="toc"[^>]*>[\s\S]*?<\/div>/g, '');
        html = html.replace(/<div class="hatnote"[^>]*>[\s\S]*?<\/div>/g, '');
        
        // Ngabersihan tag HTML tapi nahan struktur paragraf
        let cleanText = html
            .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/g, '\n\n=== $2 ===\n') // Judul bab jadi === Judul ===
            .replace(/<p[^>]*>/g, '\n') // Ganti tag p jadi baris anyar
            .replace(/<[^>]*>/g, '') // Miceun sesa tag
            .replace(/&[a-z0-9#]+;/gi, '') // Miceun entitas karakter
            .replace(/\[\d+\]|\[[a-z]\]/g, ''); // Miceun rujukan sitasi [1], [a], jsb.

        // Rapikeun spasi nu kaleuleuwihi
        const finalArticle = cleanText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n');

        return {
            status: true,
            creator: "AgungDevX",
            result: {
                title: res.data.parse.title,
                pageid: res.data.parse.pageid,
                total_sections: res.data.parse.sections.length,
                article: finalArticle, // Ieu eusina bakal panjang pisan
                images: res.data.parse.images.map(img => `https://id.wikipedia.org/wiki/Istimewa:Cari_Media?search=${img}`)
            }
        };

    } catch (err) {
        return { status: false, msg: err.message };
    }
}

// TESTER
const q = process.argv[2] || "Kota Bandung";
wikiDeepSearch(q).then(hasil => {
    console.log(JSON.stringify(hasil, null, 2));
});
**/