/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "pluginconverter",
  category: "tools",
  command: ["toplugin", "makeplugin"],
  alias: ["pluginize", "convertplugin"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, { quoted }) => {
    try {
      if (!quoted || !quoted.text) {
        return m.reply(
          `🤖 *Plugin Converter*\n\n` +
          `Ubah kode JavaScript apapun menjadi format plugin WhatsApp Bot!\n\n` +
          `📋 *Cara pakai:*\n` +
          `1. Reply pesan yang berisi kode JavaScript\n` +
          `2. Ketik: \`${m.prefix}toplugin\`\n` +
          `3. Bot akan konversi ke format plugin\n\n` +
          `✨ *Fitur:*\n` +
          `• Auto generate plugin structure\n` +
          `• Auto detect command dari fungsi\n` +
          `• Auto add import jika diperlukan\n` +
          `• Auto format sesuai style bot\n\n` +
          `📝 *Contoh:*\n` +
          `Reply kode: \`async function cekCuaca() {}\`\n` +
          `Hasil: Plugin lengkap dengan command cekcuaca`
        );
      }

      const originalCode = quoted.text.trim();
      
      if (originalCode.length < 10) {
        return m.reply('❌ Kode terlalu pendek. Minimal 10 karakter.');
      }

      // Konversi kode ke format plugin
      const pluginCode = convertToPlugin(originalCode, m.prefix);
      
      // Format response
      const response = `✅ *PLUGIN READY*\n\n` +
                      `📥 *Kode asli:*\n` +
                      `\`\`\`javascript\n${originalCode.substring(0, 150)}${originalCode.length > 150 ? '...' : ''}\n\`\`\`\n\n` +
                      `📤 *Hasil konversi:*\n` +
                      `\`\`\`javascript\n${pluginCode.substring(0, 600)}${pluginCode.length > 600 ? '...' : ''}\n\`\`\`\n\n` +
                      `🚀 *Instalasi:*\n` +
                      `1. Copy semua kode di atas\n` +
                      `2. Paste ke file baru (contoh: plugin.js)\n` +
                      `3. Save di folder \`plugins/\`\n` +
                      `4. Bot akan auto reload\n` +
                      `5. Test dengan: \`${pluginCode.includes('command:') ? extractCommands(pluginCode).join(', ') : 'perintah_yang_dideteksi'}\``;

      await m.reply(response);

    } catch (error) {
      console.error('[PLUGIN CONVERTER ERROR]', error);
      m.reply('❌ Gagal mengkonversi: ' + error.message);
    }
  }
};

// Fungsi utama konversi
function convertToPlugin(code, prefix = '.') {
  // Deteksi tipe kode
  const codeType = detectCodeType(code);
  
  // Ekstrak nama dari kode
  const pluginName = extractPluginName(code) || 'MyPlugin';
  const commands = extractCommandsFromCode(code) || ['mycommand'];
  const category = detectCategory(code);
  
  // Generate plugin structure
  let plugin = `/** @type {import('#lib/types.js').Plugin} */\n`;
  
  // Tambah import jika diperlukan
  if (code.includes('axios') || code.includes('fetch')) {
    plugin += `import axios from 'axios';\n\n`;
  }
  
  if (code.includes('fs.') || code.includes('require(\'fs\')')) {
    plugin += `import fs from 'fs';\n\n`;
  }
  
  if (code.includes('crypto') || code.includes('require(\'crypto\')')) {
    plugin += `import crypto from 'crypto';\n\n`;
  }
  
  plugin += `export default {\n`;
  plugin += `  name: "${sanitizeName(pluginName)}",\n`;
  plugin += `  category: "${category}",\n`;
  plugin += `  command: ${JSON.stringify(commands)},\n`;
  plugin += `  alias: [],\n`;
  plugin += `  \n`;
  plugin += `  settings: {\n`;
  plugin += `    owner: false,\n`;
  plugin += `    private: false,\n`;
  plugin += `    group: false,\n`;
  plugin += `    admin: false,\n`;
  plugin += `    botAdmin: false,\n`;
  plugin += `    loading: true\n`;
  plugin += `  },\n`;
  plugin += `  \n`;
  plugin += `  run: async (conn, m, { Api, Func, downloadM, quoted, metadata, isOwner, isAdmin, isBotAdmin }) => {\n`;
  plugin += `    try {\n`;
  
  // Tambahkan logika berdasarkan tipe kode
  switch(codeType) {
    case 'function':
      plugin += convertFunctionToPlugin(code, commands[0]);
      break;
    case 'async_function':
      plugin += convertAsyncFunctionToPlugin(code, commands[0]);
      break;
    case 'class':
      plugin += convertClassToPlugin(code, commands[0]);
      break;
    case 'simple_code':
      plugin += convertSimpleCodeToPlugin(code);
      break;
    default:
      plugin += convertGenericCodeToPlugin(code, commands[0]);
  }
  
  plugin += `    } catch (error) {\n`;
  plugin += `      console.error('[${sanitizeName(pluginName)} ERROR]', error);\n`;
  plugin += `      m.reply('❌ Error: ' + error.message);\n`;
  plugin += `    }\n`;
  plugin += `  }\n`;
  plugin += `};\n`;
  
  // Tambahkan helper functions jika ada di kode asli
  if (code.includes('function ') || code.includes('const ') || code.includes('let ')) {
    plugin += `\n// Helper functions\n`;
    
    // Ekstrak fungsi-fungsi helper dari kode asli
    const helperFunctions = extractHelperFunctions(code);
    plugin += helperFunctions.join('\n\n');
  }
  
  return plugin;
}

// Helper functions
function detectCodeType(code) {
  if (code.includes('async function')) return 'async_function';
  if (code.includes('function')) return 'function';
  if (code.includes('class ')) return 'class';
  if (code.includes('export') || code.includes('module.exports')) return 'module';
  return 'simple_code';
}

function extractPluginName(code) {
  // Cari nama dari function
  const funcMatch = code.match(/(?:async\s+)?function\s+(\w+)/);
  if (funcMatch) return funcMatch[1];
  
  // Cari nama dari class
  const classMatch = code.match(/class\s+(\w+)/);
  if (classMatch) return classMatch[1];
  
  // Cari dari variable name
  const varMatch = code.match(/const\s+(\w+)\s*=/);
  if (varMatch) return varMatch[1];
  
  // Cari dari export
  const exportMatch = code.match(/export\s+(?:default\s+)?(\w+)/);
  if (exportMatch) return exportMatch[1];
  
  return null;
}

function extractCommandsFromCode(code) {
  const commands = [];
  
  // Cari nama fungsi utama
  const funcName = extractPluginName(code);
  if (funcName) {
    // Convert camelCase to kebab-case untuk command
    const kebabName = funcName.replace(/([a-z])([A-Z])/g, '$1$2').toLowerCase();
    commands.push(kebabName);
    
    // Tambah singkatan jika panjang
    if (funcName.length > 6) {
      commands.push(funcName.substring(0, 3).toLowerCase());
    }
  }
  
  // Default command jika tidak ditemukan
  if (commands.length === 0) {
    commands.push('run', 'start');
  }
  
  return commands;
}

function detectCategory(code) {
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('download') || lowerCode.includes('youtube') || lowerCode.includes('tiktok') || lowerCode.includes('instagram')) {
    return 'downloader';
  }
  
  if (lowerCode.includes('sticker') || lowerCode.includes('image') || lowerCode.includes('edit') || lowerCode.includes('gambar')) {
    return 'media';
  }
  
  if (lowerCode.includes('game') || lowerCode.includes('fun') || lowerCode.includes('quiz') || lowerCode.includes('tebak')) {
    return 'game';
  }
  
  if (lowerCode.includes('admin') || lowerCode.includes('kick') || lowerCode.includes('ban') || lowerCode.includes('promote')) {
    return 'admin';
  }
  
  if (lowerCode.includes('info') || lowerCode.includes('help') || lowerCode.includes('status') || lowerCode.includes('cek')) {
    return 'utility';
  }
  
  if (lowerCode.includes('ai') || lowerCode.includes('chat') || lowerCode.includes('gpt') || lowerCode.includes('openai')) {
    return 'ai';
  }
  
  return 'tools';
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]+/, '');
}

function extractCommands(pluginCode) {
  const cmdMatch = pluginCode.match(/command:\s*(\[[^\]]+\])/);
  if (cmdMatch) {
    try {
      return JSON.parse(cmdMatch[1].replace(/'/g, '"'));
    } catch {}
  }
  return ['command1'];
}

// Konversi berdasarkan tipe kode
function convertFunctionToPlugin(code, command) {
  let pluginCode = '';
  
  // Cari isi fungsi
  const funcMatch = code.match(/function\s+\w+\s*\(([^)]*)\)\s*\{([\s\S]*?)\}$/m);
  
  if (funcMatch) {
    const params = funcMatch[1].trim();
    const body = funcMatch[2].trim();
    
    // Convert parameter ke context bot
    let convertedBody = body;
    
    // Ganti parameter dengan context bot jika sesuai
    if (params.includes('m') || params.includes('msg') || params.includes('message')) {
      // Parameter sudah sesuai dengan m
      pluginCode += `      ${body}\n`;
    } else {
      // Buang parameter asli, gunakan m dari bot
      pluginCode += `      // Ekstrak input dari pesan\n`;
      pluginCode += `      const input = m.text?.trim() || '';\n`;
      pluginCode += `      \n`;
      
      // Panggil fungsi asli dengan parameter yang sesuai
      if (params) {
        const funcName = extractPluginName(code);
        pluginCode += `      const result = ${funcName}(${generateFunctionParams(params, 'input')});\n`;
        pluginCode += `      \n`;
        pluginCode += `      // Kirim hasil\n`;
        pluginCode += `      if (result) {\n`;
        pluginCode += `        await m.reply(result);\n`;
        pluginCode += `      } else {\n`;
        pluginCode += `        await m.reply('✅ Selesai!');\n`;
        pluginCode += `      }\n`;
      } else {
        pluginCode += `      ${body}\n`;
      }
    }
  } else {
    // Jika parsing gagal, masukkan kode langsung
    pluginCode += `      ${code}\n`;
    pluginCode += `      \n`;
    pluginCode += `      // Kirim konfirmasi\n`;
    pluginCode += `      await m.reply('✅ Eksekusi berhasil!');\n`;
  }
  
  return pluginCode;
}

function convertAsyncFunctionToPlugin(code, command) {
  let pluginCode = '';
  
  // Cari isi async function
  const asyncMatch = code.match(/async\s+function\s+\w+\s*\(([^)]*)\)\s*\{([\s\S]*?)\}$/m);
  
  if (asyncMatch) {
    const params = asyncMatch[1].trim();
    const body = asyncMatch[2].trim();
    
    pluginCode += `      // Ekstrak input\n`;
    pluginCode += `      const input = m.text?.trim() || '';\n`;
    pluginCode += `      \n`;
    pluginCode += `      // Kirim pesan loading\n`;
    pluginCode += `      m.reply('⏳ Memproses...');\n`;
    pluginCode += `      \n`;
    
    const funcName = extractPluginName(code);
    pluginCode += `      // Eksekusi fungsi asli\n`;
    pluginCode += `      const result = await ${funcName}(${generateFunctionParams(params, 'input')});\n`;
    pluginCode += `      \n`;
    pluginCode += `      // Format dan kirim hasil\n`;
    pluginCode += `      if (typeof result === 'string') {\n`;
    pluginCode += `        await m.reply(result);\n`;
    pluginCode += `      } else if (result) {\n`;
    pluginCode += `        await m.reply(JSON.stringify(result, null, 2));\n`;
    pluginCode += `      }\n`;
  } else {
    pluginCode += `      // Eksekusi kode async\n`;
    pluginCode += `      try {\n`;
    pluginCode += `        ${code}\n`;
    pluginCode += `        await m.reply('✅ Selesai!');\n`;
    pluginCode += `      } catch (e) {\n`;
    pluginCode += `        throw e;\n`;
    pluginCode += `      }\n`;
  }
  
  return pluginCode;
}

function convertClassToPlugin(code, command) {
  return `      // Instance class\n` +
         `      const instance = new ${extractPluginName(code)}();\n` +
         `      \n` +
         `      // Eksekusi method utama\n` +
         `      const input = m.text?.trim() || '';\n` +
         `      const result = await instance.execute(input);\n` +
         `      \n` +
         `      if (result) {\n` +
         `        await m.reply(result);\n` +
         `      }\n`;
}

function convertSimpleCodeToPlugin(code) {
  return `      // Eksekusi kode\n` +
         `      const input = m.text?.trim() || '';\n` +
         `      \n` +
         `      ${code.replace(/\n/g, '\n      ')}\n` +
         `      \n` +
         `      await m.reply('✅ Kode dieksekusi!');\n`;
}

function convertGenericCodeToPlugin(code, command) {
  return `      // Konteks yang tersedia:\n` +
         `      // - m: message object\n` +
         `      // - conn: connection\n` +
         `      // - Api, Func, downloadM, quoted, metadata\n` +
         `      // - isOwner, isAdmin, isBotAdmin\n` +
         `      \n` +
         `      const input = m.text?.trim() || '';\n` +
         `      \n` +
         `      ${code.replace(/\n/g, '\n      ')}\n` +
         `      \n` +
         `      await m.reply('✅ Eksekusi selesai!');\n`;
}

function extractHelperFunctions(code) {
  const functions = [];
  
  // Cari semua fungsi helper (bukan fungsi utama)
  const funcRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function[^{]+\{[\s\S]*?\}(?=\s*(?:const|let|var|$))/g;
  const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{?[\s\S]*?\}?(?=\s*(?:const|let|var|$))/g;
  
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    functions.push(match[0]);
  }
  
  while ((match = arrowRegex.exec(code)) !== null) {
    functions.push(match[0]);
  }
  
  return functions;
}

function generateFunctionParams(params, defaultInput) {
  if (!params) return '';
  
  const paramList = params.split(',').map(p => p.trim());
  
  // Map parameter ke nilai yang sesuai
  return paramList.map(param => {
    if (param === 'input' || param === 'text' || param === 'query') {
      return defaultInput;
    } else if (param === 'message' || param === 'msg' || param === 'm') {
      return 'm';
    } else if (param === 'sender' || param === 'user') {
      return 'm.sender';
    } else if (param === 'chat') {
      return 'm.chat';
    } else {
      return `/* ${param} */ null`;
    }
  }).join(', ');
}