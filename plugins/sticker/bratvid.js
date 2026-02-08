export default {
    name: "bratvid",
    category: "sticker",
    command: ["bratvid", "bratvideo"],
    run: async (conn, m, { Api }) => {
        if (!m.text) return m.reply('Masukkan teks yang valid!')

        try {
            let res = await Api.request('brat', '/api/bratvid', { text: m.text.trim() })
            conn.sendSticker(m.chat, res.URL, m)
        } catch (err) {
            console.error('Error:', err)
            m.reply('Gagal Membuat Sticker')
        }
    }
};