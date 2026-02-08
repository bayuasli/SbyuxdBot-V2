import axios from 'axios';

export default async function(model, history) {
    try {
        const res = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', {
            model,
            messages: history
        }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'Content-Type': 'application/json'
            },
        });

        let teks = [];
        for (let out of res.data.choices || []) {
            if (out.message?.content) teks.push(out.message.content);
        }
        return teks.join('\n');
    } catch (e) {
        return e?.response?.data || e?.message;
    }
}