const axios = require('axios');

class RecapioClient {
    constructor(videoUrl) {
        this.videoUrl = videoUrl;
        this.videoId = this.extractVideoId(videoUrl);
        this.fingerprint = Buffer.from(Date.now().toString()).toString('base64');
        this.baseUrl = 'https://api.recapio.com';
        this.headers = {
            authority: 'api.recapio.com',
            'accept-language': 'id-ID,id;q=0.9',
            origin: 'https://recapio.com',
            referer: 'https://recapio.com/',
            'sec-ch-ua': '"Chromium";v="132"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
            'x-app-language': 'en',
            'x-device-fingerprint': this.fingerprint
        };
    }

    extractVideoId(url) {
        const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return match ? match[1] : null;
    }

    async initiate() {
        try {
            const response = await axios.post(
                `${this.baseUrl}/youtube-chat/initiate`,
                { url: this.videoUrl },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Initiate failed: ${error.message}`);
        }
    }

    async checkStatus(slug) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/youtube-chat/status/by-slug/${slug}`,
                {
                    params: { fingerprint: this.fingerprint },
                    headers: this.headers
                }
            );

            if (response.data?.transcript) {
                response.data.transcript = JSON.parse(response.data.transcript);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`);
        }
    }

    async start() {
        try {
            console.log('Starting process...');
            const init = await this.initiate();
            console.log('Init successful');

            const status = await this.checkStatus(init.slug);
            console.log('Status retrieved');

            return {
                info: init,
                slug_ai: status
            };
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(prompt) {
        try {
            console.log('Sending prompt...');

            const response = await axios.post(
                `${this.baseUrl}/youtube-chat/message`,
                {
                    message: prompt,
                    video_id: this.videoId,
                    fingerprint: this.fingerprint
                },
                {
                    headers: {
                        ...this.headers,
                        accept: 'text/event-stream',
                        'content-type': 'application/json'
                    },
                    responseType: 'text'
                }
            );

            let result = '';
            const lines = response.data.split('\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = line.slice(5).trim();
                        if (data) {
                            const chunk = JSON.parse(data);
                            result += chunk.chunk || '';
                        }
                    } catch {
                        continue;
                    }
                }
            }

            return result;
        } catch (error) {
            throw new Error(`Message failed: ${error.message}`);
        }
    }

    async getSummary() {
        try {
            const videoData = await this.start();

            const summary = await this.sendMessage(
                'Extract the most important bullet points from this video, organized in a clear, structured format.'
            );

            return {
                success: true,
                video: {
                    id: videoData.info.id,
                    title: videoData.info.title,
                    duration: videoData.info.duration,
                    slug: videoData.info.slug,
                    thumbnail: videoData.info.thumbnail_url
                },
                summary: summary.trim(),
                transcript: videoData.slug_ai.transcript
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

async function main() {
    try {
        const recapio = new RecapioClient('https://youtube.com/watch?v=2y1OxYwvkhY');
        
        console.log('Fetching video summary...');
        const result = await recapio.getSummary();

        if (result.success) {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(JSON.stringify(result, null, 2));
        }

    } catch (error) {
        const errorResult = {
            success: false,
            error: error.message
        };
        console.log(JSON.stringify(errorResult, null, 2));
    }
}

if (require.main === module) {
    main();
}

module.exports = RecapioClient;