const axios = require('axios');

async function gptaichatChat(message, wpnonce = "127cb03a82", post_id = "10") {
    const url = 'https://gptaichat.org/wp-admin/admin-ajax.php';
    
    const clientId = Math.random().toString(36).substring(2, 15);
    const chatId = Math.floor(Math.random() * 100000) + 90000;

    const formData = new URLSearchParams();
    formData.append('_wpnonce', wpnonce);
    formData.append('post_id', post_id);
    formData.append('url', 'https://gptaichat.org');
    formData.append('action', 'wpaicg_chat_shortcode_message');
    formData.append('message', message);
    formData.append('bot_id', '0');
    formData.append('chatbot_identity', 'shortcode');
    formData.append('wpaicg_chat_history', '[]');
    formData.append('wpaicg_chat_client_id', clientId);
    formData.append('chat_id', chatId);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/event-stream',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
    };

    try {
        const response = await axios.post(url, formData.toString(), { 
            headers: headers,
            responseType: 'stream'
        });

        let fullContent = '';
        const events = [];

        response.data.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            const lines = chunkStr.split('\n');
            
            lines.forEach(line => {
                if (line.startsWith('data: ') && line.length > 6) {
                    const data = line.substring(6);
                    
                    if (data === '[DONE]') {
                        events.push({ type: 'done' });
                        return;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        events.push(parsed);
                        
                        if (parsed.choices && parsed.choices[0]?.delta?.content) {
                            fullContent += parsed.choices[0].delta.content;
                        }
                    } catch (error) {
                        console.error('Parse error:', error.message);
                    }
                }
            });
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                const lastEvent = events[events.length - 1];
                const model = events[0]?.model || 'unknown';
                
                resolve({
                    success: true,
                    content: fullContent,
                    model: model,
                    clientId: clientId,
                    chatId: chatId,
                    eventsCount: events.length,
                    author: "AgungDevX"
                });
            });

            response.data.on('error', (error) => {
                resolve({
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

async function main() {
    const result = await gptaichatChat("Anjeun Saha?");
    console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);