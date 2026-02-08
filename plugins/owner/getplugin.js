/** @type {import('#lib/types.js').Plugin} */

import fs from 'fs'

import path from 'path'

export default {

  name: "getplugin",

  category: "owner",

  command: ["gp", "getplugin"],

  settings: {

    owner: true,

    private: false,

    group: false,

    admin: false,

    botAdmin: false,

    loading: false

  },

  run: async (conn, m) => {

    if (!m.text) return m.reply("Contoh: .gp tools/ping")

    const input = m.text.trim()

    const baseDir = path.join(process.cwd(), 'plugins')

    let filePath

    if (input.includes('/')) {

      filePath = path.join(baseDir, input + '.js')

    } else {

      const folders = fs.readdirSync(baseDir)

      for (const folder of folders) {

        const possible = path.join(baseDir, folder, input + '.js')

        if (fs.existsSync(possible)) {

          filePath = possible

          break

        }

      }

    }

    if (!filePath || !fs.existsSync(filePath)) {

      return m.reply("❌ Plugin tidak ditemukan.")

    }

    const code = fs.readFileSync(filePath, 'utf8')

    m.reply(code)

  }

}