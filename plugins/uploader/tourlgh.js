/** @type {import('#lib/types.js').Plugin} */

import axios from 'axios'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const githubToken = 'YOUR_TOKEN_GITHUB'
const owner = 'github_owner'//tulis tanpa https://github.com,lgsg username aja cnth github.com/bayuasli,jadi lgsg tulis (bayuasli)//
const branch = 'main'
const repos = ['dat1', 'dat2', 'dat3', 'dat4']

export default {
  name: "tourlgh",
  category: "uploader",
  command: ["tourlgh", "upgh", "url"],

  settings: {
    loading: false
  },

  run: async (conn, m) => {
    try {
      const quoted = m.isQuoted ? m.quoted : m
      const mime = (quoted.msg || quoted).mimetype || ''

      if (!mime) return m.reply('❌ Reply file yang ingin diupload ke GitHub')

      m.reply('⏳ Mengupload file ke GitHub...')

      const buffer = await conn.downloadMediaMessage(quoted)
      if (!buffer || !buffer.length) return m.reply('❌ Gagal mendownload file')

      const url = await uploadFileToGitHub(buffer)
      await m.reply(`✅ *File uploaded successfully!*\n\n🔗 ${url}`)

    } catch (e) {
      console.error('[TOURL ERROR]', e)
      m.reply(`❌ Gagal mengupload: ${e.message}`)
    }
  }
}

async function ensureRepoExists(repo) {
  try {
    await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${githubToken}` }
    })
  } catch (e) {
    if (e.response?.status === 404) {
      await axios.post(`https://api.github.com/user/repos`,
        { name: repo, private: false, auto_init: true },
        { headers: { Authorization: `Bearer ${githubToken}` } }
      )
    } else throw e
  }
}

function generateRepoName() {
  return `dat-${crypto.randomBytes(3).toString('hex')}`
}

async function uploadFileToGitHub(buffer) {
  const detected = await fileTypeFromBuffer(buffer)
  const ext = detected?.ext || 'bin'

  const code = crypto.randomBytes(3).toString('hex')
  const fileName = `${code}-${Date.now()}.${ext}`
  const filePathGitHub = `uploads/${fileName}`
  const base64Content = buffer.toString('base64')

  let targetRepo = repos[Math.floor(Math.random() * repos.length)]

  try {
    await ensureRepoExists(targetRepo)
  } catch {
    targetRepo = generateRepoName()
    await ensureRepoExists(targetRepo)
  }

  await axios.put(
    `https://api.github.com/repos/${owner}/${targetRepo}/contents/${filePathGitHub}`,
    {
      message: `Upload file ${fileName}`,
      content: base64Content,
      branch
    },
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  )

  return `https://raw.githubusercontent.com/${owner}/${targetRepo}/${branch}/${filePathGitHub}`
}