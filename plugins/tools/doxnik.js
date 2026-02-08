import axios from 'axios';
import moment from 'moment-timezone';

/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "doxnik",
  category: "tools",
  command: ["doxnik"],
  alias: [],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    const { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin } = context;

    const text = m.text?.trim();
    if (!text) {
      return conn.sendMessage(m.chat, { text: 'Contoh: .doxnik 6203011408000006' }, { quoted: m });
    }

    try {
      if (!/^\d{16}$/.test(text)) {
        return conn.sendMessage(m.chat, { text: '❌ Format NIK tidak valid (16 digit angka)' }, { quoted: m });
      }

      const provId = text.substring(0, 2);
      const kabId = text.substring(0, 4);
      const kecId = text.substring(0, 6);
      const kodePos = text.substring(12, 16);
      const kelaminKode = parseInt(text.substring(6, 8));
      const tanggal = kelaminKode > 40 ? kelaminKode - 40 : kelaminKode;
      const bulan = parseInt(text.substring(8, 10));
      const tahun = parseInt(text.substring(10, 12));
      const kelamin = kelaminKode > 40 ? 'Perempuan' : 'Laki-Laki';
      const tahunLahir = tahun < 25 ? 2000 + tahun : 1900 + tahun;
      const tanggalLahir = moment(`\( {tahunLahir}- \){bulan}-${tanggal}`, 'YYYY-MM-DD').format('DD-MM-YYYY');

      const [provRes, kabRes, kecRes] = await Promise.all([
        axios.get('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json'),
        axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provId}.json`),
        axios.get(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${kabId}.json`)
      ]);

      const provinsi = provRes.data.find(p => p.id == provId)?.name || 'Tidak Diketahui';
      const kabupaten = kabRes.data.find(k => k.id == kabId)?.name || 'Tidak Diketahui';
      const kecamatan = kecRes.data.find(kc => kc.id == kecId)?.name || 'Tidak Diketahui';

      const hasil = `
✅ Success in Getting Info 📣

🔹 NIK: ${text}
🔹 Provinsi ID: ${provId}
🔹 Nama Provinsi: ${provinsi}
🔹 Kabupaten/Kota ID: ${kabId}
🔹 Nama Kabupaten/Kota: ${kabupaten}
🔹 Kecamatan ID: ${kecId}
🔹 Nama Kecamatan: ${kecamatan}
🔹 Kode Pos: ${kodePos}
🔹 Jenis Kelamin: ${kelamin}
🔹 Tanggal Lahir: ${tanggalLahir}
🔹 Uniqcode: ${kodePos}

👨‍💻 Bot Create By @𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱
`.trim();

      conn.sendMessage(m.chat, { text: hasil }, { quoted: m });

    } catch (err) {
      console.error(err);
      conn.sendMessage(m.chat, { text: '❌ Terjadi kesalahan saat memproses NIK. Pastikan format NIK benar atau server API sedang bermasalah.' }, { quoted: m });
    }
  }
};