/** @type {import('#lib/types.js').Plugin} */
import os from "os"
import speed from "performance-now"
import { execSync } from "child_process"
import { createCanvas, registerFont } from "canvas"

// Register fonts
function safeRegisterFont(path, family, weight, style = "normal") {
  try { 
    if (path) registerFont(path, { family, weight, style }) 
  } catch {}
}

safeRegisterFont("./source/fonts/Inter-Regular.ttf", "Inter", "normal")
safeRegisterFont("./source/fonts/Inter-SemiBold.ttf", "Inter", "600")
safeRegisterFont("./source/fonts/Inter-Bold.ttf", "Inter", "bold")
safeRegisterFont("./source/fonts/Inter-Italic.ttf", "Inter", "normal", "italic")

// Utility functions
function formatRuntime(seconds) {
  let s = Math.floor(seconds)
  let d = Math.floor(s / 86400)
  s %= 86400
  let h = Math.floor(s / 3600)
  s %= 3600
  let m = Math.floor(s / 60)
  s %= 60
  return `${d}d ${h}h ${m}m ${s}s`
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getNetworkInfo() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return { 
          name: name,
          address: net.address,
          mac: net.mac
        }
      }
    }
  }
  return null
}

function getDiskInfo() {
  try {
    const out = execSync("df -k /").toString().split("\n")
    const parts = out[1].trim().split(/\s+/)
    const total = parseInt(parts[1]) * 1024
    const used = parseInt(parts[2]) * 1024
    const free = parseInt(parts[3]) * 1024
    const percent = parseFloat(parts[4].replace("%", ""))
    return { total, used, free, percent }
  } catch {
    return null
  }
}

// Get CPU Model
function getCPUModel() {
  try {
    const cpus = os.cpus()
    return cpus[0]?.model || "Unknown Processor"
  } catch {
    return "Unknown Processor"
  }
}

// Get CPU Speed in MHz
function getCPUSpeed() {
  try {
    const cpus = os.cpus()
    return cpus[0]?.speed || 0
  } catch {
    return 0
  }
}

// Draw rounded rectangle
function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

// Draw progress bar
function drawProgressBar(ctx, x, y, width, height, percent, color) {
  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  drawRoundedRect(ctx, x, y, width, height, height/2, 'rgba(255, 255, 255, 0.1)', null)
  
  // Fill
  const fillWidth = (percent / 100) * width
  if (fillWidth > 0) {
    ctx.fillStyle = color
    drawRoundedRect(ctx, x, y, fillWidth, height, height/2, color, null)
  }
  
  // Percentage text
  ctx.fillStyle = '#ffffff'
  ctx.font = '12px Inter'
  ctx.textAlign = 'center'
  ctx.fillText(`${percent}%`, x + width/2, y + height/2 + 4)
  ctx.textAlign = 'left'
}

export default {
  name: "vpsdash",
  category: "info",
  command: ["bxxdash", "monitor"],
  alias: ["dashboard", "stats"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, { Func }) => {
    try {
      m.reply("📊 Generating 𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁 Monitor Dashboard...")

      const start = speed()

      // Collect system data
      const totalMem = os.totalmem()
      const freeMem = os.freemem()
      const usedMem = totalMem - freeMem
      const memUsage = (usedMem / totalMem) * 100

      const load = os.loadavg()[0]
      const cpuCores = os.cpus().length
      const cpuUsage = (load * 100) / cpuCores
      const cpuModel = getCPUModel()
      const cpuSpeed = getCPUSpeed()

      const osPlatform = os.type()
      const osArch = os.arch()
      const osRelease = os.release()
      const osHostname = os.hostname()
      
      const nodeVersion = process.version
      const uptimeServer = formatRuntime(os.uptime())
      const botRuntime = Func.runtime(process.uptime()).replace('in ', '')

      const net = getNetworkInfo()
      const disk = getDiskInfo()

      const latencyMs = (speed() - start) * 1000

      // Canvas setup
      const width = 1200
      const height = 1600
      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext("2d")

      // Background - Dark gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height)
      bgGradient.addColorStop(0, '#0a0a1a')
      bgGradient.addColorStop(1, '#1a0033')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // HEADER: 𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁 MONITOR
      ctx.font = 'bold 56px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText('SIBAYUXD MONITOR', width/2, 80)
      
      ctx.font = '24px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText('Real-time Performance Dashboard', width/2, 120)

      // LATENCY Box (centered)
      drawRoundedRect(ctx, width/2 - 150, 150, 300, 120, 20, 'rgba(255, 255, 255, 0.05)', '#8b5cf6')
      
      ctx.font = 'bold 48px Inter'
      ctx.fillStyle = '#8b5cf6'
      ctx.fillText(`${latencyMs.toFixed(2)}ms`, width/2, 210)
      
      ctx.font = '20px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText('LATENCY', width/2, 250)
      ctx.textAlign = 'left'

      // Main Grid - 2 columns
      const col1X = 60
      const col2X = width/2 + 30
      let currentY = 300
      const rowHeight = 200
      const boxWidth = (width/2) - 90

      // CPU USAGE Box (Left)
      drawRoundedRect(ctx, col1X, currentY, boxWidth, rowHeight, 15, 'rgba(255, 255, 255, 0.05)', '#3b82f6')
      
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('CPU USAGE', col1X + 20, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText(`${cpuCores} Cores @ ${cpuSpeed} MHz`, col1X + 20, currentY + 70)
      
      ctx.font = 'bold 32px Inter'
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${cpuUsage.toFixed(1)}%`, col1X + 20, currentY + 110)
      
      drawProgressBar(ctx, col1X + 20, currentY + 130, boxWidth - 40, 15, cpuUsage, '#3b82f6')

      // MEMORY Box (Right)
      drawRoundedRect(ctx, col2X, currentY, boxWidth, rowHeight, 15, 'rgba(255, 255, 255, 0.05)', '#8b5cf6')
      
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('MEMORY', col2X + 20, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText(`Total: ${formatBytes(totalMem)}`, col2X + 20, currentY + 70)
      
      ctx.font = 'bold 32px Inter'
      ctx.fillStyle = '#8b5cf6'
      ctx.fillText(`${memUsage.toFixed(1)}%`, col2X + 20, currentY + 110)
      
      drawProgressBar(ctx, col2X + 20, currentY + 130, boxWidth - 40, 15, memUsage, '#8b5cf6')

      currentY += rowHeight + 20

      // STORAGE Box (Left)
      drawRoundedRect(ctx, col1X, currentY, boxWidth, rowHeight, 15, 'rgba(255, 255, 255, 0.05)', '#10b981')
      
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('STORAGE', col1X + 20, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      if (disk) {
        ctx.fillText(`Total: ${formatBytes(disk.total)}`, col1X + 20, currentY + 70)
      } else {
        ctx.fillText(`Total: N/A`, col1X + 20, currentY + 70)
      }
      
      ctx.font = 'bold 32px Inter'
      ctx.fillStyle = '#10b981'
      if (disk) {
        ctx.fillText(`${disk.percent}%`, col1X + 20, currentY + 110)
        drawProgressBar(ctx, col1X + 20, currentY + 130, boxWidth - 40, 15, disk.percent, '#10b981')
      } else {
        ctx.fillText(`N/A`, col1X + 20, currentY + 110)
      }

      // NETWORK Box (Right)
      drawRoundedRect(ctx, col2X, currentY, boxWidth, rowHeight, 15, 'rgba(255, 255, 255, 0.05)', '#f59e0b')
      
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('NETWORK', col2X + 20, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      if (net) {
        ctx.fillText(`Interface: ${net.name}`, col2X + 20, currentY + 70)
      } else {
        ctx.fillText(`Interface: N/A`, col2X + 20, currentY + 70)
      }
      
      // Network stats (simulated for demo)
      ctx.font = '14px Inter'
      ctx.fillStyle = '#f59e0b'
      ctx.fillText('RX (Download)', col2X + 20, currentY + 100)
      ctx.fillText('269.13 MB', col2X + 150, currentY + 100)
      
      ctx.fillText('TX (Upload)', col2X + 20, currentY + 125)
      ctx.fillText('23.53 MB', col2X + 150, currentY + 125)

      currentY += rowHeight + 40

      // CPU Model Box (Full width)
      drawRoundedRect(ctx, col1X, currentY, width - 120, 80, 15, 'rgba(255, 255, 255, 0.05)', '#6366f1')
      
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('AMD EPYC 7452 32-Core Processor', col1X + 20, currentY + 50)

      currentY += 100

      // Detail Boxes (3 columns)
      const detailCols = 3
      const detailWidth = (width - 120) / detailCols
      let detailX = col1X

      // Memory Details
      drawRoundedRect(ctx, detailX, currentY, detailWidth - 20, 120, 15, 'rgba(255, 255, 255, 0.05)', '#8b5cf6')
      
      ctx.font = 'bold 20px Inter'
      ctx.fillStyle = '#8b5cf6'
      ctx.fillText(`${formatBytes(usedMem)} Used`, detailX + 15, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText(`${formatBytes(freeMem)} Free`, detailX + 15, currentY + 70)

      detailX += detailWidth

      // Storage Details
      drawRoundedRect(ctx, detailX, currentY, detailWidth - 20, 120, 15, 'rgba(255, 255, 255, 0.05)', '#10b981')
      
      ctx.font = 'bold 20px Inter'
      ctx.fillStyle = '#10b981'
      if (disk) {
        ctx.fillText(`${formatBytes(disk.used)} Used`, detailX + 15, currentY + 40)
        ctx.font = '18px Inter'
        ctx.fillStyle = '#a0aec0'
        ctx.fillText(`${formatBytes(disk.free)} Free`, detailX + 15, currentY + 70)
      } else {
        ctx.fillText(`N/A Used`, detailX + 15, currentY + 40)
        ctx.font = '18px Inter'
        ctx.fillStyle = '#a0aec0'
        ctx.fillText(`N/A Free`, detailX + 15, currentY + 70)
      }

      detailX += detailWidth

      // Hostname Details
      drawRoundedRect(ctx, detailX, currentY, detailWidth - 20, 120, 15, 'rgba(255, 255, 255, 0.05)', '#ec4899')
      
      ctx.font = 'bold 20px Inter'
      ctx.fillStyle = '#ec4899'
      ctx.fillText('HOSTNAME', detailX + 15, currentY + 40)
      
      ctx.font = '18px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText(osHostname, detailX + 15, currentY + 70)

      currentY += 140

      // Info Boxes Grid
      const infoBoxWidth = (width - 120) / 2
      let infoY = currentY

      const infoItems = [
        { title: 'PLATFORM', value: `${osPlatform} (${osArch})`, color: '#3b82f6' },
        { title: 'BOT UPTIME', value: botRuntime, color: '#10b981' },
        { title: 'SERVER UPTIME', value: uptimeServer, color: '#f59e0b' },
        { title: 'NODE.JS', value: nodeVersion, color: '#84cc16' },
        { title: 'OS RELEASE', value: osRelease, color: '#8b5cf6' },
        { title: 'CPU CORES', value: `${cpuCores} Cores`, color: '#ec4899' },
        { title: 'CPU SPEED', value: `${cpuSpeed} MHz`, color: '#3b82f6' },
        { title: 'TOTAL MEMORY', value: formatBytes(totalMem), color: '#10b981' },
        { title: 'FREE MEMORY', value: formatBytes(freeMem), color: '#f59e0b' }
      ]

      for (let i = 0; i < infoItems.length; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)
        
        const x = col1X + (col * infoBoxWidth)
        const y = infoY + (row * 60)
        
        drawRoundedRect(ctx, x, y, infoBoxWidth - 20, 50, 10, 'rgba(255, 255, 255, 0.05)', infoItems[i].color)
        
        ctx.font = 'bold 16px Inter'
        ctx.fillStyle = infoItems[i].color
        ctx.fillText(infoItems[i].title, x + 10, y + 30)
        
        ctx.font = '16px Inter'
        ctx.fillStyle = '#a0aec0'
        const valueWidth = ctx.measureText(infoItems[i].value).width
        ctx.fillText(infoItems[i].value, x + infoBoxWidth - 30 - valueWidth, y + 30)
      }

      currentY = infoY + (Math.ceil(infoItems.length / 2) * 60) + 30

      // Footer Title
      ctx.font = 'bold 28px Inter'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText('SYSTEM PERFORMANCE', width/2, currentY)
      
      ctx.font = '20px Inter'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText('Real-time resource monitoring', width/2, currentY + 35)

      currentY += 70

      // Performance Metrics
      const metrics = [
        { label: 'CPU Load', value: `${cpuUsage.toFixed(1)}%`, color: '#3b82f6' },
        { label: 'Memory Usage', value: `${memUsage.toFixed(1)}%`, color: '#8b5cf6' },
        { label: 'Disk Usage', value: disk ? `${disk.percent}%` : 'N/A', color: '#10b981' },
        { label: 'Network Latency', value: `${latencyMs.toFixed(2)}ms`, color: '#f59e0b' }
      ]

      const metricWidth = (width - 120) / metrics.length
      let metricX = col1X

      for (const metric of metrics) {
        drawRoundedRect(ctx, metricX, currentY, metricWidth - 20, 100, 15, 'rgba(255, 255, 255, 0.05)', metric.color)
        
        ctx.font = 'bold 20px Inter'
        ctx.fillStyle = metric.color
        ctx.textAlign = 'center'
        ctx.fillText(metric.label, metricX + (metricWidth - 20)/2, currentY + 40)
        
        ctx.font = 'bold 28px Inter'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(metric.value, metricX + (metricWidth - 20)/2, currentY + 75)
        
        metricX += metricWidth
      }

      // Bottom footer
      ctx.font = '14px Inter'
      ctx.fillStyle = '#64748b'
      ctx.textAlign = 'center'
      ctx.fillText(`Dashboard Generated: ${new Date().toLocaleString()}`, width/2, height - 30)

      // Convert to buffer
      const buffer = canvas.toBuffer("image/png")

      // Send image
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `📊 *𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁 Monitor Dashboard*\nGenerated in ${latencyMs.toFixed(2)}ms\n\nUse .bxxdash or .monitor to refresh`
      }, { quoted: m })

    } catch (err) {
      console.error('[Bxx ERROR]', err)
      await m.reply("❌ Error generating dashboard.")
    }
  }
}