const axios = require('axios');

async function teraboxdl(url) {
    try {
        if (!url.includes('/s/') && !url.includes('surl')) throw new Error('Invalid url.');
        
        const { data: cf } = await axios.post('https://api.nekolabs.web.id/tools/bypass/cf-turnstile', {
            url: 'https://teraboxdl.site/',
            siteKey: '0x4AAAAAACG0B7jzIiua8JFj'
        });
        
        if (!cf?.result) throw new Error('Failed to get cf token.');
        
        const { data } = await axios.post('https://teraboxdl.site/api/proxy', {
            url: url,
            cf_token: cf.result
        }, {
            headers: {
                origin: 'https://teraboxdl.site',
                referer: 'https://teraboxdl.site/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}