export default {
  name: "rch",
  category: "owner",
  command: ["rch"],
  owner: true,

  run: async (conn, m) => {
    try {
      const args = m.body.split(" ").slice(1)
      if (!args[0])
        return m.reply("Contoh:\n.rch https://whatsapp.com/channel/xxxx/1234 😂")

      let [url, ...emoji] = args
      emoji = emoji.join(" ").trim()

      if (!url || !emoji)
        return m.reply("Format salah!\nContoh:\n.rch https://whatsapp.com/channel/xxxx/1234 😂")

      const apiUrl = `https://api-faa.my.id/faa/react-channel?url=${encodeURIComponent(url)}&react=${encodeURIComponent(emoji)}`

      const fetch = (await import("node-fetch")).default
      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json.status)
        return m.reply(`Gagal: ${json.message || "Unknown error"}`)

      let teks = `*SUKSES REACT CHANNEL*\n`
      teks += `• Emoji: ${json.info.reaction_used}\n`
      teks += `• Tujuan: ${json.info.destination}`

      m.reply(teks)
    } catch (e) {
      console.error(e)
      m.reply("Terjadi kesalahan pada server")
    }
  },
}