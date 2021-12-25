import { proto, ChatModification, BufferJSON } from "@adiwajshing/baileys-md";
import P from "pino";
import { WAConn } from "../lib/conn";
import fetchMsg from "../lib/fetch"
import { compress, decompress} from "shrink-string"
// import qrcode = require("qrcode-terminal");
import qrcode = require("qrcode");

import {txt2qr} from "../function"
let log = console.log;

export async function handler(_conn: WAConn, chat: proto.IWebMessageInfo) {
  let msgFetched = await fetchMsg(_conn, chat)
  let from = chat.key.remoteJid;
  let isGroup = from.endsWith("@g.us");
  if (isGroup) return;
  let sess:any, prev:any

  if(msgFetched.body) {
    sess = await decompress(msgFetched.body)
    sess = JSON.parse(sess, BufferJSON.reviver)
  }

  if(!global.conns) global.conns = []
  if(!global.jadibot) global.jadibot = {}
  let botId = global.conns.length

  function startSock() {
    log(sess)
    let conn = new WAConn({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      auth: sess||null
    });

    let { sock } = conn;

    sock.ev.on("creds.update", function (state) {
      let int = setInterval(async () => {
        if(Object.keys(sock.authState.keys).length > 0){
          if(Object.keys(sock.authState).length == 0) return
          let sess = JSON.stringify(sock.authState, BufferJSON.replacer)
          let shorted = await compress(sess)
          _conn.sock.sendMessage(sock.user.id, {text: `you can login using this code by typing\n${conn.setting.prefix}jadibot ${shorted}`});
          clearInterval(int)
        }
      }, 1000)
    });
    
    sock.ev.on("connection.update", (update) => {
      let qr:string = update.qr;
      if(!qr) return;
      log("getQR")

      // qrcode.generate(qr, {small: true});

      qrcode.toDataURL(qr, async function (err: any, url: string) {
        if(prev) {
          _conn.sock.sendMessage(from, { delete: prev.key })
        }
        if (err) return _conn.reply(from, "error", chat);
        let qrImg = await Buffer.from(url.split("base64,")[1] || url, "base64")
        prev = await _conn.sock.sendMessage(from, {image:qrImg, caption:"scan this qr"}, {quoted:chat});
      });

      // txt2qr(qr)
      // .then(async qrImg=>{
      //     if(prev) {
      //       _conn.sock.sendMessage(from, { delete: prev.key })
      //     }
      //     prev = await _conn.sock.sendMessage(from, {image:qrImg, caption:"scan this qr"}, {quoted:chat});
      // })
      // .catch(e=>{
      //   log(e)
      //   if (e) return _conn.reply(from, "error", chat);
      // })
    });
    return conn
  }
  global.conns[botId] = startSock();
  global.jadibot[from] = global.conns[botId]
}

export let prefix = ["jadibot"];
