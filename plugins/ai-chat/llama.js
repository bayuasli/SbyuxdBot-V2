import deepinfra from '#scrape/deepinfra.js';

export default {
    name: "llama",
    category: "ai-chat",
    command: ["llama", "meta", "metaai"],
    run: async (conn, m) => {
        const input = m.isQuoted ? m.quoted.text : m.text;
        if (!input) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        conn.llama ??= {};
        if (!conn.llama[m.sender]) conn.llama[m.sender] = [];
        conn.llama[m.sender].push({ role: 'user', content: input });

        try {
            const res = await deepinfra('meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', conn.llama[m.sender]);
            conn.llama[m.sender].push({ role: 'assistant', content: res });
            m.reply(res)
        } catch (err) {
            m.reply('Terjadi Kesalahan')
            console.error(err);
        }
    }
};
