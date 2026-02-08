import fs from 'fs';

export default {
    name: "dfp",
    category: "owner",
    command: ["dfp", "deleteplugin"],
    settings: {
        owner: true
    },
    run: async (conn, m) => {
        if (!m.text) return m.reply(`Nama filenya??\nContoh: ${m.cmd} folder/namafile`);
        let path = './plugins/' + m.text + '.js'
        
        if (!fs.existsSync(path)) {
            return m.reply(`File ${path} tidak ditemukan!`)
        }
        
        try {
            fs.unlinkSync(path)
            m.reply(`Berhasil menghapus plugin: ${path}`)
        } catch (err) {
            m.reply(`Gagal menghapus file!\nError: ${err.message}`)
        }
    }
}
