export default {
    name: "sticker",
    category: "sticker",
    command: ["s", "sticker", "stc", "stick", "stiker", "swm", "stickerwm"],
    run: async (conn, m, { quoted }) => {
        if (/image|video|webp/.test(quoted.msg?.mimetype)) {
            const media = await quoted.download();

            if (quoted.msg?.seconds > 10) return m.reply("*Oopsie!*\n\n> Videos longer than 10 seconds are too long to be made into stickers~\n> Try cutting the video first, so you can make stickers!");
            let exif;
            if (m.text) {
                let [packname, author] = m.text.split(/[,|\-+&]/);
                exif = { packname: packname ? packname : '', packpublish: author ? author : '' };
            } else {
                exif = { packname: global.stickpack, packpublish: global.stickauth };
            }
            conn.sendSticker(m.chat, media, m, exif)

        } else if (m.mentions && m.mentions.length !== 0) {
            for (let id of m.mentions) {
                try {
                    let pp = await conn.profilePictureUrl(id, "image").catch(_ => "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60");
                    conn.sendSticker(m.chat, media, m)
                } catch (err) {
                    console.error(`Gagal ambil PP untuk ${id}:`, err);
                }
            }
        } else {
            m.reply("# *Sticker Tools!* \n\n> Come on, reply with *photo or video*~ \n> So I can turn it into a sticker~!");
        }
    }
};