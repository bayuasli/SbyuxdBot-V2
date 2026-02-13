const axios = require('axios');

class AllInOneDownloader {
  constructor() {
    this.baseURL = 'https://allinonedownloader.com';
    this.endpoint = '/system/3c829fbbcf0387c.php';
  }

  async download(url) {
    const headers = {
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': 'PHPSESSID=8367e29121fc8693ddf09840eaf9a645; _gid=GA1.2.897919413.1770899682; crs_ALLINONEDOWNLOADER_COM=blah; popFirst=blah; _ga_BKWXCG81DF=GS2.1.s1770899681$o1$g1$t1770899775$j56$l0$h0; _ga=GA1.1.751815724.1770899682',
      'origin': this.baseURL,
      'referer': `${this.baseURL}/`,
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    };

    const payload = new URLSearchParams({
      url: url,
      token: 'ac98e0708b18806a7e0aedaf8bfd135b9605ce9e617aebbdf3118d402ae6f15f',
      urlhash: '/EW6oWxKREb5Ji1lQRgY2f4FkImCr6gbFo1HX4VAUuiJrN+7veIcnrr+ZrfMg0Jyo46ABKmFUhf2LpwuIxiFJZZObl9tfJG7E9EMVNIbkNyiqCIdpc61WKeMmmbMW+n6'
    });

    const response = await axios.post(`${this.baseURL}${this.endpoint}`, payload.toString(), { headers });
    return response.data;
  }
}