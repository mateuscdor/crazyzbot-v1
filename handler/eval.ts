import { proto, WASocket } from "@adiwajshing/baileys-md";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     try {
          eval(msgFetched.body)
     } catch (err) {
          conn.reply(msgFetched.from, String(err), chat)
     }
}

export let prefix = ["eval"]