const axios = require('axios');

class AgungDevXYTDownloader {
    constructor() {
        this.baseUrl = 'https://ht.flvto.online';
    }

    async download(videoId, format = 'mp3') {
        if (!videoId || typeof videoId !== 'string') {
            return { success: false, error: 'Video ID is required' };
        }

        if (!['mp3', 'mp4'].includes(format)) {
            return { success: false, error: 'Format must be mp3 or mp4' };
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/converter`,
                {
                    id: videoId,
                    fileType: format
                },
                {
                    headers: {
                        'accept-encoding': 'gzip, deflate, br, zstd',
                        'origin': 'https://ht.flvto.online',
                        'content-type': 'application/json',
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
                    },
                    timeout: 30000
                }
            );

            const data = response.data;

            if (data.status === 'ok') {
                return {
                    success: true,
                    videoId: videoId,
                    format: format,
                    title: data.title,
                    duration: data.duration,
                    fileSize: data.filesize,
                    downloadUrl: data.link,
                    progress: data.progress
                };
            } else {
                return {
                    success: false,
                    error: data.msg || 'Download failed'
                };
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async downloadFromUrl(youtubeUrl, format = 'mp3') {
        try {
            const videoId = this.extractVideoId(youtubeUrl);
            if (!videoId) {
                return { success: false, error: 'Invalid YouTube URL' };
            }

            return await this.download(videoId, format);
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }
}

async function main() {
    const downloader = new AgungDevXYTDownloader();

    // Test dengan video ID langsung
    const result1 = await downloader.download('2y1OxYwvkhY', 'mp3');
    console.log(JSON.stringify(result1, null, 2));

}

if (require.main === module) {
    main();
}

module.exports = AgungDevXYTDownloader;