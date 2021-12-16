import { proto, WASocket } from "@adiwajshing/baileys-md";
import { off } from "process";
import { WAConn } from "../lib/conn";
import fetchMsg, {fetchedMsg} from "../lib/fetch"

export function handler(conn:WAConn, chat:proto.IWebMessageInfo, msgFetched:fetchedMsg) {
     let from = msgFetched.from
     let newPrefix = msgFetched.args[0]
     if(newPrefix) conn.setPrefix(newPrefix)
     conn.reply(from, "prefix changed", chat)
}

export let prefix = ["changeprefix"]