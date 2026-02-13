const axios = require('axios');
const fs = require('fs');

/**
 * ALTERARCHIVE SCRAPER - FINAL FIX
 * @description Ngabongkar Base64 tina JSON ameh gambar teu ruksak
 */
async function undressPro() {
    const input = './gambar.jpg';
    const output = '/sdcard/Download/result.jpg';

    try {
        if (!fs.existsSync(input)) throw new Error("File gambar.jpg euweuh!");

        // 1. Convert gambar lokal ka Base64
        const base64Payload = `data:image/png;base64,${fs.readFileSync(input).toString('base64')}`;

        console.log("[-] Nembak API AlterArchive...");

        // 2. Request dumasar inspect screenshot
        const res = await axios.post('https://alterarchive.vercel.app/api/undress', {
            value: base64Payload,
            key: "core"
        }, {
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'origin': 'https://alterarchive.vercel.app',
                'referer': 'https://alterarchive.vercel.app/alterdreams',
                // Trik saeutik jang ngakal limit (ngirim IP palsu)
                'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            }
        });

        // 3. Bongkar data (Ieu bagian nu ngajadikeun gambar TEU ruksak)
        if (res.data && res.data.success) {
            console.log("[+] Response Success! Ngolah data gambar...");

            // Nyokot string result (iVBORw...) terus robah jadi Buffer
            const base64Raw = res.data.result;
            const imgBuffer = Buffer.from(base64Raw, 'base64');

            // 4. Simpen hasilna
            const finalPath = fs.existsSync('/sdcard/Download') ? output : './result.jpg';
            fs.writeFileSync(finalPath, imgBuffer);

            console.log(`[+] MANTAP LUR! Gambar geus jadi: ${finalPath}`);
        } else {
            console.log("[!] API nolak, jigana limit deui:", res.data);
        }

    } catch (err) {
        if (err.response) {
            console.error(`[!] Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
            if (err.response.status === 429 || err.response.status === 500) {
                console.error("[!] Fix keuna limit daily lur, coba ganti jaringan/pake VPN!");
            }
        } else {
            console.error("[!] Error Script:", err.message);
        }
    }
}

// Jalankeun
undressPro();

/**
*** Hasil Json' buffer 
***
[-] Nembak API AlterArchive...
[+] Response Success! Ngolah data gambar...
[+] MANTAP LUR! Gambar geus jadi: /sdcard/Download/result.jpg
**/