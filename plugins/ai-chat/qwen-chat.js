import deepinfra from '#scrape/deepinfra.js';

export default {
    name: "qwen",
    category: "ai-chat",
    command: ["qwen", "qwen3"],
    run: async (conn, m) => {
        const input = m.isQuoted ? m.quoted.text : m.text;
        if (!input) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        conn.qwenChat ??= {};
        if (!conn.qwenChat[m.sender]) conn.qwenChat[m.sender] = [];
        conn.qwenChat[m.sender].push({ role: 'user', content: input });

        try {
            const res = await deepinfra('Qwen/Qwen3-30B-A3B', conn.qwenChat[m.sender]);
            conn.qwenChat[m.sender].push({ role: 'assistant', content: res });
            m.reply(res)
        } catch (err) {
            m.reply('Terjadi Kesalahan')
            console.error(err);
        }
    }
};
