import makeWASocket, { WASocket, SocketConfig, proto, WAMessageContent, decryptMediaMessageBuffer, WAMediaUpload } from "@adiwajshing/baileys-md";
let log = console.log;

export class WAConn {
  sock: WASocket;
  constructor(args: Partial<SocketConfig>) {
    this.sock = makeWASocket(args);
  }

  reply(jid: string, text: string, quoted: proto.IWebMessageInfo) {
    this.sock.sendMessage(jid, { text: text }, { quoted: quoted });
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

  sendImage(jid:string, image:WAMediaUpload, caption:string, quoted?:proto.IWebMessageInfo){
       this.sock.sendMessage(jid, {image:image, caption:caption}, {quoted:quoted})
  }

  sendSticker(jid:string, sticker:WAMediaUpload, caption:string, quoted?:proto.IWebMessageInfo){
       this.sock.sendMessage(jid, {sticker:sticker, caption:caption, mimetype:"image/webp"}, {quoted: quoted})
  }

  sendAudio(jid:string, audio:WAMediaUpload, caption:string, quoted?:proto.IWebMessageInfo){
       this.sock.sendMessage(jid, {audio:audio, caption:caption, mimetype:"audio/mpeg"}, {quoted: quoted})
  }

  sendVideo(jid:string, video:WAMediaUpload, caption:string, quoted?:proto.IWebMessageInfo){
       this.sock.sendMessage(jid, {video:video, caption:caption, mimetype:"video/mp4"}, {quoted: quoted})
  }

}
