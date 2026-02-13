const axios = require('axios');

async function textToSpeech(text) {
    const url = `https://heroikzre-api.vercel.app/tools/text-to-speech?text=${encodeURIComponent(text)}`;

    try {
        const response = await axios.get(url);

        const result = {
            status: response.data.status,
            creator: response.data.creator,
            result: response.data.result,
            author: "AgungDevX"
        };

        return result;
    } catch (error) {
        return {
            status: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

textToSpeech("Hai Ganteng! Mau jadi pacar aku ga.. hehehe Ahhhh ahhhh Enak Crot wkwkw ahahhhh ahhhhh aaaaaah")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);