/* Threads Downloader (savethr.com)
   Update: 14 Juli 2025
   Owner : AgungDevx
*/

const axios = require("axios");
const cheerio = require("cheerio");

const threadsDL = async (url) => {
    try {
        const form = new URLSearchParams();
        form.append("id", url);
        form.append("locale", "en");

        // Request make HX-Headers meh teu kanyahoan bot
        const { data } = await axios.post("https://savethr.com/process", form, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "HX-Request": "true",
                "HX-Target": "result-container",
                "HX-Current-URL": "https://savethr.com/",
            },
        });

        const $ = cheerio.load(data);
        
        // Cokot data tina elemen HTML
        const result = {
            status: true,
            owner: "AgungDevx",
            result: {
                user: $(".font-semibold.text-gray-900.text-sm").first().text().trim(),
                profilePic: $(".w-12.h-12.rounded-full").attr("src"),
                preview: $(".w-full.h-40.object-cover").attr("src"),
                download: $("a.download_link").attr("href"),
                direct: $("a[target='_blank']").last().attr("href")
            }
        };

        if (!result.result.download) throw new Error("Link teu kapanggih");
        return result;

    } catch (err) {
        return { 
            status: false, 
            owner: "AgungDevx", 
            msg: err.message 
        };
    }
}

// Pamakean
const url = "https://www.threads.com/@dagelanviral/post/DQae85Ckgkq";
threadsDL(url)
    .then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(console.error);
