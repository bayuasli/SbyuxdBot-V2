/**
 * By : AgungDEV
 * GitaGPT - Spiritual AI Scraper
 */

const axios = require('axios');

class GitaGPT {
  constructor() {
    this.host = 'https://gitagpt.org/api/ask/gita';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://gitagpt.org/',
      'Origin': 'https://gitagpt.org'
    };
  }

  /**
   * Fungsi nanya ka GitaGPT
   * @param {string} query - Pertanyaan maneh
   */
  async ask(query) {
    try {
      console.log(`[AgungDevx] Ngirim sual ka GitaGPT: "${query}"...`);
      
      const response = await axios.get(this.host, {
        params: {
          q: query,
          email: 'null',
          locale: 'en'
        },
        headers: this.headers
      });

      const res = response.data;

      if (!res.response) throw new Error("Teu meunang jawapan ti server!");

      return {
        status: true,
        author: "AgungDEV",
        data: {
          id: res.id,
          question: res.question,
          answer: res.response,
          spiritual_guide: "Lord Krishna / Gita AI"
        }
      };

    } catch (e) {
      return {
        status: false,
        author: "AgungDEV",
        error: e.message
      };
    }
  }
}

// ================= EKSEKUSI RAPIH =================
(async () => {
  const gita = new GitaGPT();
  const tanya = "Siapa presiden Indonesia saat ini?";

  const hasil = await gita.ask(tanya);

  // Nyitak JSON rapih muncraat
  console.log(JSON.stringify(hasil, null, 2));
})();
