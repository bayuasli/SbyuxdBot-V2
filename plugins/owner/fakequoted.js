/** @type {import('#lib/types.js').Plugin} */
export default {
  name: "fakequoted",
  category: "owner",
  command: ["fakequoted", "fq"],
  
  settings: {
    owner: false,
    private: false,
    group: false,
    admin: false,
    botAdmin: false,
    loading: false
  },

  run: async (conn, m) => {
    if (!m.text) {
      const defaultType = await getFQSetting(m.chat);
      if (defaultType) {
        return executeFakeQuoted(conn, m, defaultType);
      }
      return m.reply(`Contoh: ${m.prefix}fakequoted pixx\n\nList: pixx, pay, pack, poll, vn, gif, gc, video, loc, kontak, salr, order\n\nSetting: ${m.prefix}setfq [type]`);
    }

    try {
      await executeFakeQuoted(conn, m, m.text.toLowerCase());
    } catch (error) {
      console.error('[FAKEQUOTED ERROR]', error);
      m.reply('❌ Gagal mengirim fake quoted');
    }
  },

  on: async (conn, m) => {
    try {
      const defaultType = await getFQSetting(m.chat);
      if (defaultType && m.text && !m.text.startsWith(m.prefix || '.')) {
        setTimeout(async () => {
          try {
            await executeFakeQuoted(conn, m, defaultType, true);
          } catch (e) {}
        }, 100);
      }
      return false;
    } catch {
      return false;
    }
  }
};

async function getFQSetting(chatId) {
  try {
    const fs = await import('fs');
    const dbPath = './database/fq_settings.json';
    
    if (!fs.existsSync(dbPath)) {
      return null;
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    return db[chatId] || null;
    
  } catch {
    return null;
  }
}

async function executeFakeQuoted(conn, m, type, isAuto = false) {
  const pushname = m.pushName || "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱";
  const botname = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁";
  const ownername = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱";
  const wm = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱 𝗕𝗼𝘁";
  
  const fakeQuotedMap = {
    pixx: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        interactiveMessage: {
          nativeFlowMessage: {
            buttons: [{
              name: "payment_info",
              buttonParamsJson: JSON.stringify({
                payment_settings: [{
                  type: "pix_static_code",
                  pix_static_code: {
                    merchant_name: "bxx",
                    key: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱",
                    key_type: "PHONE"
                  }
                }]
              })
            }]
          }
        }
      }
    },
    
    pay: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        paymentInviteMessage: {
          serviceType: 3,
          expiryTimestamp: "200"
        }
      }
    },
    
    pack: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        stickerPackMessage: {
          name: pushname,
          publisher: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱"
        }
      }
    },
    
    poll: {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        pollCreationMessageV3: {
          name: pushname,
          options: [
            { optionName: "1" },
            { optionName: "2" }
          ],
          selectableOptionsCount: 1
        }
      }
    },
    
    vn: {
      key: {
        participant: `0@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        audioMessage: {
          mimetype: "audio/ogg; codecs=opus",
          seconds: 359996400,
          ptt: "true"
        }
      }
    },
    
    gif: {
      key: {
        participant: `0@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        videoMessage: {
          title: botname,
          h: wm,
          seconds: '359996400',
          gifPlayback: 'true',
          caption: ownername
        }
      }
    },
    
    gc: {
      key: {
        participant: "0@s.whatsapp.net",
        remoteJid: "0@s.whatsapp.net"
      },
      message: {
        groupInviteMessage: {
          groupJid: "6288213840883-1616169743@g.us",
          inviteCode: "m",
          groupName: wm,
          caption: `𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱`
        }
      }
    },
    
    video: {
      key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: "status@broadcast" } : {})
      },
      message: {
        videoMessage: {
          title: botname,
          h: wm,
          seconds: '359996400',
          caption: pushname
        }
      }
    },
    
    loc: {
      key: {
        participant: '0@s.whatsapp.net',
        ...(m.chat ? { remoteJid: `status@broadcast` } : {})
      },
      message: {
        locationMessage: {
          name: pushname
        }
      }
    },
    
    kontak: {
      key: {
        participant: `0@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: `status@broadcast` } : {})
      },
      message: {
        contactMessage: {
          displayName: ownername,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${ownername},;;;\nFN:${ownername}\nitem1.TEL;waid=628895307489:628895307489\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
          sendEphemeral: true
        }
      }
    },
    
    salr: {
      key: {
        remoteJid: '0@s.whatsapp.net',
        participant: '0@s.whatsapp.net'
      },
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "120363421313094892@newsletter",
          newsletterName: '𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱',
          caption: pushname
        }
      }
    },
    
    order: {
      key: {
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "BAE5C9E3C9A6C8D6",
        participant: "0@s.whatsapp.net"
      },
      message: {
        orderMessage: {
          productId: "8569472943180260",
          title: null,
          description: null,
          currencyCode: "IDR",
          priceAmount1000: "91000",
          message: pushname,
          surface: "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱"
        }
      }
    }
  };

  if (!fakeQuotedMap[type]) {
    if (!isAuto) {
      m.reply(`❌ Jenis tidak dikenal.`);
    }
    return;
  }

  const selectedFake = fakeQuotedMap[type];
  
  if (isAuto) {
    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: m.text,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          quotedMessage: selectedFake.message,
          participant: selectedFake.key.participant,
          stanzaId: selectedFake.key.id || 'BAE5C9E3C9A6C8D6'
        }
      }
    }, {});
  } else {
    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: `✅ Fake quoted "${type}" berhasil`,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          quotedMessage: selectedFake.message,
          participant: selectedFake.key.participant,
          stanzaId: selectedFake.key.id || 'BAE5C9E3C9A6C8D6'
        }
      }
    }, {});
  }
}