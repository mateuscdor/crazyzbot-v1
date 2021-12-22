import { proto, WASocket } from "@adiwajshing/baileys-md";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     let from = chat.key.remoteJid

     msgFetched.isOwner && conn.reply(from, "you are owner", chat)
     msgFetched.isMe && conn.reply(from, "you are admin", chat)
}

export let prefix = ["cekowner"]