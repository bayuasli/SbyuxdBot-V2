/** @type {import('#lib/types.js').Plugin} */
import axios from 'axios'

export default {
  name: "spotifysearch",
  category: "downloader",
  command: ["sps", "spotifys"],
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, { Func }) => {
    if (!m.text) return m.reply(`Contoh: ${m.prefix}sps joji slow dancing`)

    const query = encodeURIComponent(m.text)

    try {
      const { data } = await axios.get(
        `https://spotdown.org/api/song-details?url=${query}`,
        { headers: { Accept: 'application/json' } }
      )

      if (!data?.songs?.length) return m.reply('Lagu tidak ditemukan.')

      const songs = data.songs.slice(0, 5)

      let result = songs.map((v, i) => {
        return `*${i + 1}. ${v.title}*
👤 Artist : ${v.artist}
⏱️ Durasi : ${v.duration}
🔗 Link   : ${v.url}`
      }).join('\n\n')

      m.reply(`🎵 *Spotify Search Result*\n\n${result}`)

    } catch (e) {
      console.error(e)
      m.reply('Gagal ambil data lagu.')
    }
  }
}