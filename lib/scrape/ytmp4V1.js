const axios = require('axios');

/**
 * YouTube Downloader Scraper
 * @author AgungDevX
 */
async function ytdl(url, quality = '720') {
   try {
      // pariksa heula linkna bisi lain ti youtube
      if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
         return { author: 'AgungDevX', status: false, msg: 'Mana link youtubena anjing?!' };
      }

      // nembak api host optikl
      const { data } = await axios.get(`https://host.optikl.ink/download/youtube`, {
         params: {
            url: url,
            format: quality
         }
      });

      // mun statusna false hartina api keur error
      if (!data.status) return { author: 'AgungDevX', status: false, msg: 'Gagal nyokot video, cobaan deui engke!' };

      // balikkeun json profesional
      return {
         author: 'AgungDevX',
         status: true,
         result: {
            title: data.result.title,
            type: data.result.type,
            quality: data.result.quality,
            thumbnail: data.result.thumbnail,
            duration: data.result.duration + ' Seconds',
            url: data.result.download
         }
      };
   } catch (e) {
      // mun modar di jalan asupna kadieu
      return { author: 'AgungDevX', status: false, msg: e.message };
   }
}

// gaskeun tés di termux
const link = 'https://youtube.com/watch?v=ABvrMvr4qPM';
ytdl(link).then(res => console.log(JSON.stringify(res, null, 2)));
