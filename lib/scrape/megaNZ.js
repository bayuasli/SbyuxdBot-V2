const axios = require("axios");
const CryptoJS = require("crypto-js");

/**
 * MEGA.NZ Professional Scraper (Fixed Decryption)
 * @creator AgungDevX
 */
const mega = {
    // Fungsi dekripsi atribut nu leuwih stabil
    decryptAttr: (enc, fileKey) => {
        try {
            const ab = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), 'base64');
            const kResult = ab(fileKey);
            
            // Perbaikan pola XOR keur Key Mega
            const k = new Uint32Array(kResult.buffer);
            const key = new Uint32Array([k[0] ^ k[4], k[1] ^ k[5], k[2] ^ k[6], k[3] ^ k[7]]);
            
            const keyWA = CryptoJS.lib.WordArray.create(new Uint8Array(key.buffer));
            const ivWA = CryptoJS.lib.WordArray.create(new Uint8Array(16)); // IV enol
            const cipherWA = CryptoJS.lib.WordArray.create(ab(enc));

            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: cipherWA },
                keyWA,
                { iv: ivWA, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
            );

            const str = CryptoJS.enc.Utf8.stringify(decrypted);
            // Mega nyimpen data dina format 'MEGA{"n":"name"}'
            const startIdx = str.indexOf('{"n"');
            const endIdx = str.lastIndexOf('}');
            
            if (startIdx === -1) throw new Error("Format JSON teu kapanggih");
            
            return JSON.parse(str.substring(startIdx, endIdx + 1));
        } catch (e) { 
            return { n: "[Decryption Error: " + e.message + "]" }; 
        }
    },

    fetch: async (url) => {
        try {
            const fileId = url.match(/file\/([a-zA-Z0-9_-]+)/)?.[1];
            const fileKey = url.split('#')[1];

            if (!fileId || !fileKey) throw new Error("URL Mega teu valid!");

            // Ngagunakeun domain .nz ameh leuwih aman tina blokir
            const { data } = await axios.post("https://g.api.mega.co.nz/cs", [{ a: "g", g: 1, p: fileId }], {
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 10000
            });

            if (!data || data[0] === -1 || typeof data[0] === 'number') {
                throw new Error(`Mega Server Error (Code: ${data ? data[0] : 'Unknown'})`);
            }

            const info = data[0];
            const attr = mega.decryptAttr(info.at, fileKey);

            return {
                status: true,
                creator: "AgungDevX",
                data: {
                    filename: attr.n || "Unknown File",
                    size: info.s,
                    size_formatted: (info.s / (1024 * 1024)).toFixed(2) + " MB",
                    download_url: info.g
                }
            };
        } catch (err) {
            return { status: false, creator: "AgungDevX", message: err.message };
        }
    }
};

// --- TESTER ---
const testerUrl = "https://mega.nz/file/ovJTHaQZ#yAbkrvQgykcH_NDKQ8eIc0zvsN7jonBbHZ_HTQL6lZ8";
mega.fetch(testerUrl).then(res => console.log(JSON.stringify(res, null, 2)));

// Hasil Json'
/**
{
  "status": true,
  "creator": "AgungDevX",
  "data": {
    "filename": "[Decryption Error]",
    "size": 16577997,
    "size_formatted": "15.81 MB",
    "download_url": "http://gfs208n120.userstorage.mega.co.nz/dl/bwEl-5OpmuD4CQJCgRLe7qRy9FHDq24itCbR840wtInWuga5lLyTiKvT9SV7dXL4AQE8ITvKPdbBdYE9AZzFfrzgx2RgDskSzjzMOHC5LBsEuoI-uuy99PYyB8OmCENsEwcyH4uTogO_bA3edFOLBWC5HZv7I6ZfloBr8a5DNTEYmdLLyL3ts5qwXS1tIkfGLCVbXZFQZ2s2IUytYfzTFEKiESf8Ku5g3k-ILhZaoNP_ZzewTm7wkLpE1w"
  }
}
**/