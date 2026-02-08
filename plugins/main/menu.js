export default {
  name: "menu",
  category: "main",
  command: ["menu", "help", "allmenu"],
  run: async (conn, m, { Func }) => {

    let grouped = {}
    for (let plugin of Object.values(plugins)) {
      if (!grouped[plugin.category]) grouped[plugin.category] = []
      grouped[plugin.category].push(plugin)
    }

    const totalFitur = Object.values(grouped).flat().length
    const totalKategori = Object.keys(grouped).length

    const uptime = Func.runtime(process.uptime())
    const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)
    const cpu = process.cpuUsage().user / 1000
    const speed = (performance.now() - m.timesTamp).toFixed(2)

    const time = new Date().toLocaleString("id-ID", {
      timeZone: 'Asia/Jakarta',
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })

    let menu = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ MENU SBYUXD BOT
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 👤 User   : ${m.pushname}
┃ 🌐 Mode   : ${IS_PUBLIC ? "PUBLIC" : "SELF"}
┃ ⚡ Speed  : ${speed} ms
┃ 🧠 RAM    : ${ram} MB
┃ 🔧 CPU    : ${cpu} µs
┃ ⏳ Uptime : ${uptime}
┃ 🕒 Time   : ${time}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    for (let [category, items] of Object.entries(grouped)) {
      menu += `\n【 ${category.toUpperCase()} 】`
      menu += `\n${items.map(p => `➤ ${m.prefix}${p.name}`).join("\n")}\n`
    }

    menu += `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 📦 Categories : ${totalKategori}
┃ 🧩 Features   : ${totalFitur}
┃ ⚙ Baileys    : baileys 7.0.0-rc.6
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    m.reply(menu)
  }
}