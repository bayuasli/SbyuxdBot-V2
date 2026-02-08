/** @type {import('#lib/types.js').Plugin} */
import os from 'os'
import { performance, monitorEventLoopDelay } from 'perf_hooks'

export default {
  name: "performance",
  command: ["perf", "ping", "speed"],
  category: "info",

  run: async (conn, m) => {
    const start = performance.now()
    const h = monitorEventLoopDelay({ resolution: 10 })
    h.enable()

    const cpuStart = process.cpuUsage()
    const mem = process.memoryUsage()
    const res = process.resourceUsage()

    const latency = (performance.now() - start).toFixed(2)

    await new Promise(r => setTimeout(r, 100)) 

    h.disable()

    const cpuEnd = process.cpuUsage(cpuStart)

    const formatMB = b => (b / 1024 / 1024).toFixed(2) + " MB"

    const msg = `
🚀 *REAL BOT PERFORMANCE*

⚡ Latency Msg   : ${latency} ms
🧠 Event Loop    : ${(h.mean / 1e6).toFixed(2)} ms
🔁 CPU User      : ${(cpuEnd.user / 1000).toFixed(2)} ms
⚙️ CPU System    : ${(cpuEnd.system / 1000).toFixed(2)} ms

💾 Memory
• RSS       : ${formatMB(mem.rss)}
• Heap Used : ${formatMB(mem.heapUsed)}
• Heap Total: ${formatMB(mem.heapTotal)}
• External  : ${formatMB(mem.external)}

📦 Handles Aktif : ${process._getActiveHandles().length}
🧵 Requests Aktif: ${process._getActiveRequests().length}

🖥️ System
• CPU Core : ${os.cpus().length}
• Load Avg : ${os.loadavg()[0].toFixed(2)}
• Uptime   : ${formatTime(process.uptime())}

🔥 Status Engine : ${h.mean / 1e6 < 20 ? "STABIL" : h.mean / 1e6 < 50 ? "PADAT" : "OVERLOAD"}
`.trim()

    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: msg,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          quotedMessage: {
            orderMessage: {
              productId: "8569472943180260",
              currencyCode: "IDR",
              priceAmount1000: "99999",
              message: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 PERFORMA",
              surface: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁"
            }
          },
          participant: "0@s.whatsapp.net"
        }
      }
    }, {})
  }
}

function formatTime(sec) {
  sec = Math.floor(sec)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${h}h ${m}m ${s}s`
}