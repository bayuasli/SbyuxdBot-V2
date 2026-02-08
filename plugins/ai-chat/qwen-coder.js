import deepinfra from '#scrape/deepinfra.js';

export default {
    name: "qwen-coder",
    category: "ai-chat",
    command: ["qwen-coder", "qwencoder", "qcoder"],
    run: async (conn, m) => {
        const input = m.isQuoted ? m.quoted.text : m.text;
        if (!input) return m.reply(`Masukkan pertanyaan atau perintah!\n\nContoh:\n${m.cmd} apa itu AI`);

        conn.qwenCoder ??= {};
        if (!conn.qwenCoder[m.sender]) conn.qwenCoder[m.sender] = [];
        conn.qwenCoder[m.sender].push({ role: 'user', content: input });

        try {
            const res = await deepinfra('Qwen/Qwen3-Coder-480B-A35B-Instruct', conn.qwenCoder[m.sender]);
            conn.qwenCoder[m.sender].push({ role: 'assistant', content: res });
            m.reply(res)
        } catch (err) {
            m.reply('Terjadi Kesalahan')
            console.error(err);
        }
    }
};
