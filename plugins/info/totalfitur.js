/** @type {import('#lib/types.js').Plugin} */
import { createCanvas } from 'canvas'

export default {
  name: "totalfitur",
  category: "info",
  command: ["ttf", "totalfitur"],
  settings: { loading: false },

  run: async (conn, m) => {
    const grouped = {}
    for (let p of Object.values(global.plugins)) {
      if (!p.category) continue
      grouped[p.category] = (grouped[p.category] || 0) + 1
    }

    const categories = Object.entries(grouped).sort((a,b)=>b[1]-a[1])
    const totalFitur = categories.reduce((a,b)=>a+b[1],0)

    const width = 1200
    const lineHeight = 40
    const height = 420 + (categories.length * lineHeight)

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    /* ================= BACKGROUND ================= */
    const bg = ctx.createLinearGradient(0,0,width,height)
    bg.addColorStop(0,"#020617")
    bg.addColorStop(1,"#0f172a")
    ctx.fillStyle = bg
    ctx.fillRect(0,0,width,height)

    /* Grid Effect */
    ctx.strokeStyle = "rgba(255,255,255,0.03)"
    for(let i=0;i<width;i+=40){
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke()
    }
    for(let i=0;i<height;i+=40){
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke()
    }

    /* ================= MONITOR BODY ================= */
    const screenX = 130
    const screenY = 70
    const screenW = width - 260
    const screenH = height - 220

    ctx.shadowColor = "#0ea5e9"
    ctx.shadowBlur = 40
    ctx.fillStyle = "#0b1220"
    roundRect(ctx, screenX-20, screenY-20, screenW+40, screenH+40, 25)
    ctx.fill()
    ctx.shadowBlur = 0

    /* Screen */
    const screenGrad = ctx.createLinearGradient(0,screenY,0,screenY+screenH)
    screenGrad.addColorStop(0,"#0ea5e9")
    screenGrad.addColorStop(1,"#1e3a8a")
    ctx.fillStyle = screenGrad
    roundRect(ctx, screenX, screenY, screenW, screenH, 18)
    ctx.fill()

    /* ================= HEADER ================= */
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 42px Sans"
    ctx.fillText("SIBAYUXD BOT SYSTEM", screenX+40, screenY+60)

    ctx.font = "20px Sans"
    ctx.fillStyle = "#e2e8f0"
    ctx.fillText("Feature Analytics Dashboard", screenX+40, screenY+95)

    /* Divider line */
    ctx.strokeStyle = "rgba(255,255,255,0.3)"
    ctx.beginPath()
    ctx.moveTo(screenX+40, screenY+110)
    ctx.lineTo(screenX+screenW-40, screenY+110)
    ctx.stroke()

    /* ================= FEATURE LIST ================= */
    let y = screenY+150
    ctx.font = "24px Sans"

    categories.forEach(([cat,count],i)=>{
      const barWidth = Math.min(400, count*18)
      ctx.fillStyle = "#0f172a"
      roundRect(ctx, screenX+50, y-22, screenW-100, 32, 8)
      ctx.fill()

      ctx.fillStyle = "#38bdf8"
      roundRect(ctx, screenX+50, y-22, barWidth, 32, 8)
      ctx.fill()

      ctx.fillStyle = "#fff"
      ctx.fillText(cat.toUpperCase(), screenX+60, y)
      ctx.textAlign = "right"
      ctx.fillText(count+" fitur", screenX+screenW-60, y)
      ctx.textAlign = "left"

      y += lineHeight
    })

    /* ================= TOTAL PANEL ================= */
    ctx.shadowColor="#facc15"
    ctx.shadowBlur=30
    ctx.fillStyle="#111827"
    roundRect(ctx, width/2-220, height-150, 440, 70, 14)
    ctx.fill()
    ctx.shadowBlur=0

    ctx.fillStyle="#fde047"
    ctx.font="bold 32px Sans"
    ctx.textAlign="center"
    ctx.fillText(`TOTAL FITUR = ${totalFitur}`, width/2, height-105)

    /* ================= STAND ================= */
    ctx.fillStyle="#1f2937"
    ctx.fillRect(width/2-70,height-170,140,40)
    ctx.fillRect(width/2-160,height-135,320,28)

    const buffer = canvas.toBuffer("image/png")

    await conn.sendMessage(m.chat,{
      image: buffer,
      caption: "🖥️ *System Feature Monitor*"
    },{quoted:m})
  }
}

/* Rounded Rectangle */
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath()
  ctx.moveTo(x+r,y)
  ctx.lineTo(x+w-r,y)
  ctx.quadraticCurveTo(x+w,y,x+w,y+r)
  ctx.lineTo(x+w,y+h-r)
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
  ctx.lineTo(x+r,y+h)
  ctx.quadraticCurveTo(x,y+h,x,y+h-r)
  ctx.lineTo(x,y+r)
  ctx.quadraticCurveTo(x,y,x+r,y)
  ctx.closePath()
}