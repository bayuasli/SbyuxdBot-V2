import { watchFile, unwatchFile } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import log from "#lib/logger.js";
import { LanguageManager } from "#lib/LanguageManager.js";

// === General Configuration ===

// Pairing number (used for QR/Pairing code scanning)
global.PAIRING_NUMBER = 6288228819127;


// Main and backup owner numbers
global.ownerNumber = ["6288228819127", "6288228819127", "628895307489"];

// Bot mode: false = self mode (owner only), true = public (accessible to everyone)
global.IS_PUBLIC = true;

// === WhatsApp Status Reader Settings ===
global.readsw = {
  active: true,
  react: true,
  emoji: ["🔥", "💀", "☠️", "🥀", "🥶"],
};

// === Multi-Language System ===

// Initialize LanguageManager (default language: 'id')
const langManager = new LanguageManager("en");

// Set the active language (change to 'en' for English)
langManager.setLanguage("en");

// Shortcut for easier global access
global.lang = langManager;

// Helper messages for the active language
global.mess = {
  wait: lang.get("mess.wait"),
  owner: lang.get("mess.owner"),
  group: lang.get("mess.group"),
  admin: lang.get("mess.admin"),
  botAdmin: lang.get("mess.botAdmin"),
  private: lang.get("mess.private"),
};

// === Watermark & UI Defaults ===
global.stickpack = "Created By";
global.stickauth = "𝗦𝗶𝗯𝗮𝘆𝘂𝗫𝗱";

global.title = "SbyuXd!";
global.body = "bxx?";
global.thumbnailUrl = "https://raw.githubusercontent.com/bayuasli/dat1/main/uploads/3cc483-1770382838164.jpg";

// === Hot Reload for config.js ===
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  log.info("✅ config.js reloaded successfully.");
  import(`${file}?update=${Date.now()}`);
});
