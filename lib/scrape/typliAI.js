const axios = require('axios');

async function chatTypliAI(message, model = "openai/gpt-5-nano") {
    const url = 'https://typli.ai/api/generators/chat';
    
    const requestData = {
        slug: "free-no-sign-up-chatgpt",
        modelId: model,
        id: "BhJK4COzfozOwvqe",
        messages: [{
            parts: [{ type: "text", text: message }],
            id: "qo6gwVZZz9kOENyR",
            role: "user"
        }],
        trigger: "submit-message"
    };

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Accept': 'text/event-stream'
    };

    try {
        const response = await axios.post(url, requestData, {
            headers,
            responseType: 'stream'
        });

        let fullResponse = '';
        let usage = null;
        let messageId = null;

        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                const lines = chunkStr.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        
                        if (dataStr === '[DONE]') {
                            continue;
                        }

                        try {
                            const data = JSON.parse(dataStr);
                            
                            if (data.type === 'text-delta' && data.delta) {
                                fullResponse += data.delta;
                            }
                            else if (data.type === 'text-end') {
                                // Response selesai
                            }
                            else if (data.type === 'start' && data.messageId) {
                                messageId = data.messageId;
                            }
                            else if (data.type === 'data-session') {
                                usage = data.data;
                            }
                        } catch (e) {
                            // Ignore parse error
                        }
                    }
                }
            });

            response.data.on('end', () => {
                resolve({
                    success: true,
                    response: fullResponse,
                    messageId: messageId,
                    usage: usage,
                    author: "AgungDevX"
                });
            });

            response.data.on('error', (error) => {
                reject({
                    success: false,
                    error: error.message,
                    author: "AgungDevX"
                });
            });
        });

    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

// Versi sederhana tanpa streaming (tapi mungkin ga dapet response)
async function chatTypliSimple(message) {
    const url = 'https://typli.ai/api/generators/completion';
    
    const requestData = {
        slug: "free-no-sign-up-chatgpt",
        modelId: "openai/gpt-5-nano",
        prompt: message,
        temperature: 1
    };

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
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

// Pake fetch API kalo di Node.js 18+
async function chatTypliFetch(message) {
    const url = 'https://typli.ai/api/generators/chat';
    
    const requestData = {
        slug: "free-no-sign-up-chatgpt",
        modelId: "openai/gpt-5-nano",
        id: "BhJK4COzfozOwvqe",
        messages: [{
            parts: [{ type: "text", text: message }],
            id: "qo6gwVZZz9kOENyR",
            role: "user"
        }],
        trigger: "submit-message"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            body: JSON.stringify(requestData)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    
                    if (dataStr === '[DONE]') continue;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'text-delta' && data.delta) {
                            fullResponse += data.delta;
                        }
                    } catch (e) {}
                }
            }
        }

        return {
            success: true,
            response: fullResponse,
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
    console.log("Chat dengan Typli AI...");
    
    const result = await chatTypliAI("Siapa presiden Indonesia saat ini?");
    console.log("Response:", result.response);
    console.log("\nUsage:", JSON.stringify(result.usage, null, 2));
    console.log("\nAuthor: AgungDevX");
}

main().catch(console.error);