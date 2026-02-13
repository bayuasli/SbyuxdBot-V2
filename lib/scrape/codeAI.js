const axios = require('axios'), FormData = require('form-data'), fs = require('fs')

const codeAI = {
  api: {
    base: 'https://django-app-4tbtjdxw2a-uc.a.run.app',
    endpoints: {
      promptToCode: '/prompt_to_code/',
      detectBugs: '/detect_bugs/',
      convertCode: '/convert_code/',
      explainCode: '/code_explainer/',
      imageToSolve: '/image_to_solve/'
    }
  },
  
  headers: {
    'user-agent': 'AgungDevX Android/1.0.0',
    'content-type': 'application/json',
    'accept': 'application/json'
  },
  
  languages: {
    html: 1, c: 2, 'c++': 3, 'c#': 4, dart: 5, java: 6, swift: 7, python: 8, r: 9,
    javascript: 10, matlab: 11, ruby: 12, typescript: 13, kotlin: 14, go: 15, jshell: 16,
    python2: 17, groovy: 18, nodejs: 19, scala: 20, assembly: 21, julia: 22, 'objective-j': 23,
    rust: 24, react: 25, angular: 26, perlu: 27, lua: 28, php: 29, jquery: 30, bootstrap: 31,
    vue: 32, 'objective-c': 33, clojure: 34, vue3: 35, fotran: 36, cobol: 37, crystal: 38
  },
  
  ip: () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.'),
  
  promptToCode: async (prompt, language) => {
    const langId = codeAI.languages[language?.toLowerCase()]
    if (!prompt || !langId) return { error: 'Prompt dan bahasa diperlukan' }
    
    try {
      const { data } = await axios.post(`${codeAI.api.base}${codeAI.api.endpoints.promptToCode}`, {
        prompt: prompt.trim(), language: langId, ip_address: codeAI.ip()
      }, { headers: codeAI.headers })
      
      if (data.Status !== 1 || !data.Data) return { error: data.Message || 'Gagal' }
      const { title, language, code, explanation } = data.Data
      return { title, language, code, explanation }
    } catch (err) {
      return { error: err.response?.data?.Message || err.message }
    }
  },
  
  detectBugs: async (code) => {
    if (!code?.trim()) return { error: 'Kode diperlukan' }
    
    try {
      const { data } = await axios.post(`${codeAI.api.base}${codeAI.api.endpoints.detectBugs}`, {
        code: code.trim(), ip_address: codeAI.ip()
      }, { headers: codeAI.headers })
      
      if (data.Status !== 1 || !data.Data) return { error: data.Message || 'Gagal' }
      const { title, language, code: fixedCode, explanation } = data.Data
      return { title, language, code: fixedCode, explanation }
    } catch (err) {
      return { error: err.response?.data?.Message || err.message }
    }
  },
  
  convertCode: async (code, targetLanguage, sourceLanguage) => {
    const targetId = codeAI.languages[targetLanguage?.toLowerCase()]
    if (!code || !targetId) return { error: 'Kode dan bahasa target diperlukan' }
    
    const prompt = sourceLanguage ? `${sourceLanguage}\n\n${code}`.trim() : code.trim()
    
    try {
      const { data } = await axios.post(`${codeAI.api.base}${codeAI.api.endpoints.convertCode}`, {
        prompt, language: targetId, ip_address: codeAI.ip()
      }, { headers: codeAI.headers })
      
      if (data.Status !== 1 || !data.Data) return { error: data.Message || 'Gagal' }
      const { title, language, code: convertedCode, explanation } = data.Data
      return { title, language, code: convertedCode, explanation }
    } catch (err) {
      return { error: err.response?.data?.Message || err.message }
    }
  },
  
  explainCode: async (code, language) => {
    if (!code?.trim()) return { error: 'Kode diperlukan' }
    
    try {
      const { data } = await axios.post(`${codeAI.api.base}${codeAI.api.endpoints.explainCode}`, {
        code: code.trim(), optional_param: language?.trim() || '', ip_address: codeAI.ip()
      }, { headers: codeAI.headers })
      
      if (data.Status !== 1 || !data.Data) return { error: data.Message || 'Gagal' }
      const { title, language: lang, code: explainedCode, explanation } = data.Data
      return { title, language: lang, code: explainedCode, explanation }
    } catch (err) {
      return { error: err.response?.data?.Message || err.message }
    }
  },
  
  imageToSolve: async (imagePath, prompt = '', language) => {
    const langId = codeAI.languages[language?.toLowerCase()]
    if (!langId || !imagePath) return { error: 'Gambar dan bahasa diperlukan' }
    
    try {
      const form = new FormData()
      form.append('prompt', prompt || '')
      form.append('image', fs.createReadStream(imagePath))
      form.append('ip_address', codeAI.ip())
      form.append('language', langId)
      
      const { data } = await axios.post(`${codeAI.api.base}${codeAI.api.endpoints.imageToSolve}`, form, {
        headers: form.getHeaders()
      })
      
      if (data.Status !== 1 || !data.Data) return { error: data.Message || 'Gagal' }
      const { title, language: lang, code, explanation } = data.Data
      return { title, language: lang, code, explanation }
    } catch (err) {
      return { error: err.response?.data?.Message || err.message }
    }
  }
}

// Penggunaan CLI
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  const params = args.slice(1)
  
  const commands = {
    'prompt': { fn: codeAI.promptToCode, usage: '<prompt> <bahasa>', desc: 'Buat kode dari prompt' },
    'detect': { fn: codeAI.detectBugs, usage: '<file_kode>', desc: 'Cari bug di kode' },
    'convert': { fn: codeAI.convertCode, usage: '<file_kode> <bahasa_target> [bahasa_sumber]', desc: 'Ubah kode ke bahasa lain' },
    'explain': { fn: codeAI.explainCode, usage: '<file_kode> [bahasa]', desc: 'Jelaskan kode' },
    'image': { fn: codeAI.imageToSolve, usage: '<path_gambar> [prompt] [bahasa]', desc: 'Buat kode dari gambar' }
  }
  
  if (!command || !commands[command]) {
    console.log("Penggunaan: node codeai.js <perintah> [args]")
    console.log("\nPerintah:")
    Object.entries(commands).forEach(([cmd, info]) => console.log(`  ${cmd} ${info.usage} - ${info.desc}`))
    console.log("\nBahasa yang didukung:", Object.keys(codeAI.languages).join(', '))
    process.exit(1)
  }
  
  async function run() {
    try {
      let result
      const cmd = commands[command]
      
      switch (command) {
        case 'prompt':
          if (params.length < 2) throw 'Butuh prompt dan bahasa'
          result = await cmd.fn(params[0], params[1])
          break
        case 'detect':
          if (params.length < 1) throw 'Butuh file kode'
          const code1 = fs.readFileSync(params[0], 'utf-8')
          result = await cmd.fn(code1)
          break
        case 'convert':
          if (params.length < 2) throw 'Butuh file kode dan bahasa target'
          const code2 = fs.readFileSync(params[0], 'utf-8')
          result = await cmd.fn(code2, params[1], params[2])
          break
        case 'explain':
          if (params.length < 1) throw 'Butuh file kode'
          const code3 = fs.readFileSync(params[0], 'utf-8')
          result = await cmd.fn(code3, params[1])
          break
        case 'image':
          if (params.length < 1) throw 'Butuh path gambar'
          result = await cmd.fn(params[0], params[1], params[2])
          break
      }
      
      if (result.error) {
        console.error("Error:", result.error)
        process.exit(1)
      }
      
      console.log(JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("Error:", error.message || error)
      process.exit(1)
    }
  }
  
  run()
}

module.exports = codeAI

/*
 * Contoh penggunaan 
 *

# Buat kode dari prompt
$ node codeai.js prompt "buat halaman login" javascript

# Cari bug  
$ node codeai.js detect kode.js

# Ubah kode ke bahasa lain
$ node codeai.js convert kode.py javascript python

# Jelaskan kode
$ node codeai.js explain kode.js

# Gambar ke kode
$ node codeai.js image screenshot.png "perbaiki ini" python

 */