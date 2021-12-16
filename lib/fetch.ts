import { proto } from "@adiwajshing/baileys-md";
import { WAConn } from "./conn";

export type fetchedMsg = {
  from: string;
  sender: string;
  senderNumber: string;
  msgType: string;
  cmd: string;
  body: string;
  isCmd: boolean;
  args: Array<string>;
  message: string;
  pushname: string;
};

export default async function (conn: WAConn, chat: proto.IWebMessageInfo): Promise<fetchedMsg> {
  let from = chat.key.remoteJid;
  let sender = chat.key.participant || from;
  sender = sender.includes(":") ? sender.split(":")[0] + `@s.whatsapp.net` : sender;
  let senderNumber = sender.replace("@s.whatsapp.net", "")?.split(":")[0];
  let pushname = chat.pushName ? chat.pushName : "Anonymous " + senderNumber;
  delete chat.message?.messageContextInfo;
  let msgType: string = Object.keys(chat.message).slice(-1)[0];
  chat.message = msgType == "ephemeralMessage" ? chat.message.ephemeralMessage.message : chat.message;
  let message = msgType == "conversation" ? chat.message.conversation : msgType == "imageMessage" || msgType == "videoMessage" ? chat.message[msgType].caption : msgType == "extendedTextMessage" ? chat.message.extendedTextMessage.text : undefined;
  let args = message.split(" ");
  let isCmd = args[0].startsWith(conn.setting.prefix);
  let cmd = isCmd ? args[0].replace(conn.setting.prefix, "") : null;
  args.shift();
  let body = args.join(" ");
  return await { from, msgType, cmd, body, isCmd, args, message, sender, senderNumber, pushname };
}
