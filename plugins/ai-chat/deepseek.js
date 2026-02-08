import deepinfra from '#scrape/deepinfra.js';

export default {
    name: "deepseek",
    category: "ai-chat",
    command: ["deepseek", "dipsek"],
    run: async (conn, m) => {
        const input = m.isQuoted ? m.quoted.text : m.text;
        if (!input) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        conn.deepseek ??= {};
        if (!conn.deepseek[m.sender]) conn.deepseek[m.sender] = [];
        conn.deepseek[m.sender].push({ role: 'user', content: input });

        try {
            const res = await deepinfra('deepseek-ai/DeepSeek-V3.1', conn.deepseek[m.sender]);
            conn.deepseek[m.sender].push({ role: 'assistant', content: res });
            m.reply(res)
        } catch (err) {
            m.reply('Terjadi Kesalahan')
            console.error(err);
        }
    }
};
