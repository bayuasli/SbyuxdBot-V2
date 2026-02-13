const axios = require('axios');

async function claude3(question) {
    try {
        if (!question) throw new Error('Question is required.');
        
        const { data: html, headers } = await axios.get('https://minitoolai.com/Claude-3/');
        const { data: cf } = await axios.post('https://api.nekolabs.web.id/tls/bypass/cf-turnstile', {
            url: 'https://minitoolai.com/Claude-3/',
            siteKey: '0x4AAAAAABjI2cBIeVpBYEFi'
        });
        
        if (!cf?.result) throw new Error('Failed to get cf token.');
        
        const utoken = html.match(/var\s+utoken\s*=\s*"([^"]*)"/)?.[1];
        if (!utoken) throw new Error('Failed to get utoken.');
        
        const { data: task } = await axios.post('https://minitoolai.com/Claude-3/claude3_stream.php', new URLSearchParams({
            messagebase64img1: '',
            messagebase64img0: '',
            select_model: 'claude-3-haiku-20240307',
            temperature: '0.7',
            utoken: utoken,
            message: question,
            umes1a: '',
            bres1a: '',
            umes2a: '',
            bres2a: '',
            cft: encodeURIComponent(cf.result)
        }).toString(), {
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                cookie: headers['set-cookie'].join('; '),
                'origin': 'https://minitoolai.com',
                'referer': 'https://minitoolai.com/Claude-3/',
                'sec-ch-ua': '"Chromium";v="137", "Not(A)Brand";v="24"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        
        const { data } = await axios.get('https://minitoolai.com/Claude-3/claude3_stream.php', {
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                cookie: headers['set-cookie'].join('; '),
                'origin': 'https://minitoolai.com',
                'referer': 'https://minitoolai.com/Claude-3/',
                'sec-ch-ua': '"Chromium";v="137", "Not(A)Brand";v="24"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            },
            params: {
                streamtoken: task
            }
        });
        
        const result = data.split('\n').filter(line => line && line.startsWith('data: {')).map(line => JSON.parse(line.substring(6))).filter(line => line.type === 'content_block_delta').map(line => line.delta.text).join('');
        if (!result) throw new Error('No result found.');
        
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
}