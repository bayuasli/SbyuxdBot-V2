import axios from 'axios';

export default async function(url) {
    let data = JSON.stringify({ url, type: "video" });

    const res = await axios.post('https://vdraw.ai/api/v1/instagram/ins-info', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return res.data?.data
}
