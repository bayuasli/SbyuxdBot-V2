/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "moduleconverter",
  category: "tools",
  command: ["toesm", "tocjs"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    try {
      
      if (!m.isQuoted) {
        return m.reply(
          `📝 *Module Converter*\n\n` +
          `Reply pesan yang berisi kode dengan:\n` +
          `• ${m.prefix}toesm - Convert CJS → ESM\n` +
          `• ${m.prefix}tocjs - Convert ESM → CJS\n\n` +
          `_Hanya support reply message_`
        );
      }

      
      const quoted = m.quoted;
      const codeToConvert = quoted.text || quoted.body || '';
      
      if (!codeToConvert) {
        return m.reply('❌ Pesan yang di-reply tidak mengandung teks/kode');
      }

      const command = m.command?.toLowerCase();
      let result;
      
      if (command === 'toesm') {
        result = convertCJSToESM(codeToConvert);
      } else if (command === 'tocjs') {
        result = convertESMToCJS(codeToConvert);
      } else {
        return m.reply('❌ Perintah tidak dikenal');
      }

      
      await conn.sendMessage(m.chat, {
        text: `✅ *${command === 'toesm' ? 'CJS → ESM' : 'ESM → CJS'}*\n\n\`\`\`javascript\n${result}\n\`\`\``,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }, { quoted: m });

    } catch (error) {
      console.error('[MODULE CONVERTER ERROR]', error);
      m.reply('❌ Gagal mengkonversi kode');
    }
  }
};

function convertCJSToESM(code) {
  let result = code;
  
  
  result = result.replace(/const (\w+)\s*=\s*require\(['"](.+?)['"]\);/g, 'import $1 from \'$2\';');
  result = result.replace(/let (\w+)\s*=\s*require\(['"](.+?)['"]\);/g, 'import $1 from \'$2\';');
  result = result.replace(/var (\w+)\s*=\s*require\(['"](.+?)['"]\);/g, 'import $1 from \'$2\';');
  
  
  result = result.replace(/const\s*\{([^}]+)\}\s*=\s*require\(['"](.+?)['"]\);/g, 'import { $1 } from \'$2\';');
  
  
  result = result.replace(/module\.exports\s*=\s*(\w+);/g, 'export default $1;');
  result = result.replace(/module\.exports\s*=\s*\{/g, 'export {');
  result = result.replace(/exports\.(\w+)\s*=\s*(\w+);/g, 'export const $1 = $2;');
  
  return result.trim();
}

function convertESMToCJS(code) {
  let result = code;
  
 
  result = result.replace(/import (\w+) from ['"](.+?)['"];/g, 'const $1 = require(\'$2\');');
  
  
  result = result.replace(/import \{([^}]+)\} from ['"](.+?)['"];/g, (match, p1) => {
    const imports = p1.split(',').map(i => i.trim());
    return `const { ${imports.join(', ')} } = require('${p2}');`;
  });
  

  result = result.replace(/export default (\w+);/g, 'module.exports = $1;');
  

  result = result.replace(/export const (\w+) = (\w+);/g, 'exports.$1 = $2;');
  
  return result.trim();
}