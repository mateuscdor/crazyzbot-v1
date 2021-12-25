import { proto, WASocket } from "@adiwajshing/baileys-md";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     try {
          let res = eval(msgFetched.body)
          conn.reply(msgFetched.from, res instanceof Error ? String(res) : typeof res == "object" ? JSON.stringify(res, null, 2) : String(res), chat)
     } catch (err) {
          conn.reply(msgFetched.from, String(err), chat)
     }
}

export let prefix = ["eval"]