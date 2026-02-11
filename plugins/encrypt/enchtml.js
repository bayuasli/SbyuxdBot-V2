/** @type {import('#lib/types.js').Plugin} */
import crypto from 'crypto'

export default {
  name: "enchtml",
  category: "encrypt",
  command: ["encweb2", "enchtml"],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    if (!m.isQuoted || !/html/.test((m.quoted.msg || m.quoted).mimetype || '')) {
      return m.reply(`Reply file .html yang ingin di-encode!`)
    }

    try {
      await m.reply('⏳ Sedang mengenkripsi HTML...')

      const buffer = await m.quoted.download()
      const html = buffer.toString('utf-8')

      const key1 = Buffer.from("475e03683caeea1a248b1ad194d18fde359d1f0dabd49a748e868d2ec3d16bde", "hex")
      const key2 = Buffer.from("6a15c4b8dc32e7fc8b1ca5e5d9f2c212a5c4b67b584745cbb8963b5aea0d4c69", "hex")

      const aesEncrypt = (data, key) => {
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
        const encrypted = Buffer.concat([cipher.update(data, 'utf-8'), cipher.final()])
        const tag = cipher.getAuthTag()
        return {
          cipher: Buffer.concat([encrypted, tag]).toString('base64'),
          iv: iv.toString('base64')
        }
      }

      const hash = crypto.createHash('sha256').update(html).digest('hex')
      const layer1 = aesEncrypt(html, key1)
      const layer2 = aesEncrypt(JSON.stringify(layer1), key2)

      const encodedScript = `
<!--ENCODE BY 𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁-->
<script>
(() => {
try {
  if(location.protocol !== "https:") return document.body.innerHTML = "<h2 style='color:red;text-align:center'>HTTPS Only</h2>";
  if(navigator.webdriver || /Headless/i.test(navigator.userAgent)) throw "Headless Detected";

  const h = "${hash}";
  const iv2 = "${layer2.iv}";
  const c2 = "${layer2.cipher}";

  const key1 = Uint8Array.from("${key1.toString('hex')}".match(/.{1,2}/g).map(x => parseInt(x,16)));
  const key2 = Uint8Array.from("${key2.toString('hex')}".match(/.{1,2}/g).map(x => parseInt(x,16)));

  const decode = async () => {
    const iv2b = Uint8Array.from(atob(iv2), c => c.charCodeAt(0));
    const c2b = Uint8Array.from(atob(c2), c => c.charCodeAt(0));
    const key2Imp = await crypto.subtle.importKey("raw", key2, "AES-GCM", false, ["decrypt"]);
    const dec1 = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv2b }, key2Imp, c2b);
    const obj = JSON.parse(new TextDecoder().decode(dec1));

    const iv1 = Uint8Array.from(atob(obj.iv), c => c.charCodeAt(0));
    const c1 = Uint8Array.from(atob(obj.cipher), c => c.charCodeAt(0));
    const key1Imp = await crypto.subtle.importKey("raw", key1, "AES-GCM", false, ["decrypt"]);
    const dec2 = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv1 }, key1Imp, c1);

    const hashCheck = await crypto.subtle.digest("SHA-256", dec2);
    const hex = [...new Uint8Array(hashCheck)].map(b => b.toString(16).padStart(2,"0")).join("");
    if(hex !== h) throw "Hash Mismatch";

    document.open(); 
    document.write(new TextDecoder().decode(dec2)); 
    document.close();
  };

  decode().catch(() => {
    document.body.innerHTML = "<h1 style='color:red;text-align:center'>❌ Gagal Dekripsi</h1>";
  });

} catch(e) {
  document.body.innerHTML = "<h1 style='color:red;text-align:center'>Akses Diblokir</h1>";
}
})();
<\/script>`.trim()

      const originalName =
        m.quoted.msg?.fileName ||
        m.quoted.message?.documentMessage?.fileName ||
        `encoded-${Date.now()}.html`

      await conn.sendMessage(
        m.chat,
        {
          document: Buffer.from(encodedScript),
          mimetype: 'text/html',
          fileName: originalName,
          caption: '✅ HTML berhasil dienkripsi.'
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply('❌ Gagal mengenkripsi HTML.')
    }
  }
}