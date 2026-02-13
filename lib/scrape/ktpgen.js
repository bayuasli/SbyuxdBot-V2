const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs');

async function setupFonts() {
    try {
        const { data: arrialF } = await axios.get('https://api.nekolabs.web.id/f/arrial.ttf', { responseType: 'arraybuffer' });
        fs.writeFileSync(`./font_ktp/arrial.ttf`, arrialF);
        GlobalFonts.registerFromPath(`./font_ktp/arrial.ttf`, 'ArrialKTP');
        
        const { data: ocrF } = await axios.get('https://api.nekolabs.web.id/f/ocr.ttf', { responseType: 'arraybuffer' });
        fs.writeFileSync(`./font_ktp/ocrktp.ttf`, ocrF);
        GlobalFonts.registerFromPath(`./font_ktp/ocrktp.ttf`, 'OcrKTP');
        
        const { data: signF } = await axios.get('https://api.nekolabs.web.id/f/sign.otf', { responseType: 'arraybuffer' });
        fs.writeFileSync(`./font_ktp/signktp.ttf`, signF);
        GlobalFonts.registerFromPath(`./font_ktp/signktp.ttf`, 'SignKTP');
    } catch (error) {
        throw new Error(error.message);
    }
}

async function ktpgen({
    nama,
    provinsi,
    kota,
    nik,
    ttl,
    jenis_kelamin,
    golongan_darah,
    alamat,
    rtRw,
    kel_desa,
    kecamatan,
    agama,
    status,
    pekerjaan,
    kewarganegaraan,
    masa_berlaku,
    terbuat,
    pas_photo
}) {
    try {
        await setupFonts();
        
        const canvas = createCanvas(720, 463);
        const ctx = canvas.getContext('2d');
        
        const [templateImg, pasPhotoImg] = await Promise.all([
            loadImage('https://api.nekolabs.web.id/f/template.png'),
            loadImage(pas_photo)
        ]);
        
        const drawTextLeft = (x, y, text, font, size) => {
            ctx.font = `${size}px ${font}`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            ctx.fillText(text, x, y);
        };
        
        const drawTextCenter = (x, y, text, font, size) => {
            ctx.font = `${size}px ${font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(text, x, y);
        };
        
        const upper = (s) => s.toUpperCase();
        
        ctx.drawImage(templateImg, 0, 0, 720, 463);
        
        const PHOTO_X = 520;
        const PHOTO_Y = 80;
        const PHOTO_W = 200;
        const PHOTO_H = 280;
        
        const frameAspect = PHOTO_W / PHOTO_H;
        const imgAspect = pasPhotoImg.width / pasPhotoImg.height;
        
        let srcX, srcY, srcW, srcH;
        
        if (imgAspect > frameAspect) {
            srcH = pasPhotoImg.height;
            srcW = srcH * frameAspect;
            srcX = (pasPhotoImg.width - srcW) / 2;
            srcY = 0;
        } else {
            srcW = pasPhotoImg.width;
            srcH = srcW / frameAspect;
            srcX = 0;
            srcY = (pasPhotoImg.height - srcH) / 2;
        }
        
        const baseScale = Math.min(PHOTO_W / srcW, PHOTO_H / srcH);
        const SHRINK = 0.78;
        const scale = baseScale * SHRINK;
        
        const drawW = srcW * scale;
        const drawH = srcH * scale;
        
        const offsetLeft = -15;
        const drawX = PHOTO_X + (PHOTO_W - drawW) / 2 + offsetLeft;
        const drawY = PHOTO_Y + (PHOTO_H - drawH) / 2;
        
        ctx.drawImage(pasPhotoImg, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
        
        drawTextCenter(380, 45, `PROVINSI ${upper(provinsi)}`, 'ArrialKTP', 25);
        drawTextCenter(380, 70, `KOTA ${upper(kota)}`, 'ArrialKTP', 25);
        
        ctx.font = '32px OcrKTP';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';
        ctx.fillText(nik, 170, 105);
        
        drawTextLeft(190, 145, upper(nama), 'ArrialKTP', 16);
        drawTextLeft(190, 168, upper(ttl), 'ArrialKTP', 16);
        drawTextLeft(190, 191, upper(jenis_kelamin), 'ArrialKTP', 16);
        drawTextLeft(463, 190, upper(golongan_darah), 'ArrialKTP', 16);
        drawTextLeft(190, 212, upper(alamat), 'ArrialKTP', 16);
        drawTextLeft(190, 234, upper(rtRw), 'ArrialKTP', 16);
        drawTextLeft(190, 257, upper(kel_desa), 'ArrialKTP', 16);
        drawTextLeft(190, 279, upper(kecamatan), 'ArrialKTP', 16);
        drawTextLeft(190, 300, upper(agama), 'ArrialKTP', 16);
        drawTextLeft(190, 323, upper(status), 'ArrialKTP', 16);
        drawTextLeft(190, 346, upper(pekerjaan), 'ArrialKTP', 16);
        drawTextLeft(190, 369, upper(kewarganegaraan), 'ArrialKTP', 16);
        drawTextLeft(190, 390, upper(masa_berlaku), 'ArrialKTP', 16);
        
        drawTextLeft(553, 345, `KOTA ${upper(kota)}`, 'ArrialKTP', 12);
        drawTextLeft(570, 365, terbuat, 'ArrialKTP', 12);
        
        const sign = nama.split(' ')[0] || nama;
        ctx.font = '40px SignKTP';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(sign, 540, 395);
        
        return canvas.toBuffer('image/png');
    } catch (error) {
        throw new Error(error.message);
    }
}