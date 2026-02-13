const axios = require('axios');

async function cnvmp3Check(youtubeId, quality = 4, formatValue = 1) {
    const url = 'https://cnvmp3.com/check_database.php';
    
    const requestData = {
        youtube_id: youtubeId,
        quality: quality,
        formatValue: formatValue
    };

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://cnvmp3.com/v51'
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        return {
            success: response.data.success,
            data: {
                ...response.data.data,
                author: "AgungDevX"
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

// Gunakan ID video YouTube 
cnvmp3Check("02uaMKHMdEI")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);