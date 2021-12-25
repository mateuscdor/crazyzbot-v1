import makeWASocket, { WASocket, SocketConfig, proto, WAMessageContent, decryptMediaMessageBuffer, WAMediaUpload, DisconnectReason } from "@adiwajshing/baileys-md";
import { Boom } from "@hapi/boom";
import fetchMsg from "./fetch";
let setting = require("../setting.json");
let log = console.log;

export class WAConn {
  sock: WASocket;
  setting: any;
  id: string;

  constructor(args: Partial<SocketConfig>) {
    if (!global.conn) global.conn = {};
    this.setting = setting;
    let startSock = () => {
      this.sock = makeWASocket(args);

      this.sock.ev.on("messages.upsert", async (m) => {
        // console.log(JSON.stringify(m, undefined, 2))
        const chat = m.messages[0];
        if (m.type === "notify") {
          if (!chat.message) return; //log(JSON.stringify(chat, null, 2));
          delete chat.message?.messageContextInfo;
          if (Object.keys(chat.message).length == 0) return;

          let jid = chat.key.remoteJid;
          jid && (await this.sock.presenceSubscribe(jid));
          await this.sock!.sendReadReceipt(jid, chat.key.participant || chat.key.remoteJid, [chat.key.id]);
          let msgFetched = await fetchMsg(this, chat);
          if (msgFetched.body == "prefix") return this.reply(msgFetched.from, this.setting.prefix, chat);
          if (msgFetched.isCmd)
            for await (let plugins of Object.keys(global.handler)) {
              let plugin = global.handler[plugins];
              if (plugin.prefix.includes(msgFetched.cmd)) {
                plugin.handler(this, chat, msgFetched);
              }
            }
        }
      });

      this.sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection == "open") {
          this.id = this.sock.user.id;
          log("CONNECTED: " + this.id);
          global.conn[this.id] = this;
          this.sock.sendMessage(this.id, { text: "BOT connected" });
          // sock.sendMessage(require('./setting.json').owner[0], {text: 'Connected'})
        }
        if (connection === "close") {
          // reconnect if not logged out
          if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
            startSock();
            // log("connection closed");
          } else {
            log("connection closed");
          }
        }
      });
    };
    startSock();
  }

  stop() {
    this.sock.end(new Error("Connection closed"));
  }

  cekPrefix() {
    return this.setting.prefix;
  }

  setPrefix(prefix: string) {
    this.setting.prefix = prefix;
  }

  reply(jid: string, text: string, quoted: proto.IWebMessageInfo) {
    return this.sock.sendMessage(jid, { text: text }, { quoted: quoted });
  }

  downloadMedia(message: WAMessageContent): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      let arr: any[] = [];
      (await decryptMediaMessageBuffer(message))
        .on("data", (e) => {
          arr.push(e);
        })
        .on("end", () => {
          resolve(Buffer.concat(arr));
        })
        .on("error", (e) => {
          reject("Error when tring to download media\n" + String(e));
        });
    });
  }

  sendImage(jid: string, image: WAMediaUpload, caption: string, quoted?: proto.IWebMessageInfo) {
    return this.sock.sendMessage(jid, { image: image, caption: caption }, { quoted: quoted });
  }

  sendSticker(jid: string, sticker: WAMediaUpload, caption: string, quoted?: proto.IWebMessageInfo) {
    return this.sock.sendMessage(jid, { sticker: sticker, caption: caption, mimetype: "image/webp" }, { quoted: quoted });
  }

  sendAudio(jid: string, audio: WAMediaUpload, caption: string, quoted?: proto.IWebMessageInfo) {
    return this.sock.sendMessage(jid, { audio: audio, caption: caption, mimetype: "audio/mpeg" }, { quoted: quoted });
  }

  sendVideo(jid: string, video: WAMediaUpload, caption: string, quoted?: proto.IWebMessageInfo) {
    return this.sock.sendMessage(jid, { video: video, caption: caption, mimetype: "video/mp4" }, { quoted: quoted });
  }
}
