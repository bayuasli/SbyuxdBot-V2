import axios from 'axios';
import FormData from 'form-data';

export default async function(buffer) {
    let form = new FormData();
    form.append('file', buffer, `${Date.now()}.jpg`);

    const res = await axios.post('https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke', form, {
        headers: {
            ...form.getHeaders(),
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
        }
    })

    return {
        status: res.data.labelName,
        persentase: persentase(res.data.confidence)
    }
}

function persentase(confidence) {
    if (confidence > 0.97) {
        var randomCap = Math.random() * (0.992 - 0.97) + 0.97;
        var cappedConfidence = Math.min(confidence, randomCap);
    } else {
        var cappedConfidence = confidence;
    }
    return cappedConfidence.toLocaleString(undefined, {
        style: 'percent',
        minimumFractionDigits: 2
    });
}