const axios = require('axios');
const { createHash, randomUUID } = require('crypto');

/**
 * TranslApp AI Multi-Module Scraper
 * Format: Clean JSON Output
 */
const TranslApp = {
    config: {
        base: 'https://translapp.info/ai/g/ask',
        agent: 'Postify/1.0.0'
    },

    _generateKey: (text) => {
        const shorten = text.length >= 5 ? text.substring(0, 5) : 'O'.repeat(5 - text.length) + text;
        return createHash('sha256').update(`${shorten}ZERO`, 'utf8').digest('hex');
    },

    process: async (text, mode = 'SUMMARIZE', target = '') => {
        try {
            if (!text) return { status: 400, success: false, message: "Parameter 'text' is required." };

            const payload = {
                k: TranslApp._generateKey(text),
                module: mode.toUpperCase(),
                text: text,
                to: target,
                userId: `GALAXY_AI${randomUUID()}`
            };

            const { data } = await axios.post(TranslApp.config.base, payload, {
                headers: {
                    'User-Agent': TranslApp.config.agent,
                    'Content-Type': 'application/json'
                }
            });

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dibagikan secara terbuka hanya untuk tujuan edukasi pemrograman, riset kecerdasan buatan, dan pengembangan perangkat lunak (Software Development).";

            return {
                status: 200,
                success: true,
                payload: {
                    title: "TranslApp AI Engine",
                    module: mode,
                    input: text,
                    output: data.message || null
                },
                description: "Professional AI Multi-Tool" + disclaimer
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                message: err.message
            };
        }
    }
};

// --- RUN TEST ON TERMUX ---
(async () => {
    const response = await TranslApp.process("Halo, apa kabar?", "TRANSLATE", "English");
    console.log(JSON.stringify(response, null, 2));
})();

module.exports = TranslApp;