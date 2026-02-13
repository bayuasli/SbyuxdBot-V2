const axios = require('axios');

async function chatWithAI(characterId, message, conversationId = null) {
    const url = 'https://prod.nd-api.com/chat';
    
    const requestData = {
        conversation_id: conversationId,
        character_id: characterId,
        language: "en",
        inference_model: "default",
        inference_settings: {
            max_new_tokens: 180,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 90
        },
        autopilot: false,
        continue_chat: false,
        message: message
    };

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Guest-UserId': 'a807e12c-5c10-4d61-bd4d-69352e76e46c',
        'X-App-Id': 'pixelchat'
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        return {
            success: true,
            message: response.data.message,
            engine: response.data.engine,
            author: "AgungDevX"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

async function getChatHistory(characterId, conversationId, limit = 50) {
    const url = `https://prod.nd-api.com/characters/${characterId}/messages/${conversationId}?limit=${limit}`;

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'X-Guest-UserId': 'a807e12c-5c10-4d61-bd4d-69352e76e46c',
        'X-Country': 'ID',
        'X-App-Id': 'pixelchat'
    };

    try {
        const response = await axios.get(url, { headers });
        
        return {
            success: true,
            conversation: response.data,
            author: "AgungDevX"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

async function reportError(errorData) {
    const url = 'https://server.megabrain.co/error';
    
    const requestData = {
        error: errorData.error,
        stack: errorData.stack,
        additionalData: errorData.additionalData
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        return {
            success: true,
            response: response.data,
            author: "AgungDevX"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

// Contoh penggunaan
async function main() {
    const characterId = "6472508d-5763-415d-8d8e-db48c7fbd05a";
    const message = "Hai sayang pake b indo dong";
    
    console.log("Mengirim pesan ke AI...");
    const chatResult = await chatWithAI(characterId, message);
    console.log(JSON.stringify(chatResult, null, 2));
    
    if (chatResult.success && chatResult.message.conversation_id) {
        console.log("\nMengambil riwayat chat...");
        const history = await getChatHistory(characterId, chatResult.message.conversation_id);
        console.log(JSON.stringify(history, null, 2));
    }
}

main().catch(console.error);