import { useSingleFileAuthState, DisconnectReason, BufferJSON } from "@adiwajshing/baileys-md";
import { WAConn } from "./lib/conn";
import { Boom } from "@hapi/boom";
import fs from "fs";
import P from "pino";

const sess: string = "session.json";
const { state, saveState } = useSingleFileAuthState(sess);
const log = console.log;

// let str = JSON.stringify(state, BufferJSON.replacer)
// let obj = JSON.parse(str, BufferJSON.reviver);
// let state = JSON.parse(fs.readFileSync(sess, {encoding: 'utf8'}), BufferJSON.reviver)

function startSock() {
  let conn = new WAConn({
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
  });

  let { sock } = conn;
  
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection == "open") {
      log("CONNECTED");
      log(sock.user.id)
      // sock.sendMessage(require('./setting.json').owner[0], {text: 'Connected'})
    }
    if (connection === "close") {
      // reconnect if not logged out
      if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
        startSock();
      } else {
        log("connection closed");
      }
    }
  });

  sock.ev.on("creds.update", function (state) {
    log(JSON.parse(JSON.stringify(state, BufferJSON.replacer), BufferJSON.reviver))
  });

  sock.ev.on("connection.update", (update) => {
    let qr = update.qr;
    qr && log("scan qr");
  });

  sock.ev.on("messages.upsert", async (m) => {
    // console.log(JSON.stringify(m, undefined, 2))

    const msg = m.messages[0];
    if (m.type === "notify") {
      let jid = msg.key.remoteJid;
      jid && (await sock.presenceSubscribe(jid));
      await sock!.sendReadReceipt(jid, msg.key.participant || msg.key.remoteJid, [msg.key.id]);
      log(JSON.stringify(msg, null, 2));
    }
  });
}

startSock()