export default {
    name: "promote",
    category: "group",
    command: ["promote"],
    settings: {
        group: true,
        admin: true,
        botAdmin: true
    },
    run: async (conn, m, { metadata }) => {
    const user = m.isQuoted ? m.quoted.sender : m.mentions && m.mentions[0] ? m.mentions[0] : m.text ? m.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '';
    if (!user) return m.reply('Reply / tag yang ingin di promote');
    if (metadata.participants.filter(v => v.jid == user || v.id === user || v.phoneNumber === user).length == 0) return m.reply('Target tidak berada dalam Grup !')
    conn.groupParticipantsUpdate(m.chat, [user], 'promote')
        .then(_ => m.reply('Berhasil'))
    }
}