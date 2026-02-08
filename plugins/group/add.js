export default {
    name: "add",
    category: "group",
    command: ["add"],
    settings: {
        group: true,
        admin: true,
        botAdmin: true
    },
    run: async (conn, m, { metadata, Func }) => {
        const user = m.isQuoted ? m.quoted.sender : m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!user) return m.reply('Reply/Tulis nomor yang ingin diadd');
        const response = await conn.groupParticipantsUpdate(m.chat, [user], 'add');
        const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null);
        const jpegThumbnail = pp ? await Func.getBuffer(pp) : Buffer.alloc(0);

        for (const participant of response) {
            const jid = participant.content.attrs.phone_number || participant.content.attrs.jid;
            const status = participant.status;

            if (status === '408') {
                m.reply(`Tidak dapat menambahkan @${jid.split('@')[0]}!\nMungkin @${jid.split('@')[0]} baru keluar dari grup ini atau dikick`);
            } else if (status === '403') {
                const inviteCode = participant.content.content[0].attrs.code;
                const inviteExp = participant.content.content[0].attrs.expiration;
                await m.reply(`Mengundang @${jid.split('@')[0]} menggunakan invite...`);

                await conn.sendGroupV4Invite(
                    m.chat,
                    jid,
                    inviteCode,
                    inviteExp,
                    metadata.subject,
                    'Undangan untuk bergabung ke grup WhatsApp saya',
                    jpegThumbnail
                );
            }
        };
    }
}