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
  usedPrefix:string;
  args: Array<string>;
  message: string;
  pushname: string;
  tagList: Array<string|any>;
  quotedMessage: proto.IMessage;
  quotedType: string;
  media: proto.IMessage
  mediaType: string;
  isStickerGif: boolean;
  isGroup:boolean;
  isBtn: boolean
  isList:boolean;
  isOwner:boolean;
  isMe:boolean;
};

export default async function (conn: WAConn, chat: proto.IWebMessageInfo): Promise<fetchedMsg> {
  let from = chat.key.remoteJid;
  let isGroup = from.endsWith("@g.us");
  let sender = chat.key.participant || from;
  sender = sender.includes(":") ? sender.split(":")[0] + `@s.whatsapp.net` : sender;
  let senderNumber = sender.replace("@s.whatsapp.net", "")?.split(":")[0];
  let pushname = chat.pushName ? chat.pushName : "Anonymous " + senderNumber;
  let msgType: string = Object.keys(chat.message||[]).slice(-1)[0];
  chat.message = msgType == "ephemeralMessage" ? chat.message.ephemeralMessage.message : chat.message;
  let message = msgType == "conversation" ? chat.message.conversation : msgType == "imageMessage" || msgType == "videoMessage" ? chat.message[msgType].caption : msgType == "extendedTextMessage" ? chat.message.extendedTextMessage.text : "";
  let args = message.split(" ");
  let isCmd = conn.setting.prefix.includes(args[0].slice(0,1))
  let usedPrefix = isCmd ? args[0].slice(0,1) : ""
  let cmd = isCmd ? args[0].slice(1).toLowerCase() : null;
  isCmd && args.shift();
  let body = args.join(" ");

  let tagList = isGroup ? chat.message[msgType].contextInfo?.mentionedJid || [] : [];
  let quotedMessage = chat.message[msgType].contextInfo?.quotedMessage || null;
  let quotedType = quotedMessage ? Object.keys(quotedMessage)[0] : null;
  let media = msgType?.match(/imageMessage|videoMessage|documentMessage|stickerMessage/i) ? chat.message : quotedType?.match(/imageMessage|videoMessage|documentMessage|stickerMessage/i) ? quotedMessage : null;
  let mediaType = media ? Object.keys(media)[0] : null;
  let isStickerGif = mediaType == "stickerMessage" ? Boolean(media.stickerMessage.firstFrameSidecar) : false;

  let isBtn = msgType == "buttonsResponseMessage";
  let isList = msgType == "listResponseMessage"
  let isOwner = conn.setting.owner.includes(senderNumber);
  let isMe = chat.key.fromMe
  
  return await { from, msgType, cmd, body, isCmd, args, message, sender, senderNumber, pushname, tagList, quotedMessage, quotedType, media, mediaType, isStickerGif, isGroup, isBtn, isList, isOwner, isMe, usedPrefix};
}
