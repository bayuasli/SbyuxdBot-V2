/**
 * @project Flux Image Engine
 * @author AgungDEV
 */

const axios = require('axios');

const FluxGenerator = {
    _api: 'https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image',
    
    generate: async (prompt, ratio = '1:1') => {
        if (!prompt) return { status: 400, message: 'Missing prompt parameter' };

        try {
            const { data, status } = await axios({
                method: 'GET',
                url: FluxGenerator._api,
                params: {
                    prompt: prompt,
                    aspect_ratio: ratio
                },
                headers: {
                    'User-Agent': 'Postify/1.0.0',
                    'Accept': 'application/json'
                }
            });

            return {
                status: status,
                success: true,
                data: {
                    url: data.image_link,
                    prompt: prompt,
                    ratio: ratio,
                    generated_at: new Date().toISOString()
                }
            };

        } catch (err) {
            return {
                status: err.response?.status || 500,
                success: false,
                error: {
                    type: 'FLUX_ENGINE_ERR',
                    message: err.message
                }
            };
        }
    }
};

/**
 * ENTRY POINT
 * Dibungkus dalam IIFE (Immediately Invoked Function Expression) 
 * agar support await di lingkungan CommonJS.
 */
(async () => {
    try {
        const result = await FluxGenerator.generate('Neon Samurai', '1:1');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('CRITICAL_SYSTEM_ERROR:', e.message);
    }
})();