

import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises';
import path from 'path';

async function hdvid(inputBuffer, options = {}) {
    try {

        const tmpDir = path.join(process.cwd(), 'tmp');
        await fs.mkdir(tmpDir, { recursive: true });
        
        const inputPath = path.join(tmpDir, `input_${Date.now()}.mp4`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.mp4`);
        
 
        await fs.writeFile(inputPath, inputBuffer);

 
        let form = new FormData();
        form.append('video-file', new Blob([inputBuffer]), 'video.mp4');

        const response = await fetch('https://hdconvert.com/convert', {
            method: 'POST',
            body: form
        });

        if (!response.ok) {
            throw new Error(`Failed to access hdconvert.com: ${response.status}`);
        }

        const html = await response.text();
        const { document } = new JSDOM(html).window;

    
        const form2 = new FormData();
        const obj = {};
        
        for (const input of document.querySelectorAll('form input[name]')) {
            obj[input.name] = input.value;
            form2.append(input.name, input.value);
        }

 
        const response2 = await fetch(`https://hdconvert.com/convert/${obj.file}`, {
            method: 'POST',
            body: form2
        });

        if (!response2.ok) {
            throw new Error(`Failed to download converted video: ${response2.status}`);
        }

        
        const convertedVideoBuffer = Buffer.from(await response2.arrayBuffer());
        
        
        await fs.writeFile(outputPath, convertedVideoBuffer);

       
        await fs.unlink(inputPath).catch(() => {});

        return {
            buffer: convertedVideoBuffer,
            path: outputPath,
            size: convertedVideoBuffer.length
        };

    } catch (error) {
        console.error('[HDCONVERT ERROR]', error.message);
        throw new Error(`HDConvert failed: ${error.message}`);
    }
}

async function hdvidFromUrl(url) {
    try {
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to download video from URL');
        
        const buffer = Buffer.from(await response.arrayBuffer());
        return await hdvid(buffer);
        
    } catch (error) {
        console.error('[HDCONVERT URL ERROR]', error.message);
        throw new Error(`HDConvert URL failed: ${error.message}`);
    }
}

export { 
    hdvid,
    hdvidFromUrl 
};