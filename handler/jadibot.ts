import { proto, ChatModification } from "@adiwajshing/baileys-md";
import P from "pino";
import { WAConn } from "../lib/conn";
import fs from "fs"
import qrcode = require("qrcode");
let log = console.log;

export function handler(_conn: WAConn, chat: proto.IWebMessageInfo) {
  let from = chat.key.remoteJid;
  let isGroup = from.endsWith("@g.us");
  if (isGroup) return;
  function startSock() {
    let prev:proto.IWebMessageInfo, prevId;
    let conn = new WAConn({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
    });

    let { sock } = conn;

    sock.ev.on("creds.update", function (state) {
      // log(JSON.parse(JSON.stringify(state, BufferJSON.replacer), BufferJSON.reviver));
    });
    
    sock.ev.on("connection.update", (update) => {
      let qr:string = update.qr;
      if(!qr) return;
      log("getQR")
      qrcode.toDataURL(qr, async function (err: any, url: string) {
        if(prev) {
          _conn.sock.sendMessage(from, { delete: prev.key })
        }
        if (err) return _conn.reply(from, "error", chat);
        let qrImg = await Buffer.from(url.split("base64,")[1] || url, "base64")
        prev = await _conn.sock.sendMessage(from, {image:qrImg, caption:"scan this qr"}, {quoted:chat});
      });
    });
  }
  startSock();
}

export let prefix = ["jadibot"];
