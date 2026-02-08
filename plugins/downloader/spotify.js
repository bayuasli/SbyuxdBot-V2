/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "spotify",
  category: "downloader",
  command: ["spotify"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: true
  },

  run: async (conn, m, context) => {
    const { Func } = context;
    
    if (!m.text) {
      return m.reply(`Contoh penggunaan:\n${m.prefix}spotify night changes one direction\n${m.prefix}spotify https://open.spotify.com/track/...`);
    }

    try {
      const bearerToken = await getToken();
      
      let audioBuffer;

      if (/spotify\.com\/track\//i.test(m.text)) {
        const trackId = m.text.split('/track/')[1].split('?')[0];
        audioBuffer = await downloadSpotify(trackId, bearerToken);
        
      } else if (/^[a-zA-Z0-9]{22}$/.test(m.text)) {
        audioBuffer = await downloadSpotify(m.text, bearerToken);
        
      } else {
        const searchResults = await searchSpotify(m.text, bearerToken);
        
        if (!searchResults?.tracks?.length) {
          return m.reply('❌ Tidak ditemukan hasil untuk pencarian tersebut.');
        }

        const firstTrack = searchResults.tracks[0];
        m.reply(`🎵 *${firstTrack.title}* - ${firstTrack.artists}\n⏳ Mengunduh audio...`);
        
        audioBuffer = await downloadSpotify(firstTrack.id, bearerToken);
      }

      if (!audioBuffer || audioBuffer.length === 0) {
        return m.reply('❌ Gagal mengunduh audio. Coba lagi nanti.');
      }

      const filename = `spotify_${Date.now()}.mp3`;
      await conn.sendMessage(
        m.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: filename,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('[SPOTIFY PLUGIN ERROR]', error);
      m.reply('❌ Terjadi kesalahan saat memproses permintaan.');
    }
  }
};

import axios from 'axios';
import { zencf } from 'zencf';

async function getToken() {
  try {
    const { token } = await zencf.turnstileMin(
      'https://spotidownloader.com/en13',
      '0x4AAAAAAA8QAiFfE5GuBRRS'
    );

    const response = await axios.post(
      'https://api.spotidownloader.com/session',
      { token },
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
          'content-type': 'application/json',
          origin: 'https://spotidownloader.com',
          referer: 'https://spotidownloader.com/'
        }
      }
    );

    return response.data.token;
  } catch (error) {
    console.error('[TOKEN ERROR]', error);
    throw new Error('Gagal mendapatkan token akses');
  }
}

async function searchSpotify(query, bearerToken) {
  try {
    const response = await axios.post(
      'https://api.spotidownloader.com/search',
      { query },
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
          'content-type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
          origin: 'https://spotidownloader.com',
          referer: 'https://spotidownloader.com/'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('[SEARCH ERROR]', error);
    throw new Error('Gagal melakukan pencarian');
  }
}

async function downloadSpotify(id, bearerToken) {
  try {
    const response = await axios.post(
      'https://api.spotidownloader.com/download',
      { id },
      {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
          'content-type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
          origin: 'https://spotidownloader.com',
          referer: 'https://spotidownloader.com/'
        }
      }
    );

    const audioResponse = await axios.get(response.data.link, {
      responseType: 'arraybuffer',
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        authorization: `Bearer ${bearerToken}`,
        origin: 'https://spotidownloader.com',
        referer: 'https://spotidownloader.com/'
      }
    });

    return Buffer.from(audioResponse.data);
  } catch (error) {
    console.error('[DOWNLOAD ERROR]', error);
    throw new Error('Gagal mengunduh audio');
  }
}