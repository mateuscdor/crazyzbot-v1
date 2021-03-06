import { proto, WASocket } from "@adiwajshing/baileys-md";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

let help = `developers only`

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     conn.reply(msgFetched.from, help, chat)
}

export let prefix = ["help"]