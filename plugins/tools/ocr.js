/** @type {import('#lib/types.js').Plugin} */

import fetch from "node-fetch"
import fs from "fs"
import path from "path"

async function pontaOCR(buffer) {
  const url = "https://staging-ai-image-ocr-266i.frontend.encr.app/api/ocr/process"

  const imageBase64 = buffer.toString("base64")

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      mimeType: "image/png"
    })
  })

  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return json.extractedText
}

export default {
  name: "ocr",
  category: "tools",
  command: ["ocr", "readimg"],

  settings: {
    owner: false,
    group: false,
    private: false,
    loading: true
  },

  run: async (conn, m, { quoted, downloadM }) => {
    try {
      const q = quoted?.msg || quoted
      const mime = q?.mimetype || ""

      if (!/image/.test(mime)) {
        return m.reply("Reply gambar untuk OCR.")
      }

      const buffer = await downloadM()
      if (!buffer) return m.reply("Gagal download gambar.")

      const text = await pontaOCR(buffer)

      if (!text) return m.reply("Teks tidak terdeteksi.")

      m.reply(`📝 *Hasil OCR:*\n\n${text}`)

    } catch (e) {
      console.error(e)
      m.reply("Gagal membaca teks dari gambar.")
    }
  }
}