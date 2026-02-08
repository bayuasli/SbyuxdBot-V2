import { createCanvas } from 'canvas'

export default {
  name: "brat",
  category: "sticker",
  command: ["brat"],
  settings: { loading: false },

  run: async (conn, m) => {
    if (!m.text) return m.reply("Contoh: .brat SibayuXd Ganteng")

    const text = m.text.slice(0, 40)

    const size = 512
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

  
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    
    ctx.fillStyle = "#000000"
    ctx.font = "bold 64px Sans"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    wrapText(ctx, text, size / 2, size / 2, 440, 70)

    const buffer = canvas.toBuffer()

    await conn.sendSticker(m.chat, buffer, m, {
      packname: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱",
      packpublish: "SibayuXd-Bot"
    })
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let lines = []

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line)
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line)

  const totalHeight = lines.length * lineHeight
  let startY = y - totalHeight / 2

  for (let l of lines) {
    ctx.fillText(l.trim(), x, startY)
    startY += lineHeight
  }
}