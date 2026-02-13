const axios = require('axios');
const cheerio = require('cheerio');
const { zencf } = require('zencf'); 

/**
 * SCRAPER APPLE MUSIC - JSON OUTPUT
 * @creator AgungDevX
 */
async function appleDownloader(url) {
    try {
        console.log("[-] Nyobian bypass Turnstile...");
        
        // 1. Ngagunakeun turnstileMin (Gancang & Hampang)
        const { token } = await zencf.turnstileMin(
            'https://aplmate.com/', 
            '0x4AAAAAABdqfzl6we62dQyp'
        );
        
        if (!token) throw new Error("Gagal meunangkeun token bypass!");
        console.log("[+] Bypass Berhasil!");

        const base = "https://aplmate.com";
        const headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            "Origin": base,
            "Referer": base + "/"
        };

        // 2. Nyokot CSRF & Session
        const home = await axios.get(base, { headers });
        const $h = cheerio.load(home.data);
        const csrfInput = $h("input[type='hidden']").filter((i, el) => $h(el).attr("name")?.startsWith("_"));
        const csrfName = csrfInput.attr("name");
        const csrfValue = csrfInput.attr("value");
        const session = home.headers["set-cookie"]?.[0]?.split(';')[0] || "";

        // 3. POST ka /action (Multipart Form)
        const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        let formData = `--${boundary}\r\nContent-Disposition: form-data; name="url"\r\n\r\n${url}\r\n`;
        formData += `--${boundary}\r\nContent-Disposition: form-data; name="${csrfName}"\r\n\r\n${csrfValue}\r\n`;
        formData += `--${boundary}\r\nContent-Disposition: form-data; name="cf-turnstile-response"\r\n\r\n${token}\r\n--${boundary}--\r\n`;

        const action = await axios.post(`${base}/action`, formData, {
            headers: { 
                ...headers, 
                "Content-Type": `multipart/form-data; boundary=${boundary}`, 
                "Cookie": session 
            }
        });

        // 4. Parsing response HTML tina JSON
        const $res = cheerio.load(action.data.html || action.data);
        const trackData = {
            data: $res("input[name='data']").attr("value"),
            base: $res("input[name='base']").attr("value"),
            token: $res("input[name='token']").attr("value")
        };

        if (!trackData.data) throw new Error("Data track teu kapanggih dina response!");

        // 5. POST Final ka /action/track
        const tBoundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
        let tForm = `--${tBoundary}\r\nContent-Disposition: form-data; name="data"\r\n\r\n${trackData.data}\r\n`;
        tForm += `--${tBoundary}\r\nContent-Disposition: form-data; name="base"\r\n\r\n${trackData.base}\r\n`;
        tForm += `--${tBoundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${trackData.token}\r\n--${tBoundary}--\r\n`;

        const final = await axios.post(`${base}/action/track`, tForm, {
            headers: { 
                ...headers, 
                "Content-Type": `multipart/form-data; boundary=${tBoundary}`, 
                "Cookie": session 
            }
        });

        const $f = cheerio.load(final.data.data || final.data);

        // BALIKKEUN HASIL JSON
        return {
            status: true,
            creator: "AgungDevX",
            result: {
                title: $res(".aplmate-downloader-middle h3 div").text().trim(),
                artist: $res(".aplmate-downloader-middle p span").text().trim(),
                image: $res(".aplmate-downloader-left img").attr("src"),
                download: {
                    mp3: base + $f("a:contains('Download Mp3')").attr("href"),
                    cover: base + $f("a:contains('Download Cover')").attr("href")
                }
            }
        };

    } catch (err) {
        return { status: false, creator: "AgungDevX", message: err.message };
    }
}

// TESTER
const testUrl = "https://music.apple.com/id/album/duka/1160727993?i=1160728286";
appleDownloader(testUrl).then(res => console.log(JSON.stringify(res, null, 2)));

/**
*** Hasil Json'
***
[-] Nyobian bypass Turnstile...
[+] Bypass Berhasil!
{
  "status": true,
  "creator": "AgungDevX",
  "result": {
    "title": "Duka",
    "artist": "Last Child",
    "image": "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/dc/24/d7/dc24d7ba-e8ae-610b-13d8-399072b0daa1/Last-Child-Duka.jpg/1200x630bb.jpg",
    "download": {
      "mp3": "https://aplmate.com/dl?token=eyJ1cmwiOiJObXR1WjJrM2IxbE5UV0ZLU1ZoVlRYWm5halp4YXpnd1ZuZE1NbnBFVkVnck9EbFFVMGhHVVhOSU5VNU1Ua2hKTlRkVFpVbG9MMEpUZFZrek1ERnVWQT09IiwibmFtZSI6IkR1a2EgLSBMYXN0IENoaWxkIiwiZXhwaXJ5IjoxNzcwNTI5MTQ2fQ%3D%3D.d71b9590290fc43f525dc55876692eed282f04f36733e7f81d5042933d51cda4",
      "cover": "https://aplmate.com/dl?token=eyJ1cmwiOiJPV1JKVUhReVZubExWRlZrWjJkT05uaERSVXhpYlZkNlNFd3lWRGQ0T1Vab1dISm1USFJ0TURRdlVIVXZaa0ZMYmxKVmRrOVFNazFUUjFKWldVNXBWa1V2TjA5bGNTczFTMjFWTUU1aFpsSTFSbXc1V0RCbmFWSm5OMHc0VERKMFNUaFZSMnBpWTFoVk9VTkJNVUZuUVV4elVUa3pia1pNWTJGdGJXd3hjMmxPY1VKNlRFWjNhbUZzUjNCRFMwa3ZWbmhWWTFZck5tSXZVWGhvY1hCNFEzQmxRazltSzFWeFRWRXpaMWd5U0RKVGNVdHViMVU0ZWtrME1GbzBWMWt6IiwibmFtZSI6IkR1a2EgLSBMYXN0IENoaWxkIiwiZXhwaXJ5IjoxNzcwNTI5MTQ2fQ%3D%3D.6bbea1820d687cf258c7325079b3a7e100a1f43c546155d0fb574bbb4f14478d"
    }
  }
}
**/