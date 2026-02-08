import axios from 'axios';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "ciciai",
  category: "ai-chat",
  command: ["ciciai", "nova", "cici"],
  alias: ["ci"],

  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m, context) => {
    let text = m.text?.trim();
    if (!text) {
      return conn.sendMessage(m.chat, { 
        text: 'Contoh:\n.ciciai Halo, apa kabar?\n\nSet persona: .ciciai --inst "Kamu adalah cewek manis yang suka ngegodain" Hai!\nReset: .ciciai --reset' 
      }, { quoted: m });
    }

    const sender = m.sender;
    const sessionsDir = path.join(process.cwd(), 'sessions');
    const sessionFile = path.join(sessionsDir, `${sender.replace(/[@:.]/g, '_')}_ciciai.json`);

    let instruction = '';
    let sessionData = {};

    await fs.mkdir(sessionsDir, { recursive: true }).catch(() => {});

    // Handle --inst atau --reset
    if (text.includes('--inst')) {
      const parts = text.split('--inst');
      text = parts[0].trim();
      instruction = parts[1]?.trim() || '';
    }

    if (text.includes('--reset')) {
      await fs.rm(sessionFile).catch(() => {});
      return conn.sendMessage(m.chat, { text: '✅ Session Cici AI direset. Mulai baru ya!' }, { quoted: m });
    }

    // Load session existing
    try {
      const data = await fs.readFile(sessionFile, 'utf-8');
      sessionData = JSON.parse(data);
      if (Date.now() - sessionData.lastUsed > 3600000) { // 1 jam expire
        await fs.rm(sessionFile);
        sessionData = {};
      }
    } catch (e) {
      // no session → fresh
    }

    try {
      const result = await ciciai(text, instruction || sessionData.instruction || '');

      // Simpan session (instruction persist)
      await fs.writeFile(sessionFile, JSON.stringify({
        instruction: instruction || sessionData.instruction || '',
        lastUsed: Date.now()
      }, null, 2));

      // Format balasan
      let reply = result.chat.trim();
      if (result.sources?.length > 0) {
        reply += '\n\nSumber:';
        result.sources.forEach(s => {
          reply += `\n• ${s.title} → ${s.url}`;
        });
      }

      await conn.sendMessage(m.chat, { text: reply }, { quoted: m });

    } catch (err) {
      console.error('[CICIAI PLUGIN ERROR]', err);
      await conn.sendMessage(m.chat, {
        text: `❌ Error: ${err.message || 'Gagal terhubung ke Cici AI. Coba lagi atau reset session.'}`
      }, { quoted: m });
    }
  }
};

/**
 * Fungsi Cici AI (Nova AI) unofficial
 * @param {string} question
 * @param {string} [customInstruction='']
 * @returns {Promise<{chat: string, sources: Array<{url:string, title:string}>}>}
 */
async function ciciai(question, customInstruction = '') {
  try {
    if (!question) throw new Error('Pertanyaan wajib diisi.');

    const rnd = () => Math.floor(Math.random() * 100000000000000000) + 1;
    const rndHex = () => Math.floor(Math.random() * 100000000000000000).toString(16);
    const randomStr = () => Math.random().toString(36).substring(7);

    const random = rnd();
    const cdid = '2' + rndHex().padStart(23, '0');
    const uid = rnd();
    const iid = rnd();
    const device_id = rnd();

    // Gabung instruction kalau ada
    let fullContent = question;
    if (customInstruction) {
      fullContent = `${customInstruction}\n\nUser: ${question}`;
    }

    const { data: rawData } = await axios.post(
      'https://api-normal-i18n.ciciai.com/im/sse/send/message',
      {
        channel: 3,
        cmd: 100,
        sequence_id: randomUUID(),
        uplink_body: {
          send_message_body: {
            ack_only: false,
            applet_payload: {},
            bot_id: '7241547611541340167',
            bot_type: 1,
            client_controller_param: {
              answer_with_suggest: true,
              local_language_code: 'en',
              local_nickname: 'Randy yuann',
              local_voice_id: '92'
            },
            content: JSON.stringify({
              im_cmd: -1,
              text: fullContent
            }),
            content_type: 1,
            conversation_id: '485805516280081',
            conversation_type: 3,
            create_time: Math.floor(Date.now() / 1000),
            ext: {
              create_time_ms: Date.now().toString(),
              record_status: '1',
              wiki: '1',
              search_engine_type: '1',
              media_search_type: '0',
              answer_with_suggest: '1',
              system_language: 'en',
              enter_method_trace: '',
              previous_page_trace: '',
              is_audio: 'false',
              voice_mix_input: '0',
              tts: '1',
              ugc_plugin_auth_infos: '[]',
              is_app_background: '0',
              is_douyin_installed: '0',
              is_luna_installed: '0',
              media_player_business_scene: '',
              need_deep_think: '0',
              need_net_search: '0',
              send_message_scene: 'keyboard'
            },
            client_fallback_param: {
              last_section_id: '',
              last_message_index: -1
            },
            local_message_id: rndHex(),
            sender_id: '7584067883349640200',
            status: 0,
            unique_key: rndHex()
          }
        },
        version: '1'
      },
      {
        params: {
          flow_im_arch: 'v2',
          device_platform: 'android',
          os: 'android',
          ssmix: 'a',
          _rticket: random,
          cdid: cdid,
          channel: 'googleplay',
          aid: '489823',
          app_name: 'nova_ai',
          version_code: Math.floor(Math.random() * 1000000) + 1,
          version_name: randomStr(),
          manifest_version_code: Math.floor(Math.random() * 1000000) + 1,
          update_version_code: Math.floor(Math.random() * 1000000) + 1,
          resolution: `\( {Math.floor(Math.random() * 1000) + 1}x \){Math.floor(Math.random() * 1000) + 1}`,
          dpi: Math.floor(Math.random() * 1000) + 1,
          device_type: randomStr(),
          device_brand: randomStr(),
          language: 'en',
          os_api: Math.floor(Math.random() * 100) + 1,
          os_version: randomStr(),
          ac: 'wifi',
          uid: uid,
          carrier_region: 'ID',
          sys_region: 'US',
          tz_name: 'Asia/Shanghai',
          is_new_user: '1',
          region: 'US',
          lang: 'en',
          pkg_type: 'release_version',
          iid: iid,
          device_id: device_id,
          flow_sdk_version: Math.floor(Math.random() * 1000000) + 1,
          'use-olympus-account': '1'
        },
        headers: {
          'Accept-Encoding': 'gzip',
          'Connection': 'Keep-Alive',
          'Content-Type': 'application/json; encoding=utf-8',
          'Host': 'api-normal-i18n.ciciai.com',
          'passport-sdk-version': '505174',
          'req_biz_id': 'Message',
          'sdk-version': '2',
          'User-Agent': 'com.larus.wolf/8090004 (Linux; U; Android 12; en_US; SM-S9180; Build/PQ3B.190801.10101846;tt-ok/3.12.13.18)',
          'x-tt-store-region': 'id',
          'x-tt-store-region-src': 'uid',
          'X-Tt-Token': '0329aceacb51f4b2d468e8709307dcc44604a72f48ba71143b3403209f8f98cf37f4111f4fe8bac693d57dd0580c0e13a32d8d230813a3064feaf53b9d8fd9e5ae0256d50c4b29427687873645bd92d3b842a-1.0.0'
        }
      }
    );

    // Parse sources
    const sources = [];
    const dataRegex = /data:\s*(\{.*?\})(?=\n\s*id:|\n*$)/gs;
    let match;
    while ((match = dataRegex.exec(rawData)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        const body = json?.downlink_body?.fetch_chunk_message_downlink_body;
        if (!body) continue;
        const contentObj = JSON.parse(body.content);
        const tags = contentObj?.text_tags || [];
        tags.forEach(tag => {
          const tagInfo = JSON.parse(tag.tag_info);
          if (tagInfo.url && tagInfo.title) {
            sources.push({ url: tagInfo.url, title: tagInfo.title });
          }
        });
      } catch (e) {
        continue;
      }
    }

    // Parse main content
    const originRegex = /"origin_content"\s*:\s*"([^"]*)"/g;
    const result = [];
    while ((match = originRegex.exec(rawData)) !== null) {
      result.push(match[1]);
    }

    const chat = result.join('').replace(/\\n/g, '\n').trim();

    if (!chat) throw new Error('Tidak ada respon dari Cici AI.');

    return { chat, sources };

  } catch (error) {
    throw new Error(error.message || 'Gagal memproses request ke Cici AI.');
  }
}