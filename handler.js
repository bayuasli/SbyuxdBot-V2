import axios from 'axios';
import { jidNormalizedUser } from '@whiskeysockets/baileys';
import util from 'util';
import cp from 'child_process';
import Api from '#lib/api.js';
import Func from '#lib/function.js';

export default async function Command(conn, m) {
  const quoted = m.isQuoted ? m.quoted : m;
  const downloadM = async (filename) => await conn.downloadMediaMessage(quoted, filename);
  const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false;
  const isOwner = m.fromMe || ownerNumber.includes(m.sender.split('@')[0]);

  if (m.isBot) return;
  if (!IS_PUBLIC && !isOwner) return;

  const metadata = m.isGroup ? conn.chats[m.chat] || (await conn.groupMetadata(m.chat).catch(() => null)) : {};
  const Admin = m.isGroup && metadata.participants.find(u => conn.getJid(u.id) === m.sender);
  const isAdmin = Admin?.admin === 'superadmin' || Admin?.admin === 'admin' || false;
  const isBotAdmin = m.isGroup && metadata.participants.find(u => conn.getJid(u.id) === jidNormalizedUser(conn.user.id))?.admin || false;

  const ctx = {
    Api,
    Func,
    downloadM,
    quoted,
    metadata,
    isOwner,
    isAdmin,
    isBotAdmin
  };

  for (const plugin of Object.values(plugins)) {
    if (typeof plugin.on === 'function') {
      try {
        const handled = await plugin.on.call(conn, m, ctx);
        if (handled) continue;
      } catch (e) {
        console.error(`[PLUGIN EVENT ERROR] ${plugin.name}`, e);
      }
    }

    if (isCommand) {
      const command = m.command?.toLowerCase();
      const isCmd =
        plugin?.command?.includes(command) ||
        (plugin?.alias && plugin.alias.includes(command));

      try {
        if (isCmd) {
          if (plugin.settings?.owner && !isOwner) {
            m.reply(mess.owner);
            continue;
          }
          if (plugin.settings?.private && m.isGroup) {
            m.reply(mess.private);
            continue;
          }
          if (plugin.settings?.group && !m.isGroup) {
            m.reply(mess.group);
            continue;
          }
          if (plugin.settings?.admin && !isAdmin) {
            m.reply(mess.admin);
            continue;
          }
          if (plugin.settings?.botAdmin && !isBotAdmin) {
            m.reply(mess.botAdmin);
            continue;
          }
          if (plugin.settings?.loading) m.reply(mess.wait);
          plugin.run(conn, m, ctx);
        }
      } catch (e) {
        console.error(`[PLUGIN ERROR] ${plugin.name}`, e);
        await m.reply('Terjadi error saat menjalankan command.');
      }
    }
  }

  if (['>', '=>'].some(a => m.body?.toLowerCase().startsWith(a)) && isOwner) {
    let evalCmd = '';
    try {
      evalCmd = /await/i.test(m.text)
        ? eval(`(async() => { ${m.text} })()`)
        : eval(m.text);
    } catch (e) {
      evalCmd = e;
    }

    new Promise((resolve, reject) => {
      try {
        resolve(evalCmd);
      } catch (err) {
        reject(err);
      }
    })
      ?.then(res => m.reply(util.format(res)))
      ?.catch(err => m.reply(util.format(err)));
  }

  if (m.body?.startsWith('$') && isOwner) {
    const exec = util.promisify(cp.exec).bind(cp);
    let o;
    try {
      o = await exec(m.text);
    } catch (e) {
      o = e;
    } finally {
      const { stdout, stderr } = o;
      if (stdout?.trim()) m.reply(stdout);
      if (stderr?.trim()) m.reply(stderr);
    }
  }
}