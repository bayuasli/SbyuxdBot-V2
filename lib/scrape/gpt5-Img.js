const axios = require('axios');

/**
 * GPT-5 Image Generator (Unlimited Tweak)
 * API: chatgpt5free.com
 * Owners: AgungDevX
 */
const GPTImage = {
    config: {
        url: 'https://chatgpt5free.com/wp-json/chatgpt-pro/v1/image',
        referer: 'https://chatgpt5free.com/chat/',
        // Daptar User-Agent pikeun ngabobodo server (Anti-Limit sederhana)
        agents: [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        ]
    },

    /**
     * @param {String} prompt - Deskripsi gambar
     */
    generate: async (prompt) => {
        try {
            if (!prompt) return { status: 400, success: false, owners: "AgungDevX", message: "Prompt required" };

            // Milih User-Agent sacara acak
            const randomAgent = GPTImage.config.agents[Math.floor(Math.random() * GPTImage.config.agents.length)];

            const payload = {
                prompt: prompt,
                provider: "openai" // Default provider
            };

            const { data } = await axios.post(GPTImage.config.url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': randomAgent,
                    'Referer': GPTImage.config.referer,
                    'Origin': 'https://chatgpt5free.com',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            if (!data || !data.data || !data.data.length) {
                // Lamun gagal, kamungkinan limit IP geus parah
                throw new Error("Failed to generate image. Server might be busy or IP limit reached.");
            }

            const res = data.data[0];
            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dikembangkan oleh AgungDevX untuk riset pembuatan aset digital berbasis AI.";

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                payload: {
                    original_prompt: prompt,
                    revised_prompt: res.revised_prompt,
                    image_url: res.url,
                    created_at: new Date(data.created * 1000).toLocaleString()
                },
                description: "Professional GPT-5 DALL-E Image Service" + disclaimer
            };

        } catch (err) {
            // Logic tambahan: Mun error 429 (Too Many Requests), bere pesen nu jelas
            let msg = err.message;
            if (err.response && err.response.status === 429) {
                msg = "Rate Limit Reached. Please wait a moment or rotate IP.";
            }

            return {
                status: err.response ? err.response.status : 500,
                success: false,
                owners: "AgungDevX",
                message: msg
            };
        }
    }
};

// --- RUN TEST ON TERMUX ---
(async () => {
    console.log("Generating Image...");
    
    const result = await GPTImage.generate("A futuristic cyber city with neon lights, realistic 8k");
    
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = GPTImage;
