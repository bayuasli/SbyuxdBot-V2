import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function(versi, history) {
    const apikey = await getApikey2()
    const res = await axios.post("https://api.openai.com/v1/responses", {
        model: versi,
        input: JSON.stringify(history),
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apikey
        }
    });

    let teks = [];
    for (let out of res.data.output) {
        if (out.content) {
            for (let c of out.content) {
                if (c.type === "output_text") teks.push(c.text);
            }
        }
    }
    return teks.join("\n");
}

async function getApikey() {
    try {
        let { data } = await axios.get("https://overchat.ai/image/ghibli");
        let key = data.match(/sk-proj-[A-Za-z0-9_\-]{80,}/);
        return key ? key[0] : null;
    } catch {
        return null;
    }
}

async function getApikey2() {
    try {
        const anu = await axios.get('https://chatgpt5free.com/chat/')
        const $ = cheerio.load(anu.data)
        let key;
        $('script').each((i, el) => {
            let html = $(el).html()
            let src = html.match(/sk-proj-[A-Za-z0-9_\-]{80,}/);
            if (src) key = src ? src[0] : null
        })
        return key
    } catch {
        return null
    }
}