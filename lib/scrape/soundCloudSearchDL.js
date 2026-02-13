const axios = require('axios');

/**
 * SoundCloud Search & Downloader
 * @author AgungDevX
 */
const soundcloud = {
   // fungsina keur neangan lagu
   search: async (query) => {
      try {
         if (!query) return { author: 'AgungDevX', status: false, msg: 'Asupkeun judul laguna anjing!' };
         const { data } = await axios.get(`https://host.optikl.ink/soundcloud/search?query=${encodeURIComponent(query)}`);
         return {
            author: 'AgungDevX',
            status: true,
            result: data
         };
      } catch (e) {
         // mun serverna ruksak modar didieu
         return { author: 'AgungDevX', status: false, msg: e.message };
      }
   },

   // fungsina keur nyokot link mp3
   download: async (url) => {
      try {
         if (!url) return { author: 'AgungDevX', status: false, msg: 'Mana link soundcloudna goblog?!' };
         const { data } = await axios.get(`https://host.optikl.ink/soundcloud/download?url=${encodeURIComponent(url)}`);
         return {
            author: 'AgungDevX',
            status: true,
            result: data
         };
      } catch (e) {
         return { author: 'AgungDevX', status: false, msg: e.message };
      }
   }
};

// --- CARA JALANKEUN DI TERMUX ---
(async () => {
   // 1. Test Search
   console.log('--- TEST SEARCH ---');
   const searchResult = await soundcloud.search('Sadrah');
   console.log(JSON.stringify(searchResult, null, 2));

   // 2. Test Download (ngagunakeun link ti hasil search kahiji)
   if (searchResult.status && searchResult.result.length > 0) {
      console.log('\n--- TEST DOWNLOAD ---');
      const dlResult = await soundcloud.download(searchResult.result[0].url);
      console.log(JSON.stringify(dlResult, null, 2));
   }
})();
