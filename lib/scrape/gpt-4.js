const axios = require('axios');

const AgungDevXAI = {
    conversations: {},

    handler: async (userId, text, isQuoted = false) => {
        try {
            const d = new Date();
            const jam = d.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta" });
            const hari = d.toLocaleDateString('id', { weekday: 'long' });
            const tgl = d.toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' });

            const logic = `You are AgungDevX. You are a beginner developer and a bit aggressive. Use the typical term *mas brow* to call people. Respond to the point. Use the date format ${tgl}, time ${jam}, day ${hari}`;

            if (isQuoted && AgungDevXAI.conversations[userId]) {
                AgungDevXAI.conversations[userId] += `\nUser: ${text}`;
            } else {
                AgungDevXAI.conversations[userId] = `User: ${text}`;
            }

            const response = await AgungDevXAI.chatWithAI(AgungDevXAI.conversations[userId], logic);

            if (!response) {
                return {
                    status: 500,
                    success: false,
                    message: "AI na error euy, lieur meureun."
                };
            }

            AgungDevXAI.conversations[userId] += `\n${response}`;

            return {
                status: 200,
                success: true,
                payload: {
                    user_id: userId,
                    response: response,
                    metadata: { date: tgl, time: jam }
                }
            };

        } catch (e) {
            return { status: 500, success: false, message: e.message };
        }
    },

    chatWithAI: async (text, logic) => {
        try {
            // Nembak API ChatEverywhere
            const { data } = await axios.post("https://chateverywhere.app/api/chat/", {
                "model": {
                    "id": "gpt-4",
                    "name": "GPT-4",
                    "maxLength": 32000,
                    "tokenLimit": 8000,
                    "completionTokenLimit": 5000,
                    "deploymentName": "gpt-4"
                },
                "messages": [{ "role": "user", "content": text }],
                "prompt": logic,
                "temperature": 0.5
            }, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                }
            });

            return data;
        } catch (error) {
            return null;
        }
    }
};

// Ieu tah tambahanana meh kaluar hasilna pas di-test
(async () => {
    const hasil = await AgungDevXAI.handler("agungdevx_01", "Woi, maneh saha?");
    console.log(JSON.stringify(hasil, null, 2));
})();

module.exports = AgungDevXAI;