/**
 🍀 Scrape AI FREE FOREVER 
 
 * CR Ponta CT
 * CH https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z
 * WEB https://codeteam.my.id
 
**/

import fetch from "node-fetch";
import fs from "fs";

async function AiCT(question, imagePath) {
  let file = null;

  if (imagePath) {
    const buffer = fs.readFileSync(imagePath);
    file = {
      data: buffer.toString("base64"),
      type: "image/jpeg",
      name: imagePath.split("/").pop()
    };
  }

  const res = await fetch("https://aifreeforever.com/api/generate-ai-answer", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "id-ID",
      "content-type": "application/json",
      "referer": "https://aifreeforever.com/tools/free-chatgpt-no-login"
    },
    body: JSON.stringify({
      question,
      tone: "friendly",
      format: "paragraph",
      file
    })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return data.answer;
}

(async () => {
  try {
  
  // #Contoh Kalo Cuma Text
    const result = await AiCT("siapa nama anda?");
    console.log(result);
    
/* 
// #Contoh Kalo Ada Foto
    const resultWithImage = await AiCT("gambar apa itu", "./wm.jpg");
    console.log(resultWithImage);
*/

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();