const axios = require("axios");
const FormData = require("form-data");

/**
 * AI Image Upscaler Scraper
 * Base: imgupscaler.com
 * Author: AgungDEV (Modified)
 */
const ImgUpscaler = {
    config: {
        uploadUrl: "https://get1.imglarger.com/api/UpscalerNew/UploadNew",
        statusUrl: "https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew",
        agent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    },

    /**
     * @param {Buffer} buffer - Buffer gambar anu rek di-upscale
     * @param {Number} scale - Skala (2 atawa 4)
     */
    process: async (buffer, scale = 2) => {
        try {
            if (!buffer) return { status: 400, success: false, message: "Image buffer is required." };

            const form = new FormData();
            form.append("myfile", buffer, { filename: "upload.png", contentType: "image/png" });
            form.append("scaleRadio", scale.toString());

            // Step 1: Upload gambar ka server
            const { data: uploadRes } = await axios.post(ImgUpscaler.config.uploadUrl, form, {
                headers: {
                    ...form.getHeaders(),
                    "Origin": "https://imgupscaler.com",
                    "Referer": "https://imgupscaler.com/",
                    "User-Agent": ImgUpscaler.config.agent
                }
            });

            if (uploadRes.code !== 200 || !uploadRes.data?.code) {
                throw new Error("Failed to upload image to upscaler server.");
            }

            const jobCode = uploadRes.data.code;

            // Step 2: Polling status nepi ka hasilna siap
            for (let i = 0; i < 30; i++) {
                const { data: statusRes } = await axios.post(ImgUpscaler.config.statusUrl, 
                    { code: jobCode, scaleRadio: scale },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Origin": "https://imgupscaler.com",
                            "Referer": "https://imgupscaler.com/",
                            "User-Agent": ImgUpscaler.config.agent
                        }
                    }
                );

                if (statusRes.code === 200 && statusRes.data?.status === "success") {
                    const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dibagikan untuk tujuan riset pengembangan teknologi pengolahan citra (Image Processing) dan edukasi pemrograman.";
                    
                    return {
                        status: 200,
                        success: true,
                        payload: {
                            job_code: jobCode,
                            scale: scale,
                            result_url: statusRes.data.downloadUrls[0]
                        },
                        description: "Professional AI Image Upscaler Service" + disclaimer
                    };
                }

                await new Promise(res => setTimeout(res, 5000)); // Nunggu 5 detik per loop
            }

            throw new Error("Upscaling process timeout.");

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
    console.log("Upscaling image in progress...");
    try {
        // Ngetes make gambar conto tina internet
        const testImg = await axios.get("https://files.catbox.moe/6x69ri.jpg", { responseType: 'arraybuffer' });
        const result = await ImgUpscaler.process(Buffer.from(testImg.data), 2);
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.log("Error during test: " + e.message);
    }
})();

module.exports = ImgUpscaler;
                  
