import { proto, WASocket } from "@adiwajshing/baileys-md";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     let from = chat.key.remoteJid
     console.log(msgFetched)

     conn.reply(from, "tes", chat)
}

export let prefix = ["tes"]