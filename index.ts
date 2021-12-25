import { useSingleFileAuthState, DisconnectReason, BufferJSON, proto } from "@adiwajshing/baileys-md";
import { WAConn } from "./lib/conn";
import fs from "fs";
import P from "pino";
import path from "path";
import yargs from 'yargs';


const argv = yargs(process.argv).argv
const sess: string = "session.json";
const { state, saveState } = useSingleFileAuthState(sess);
const log = console.log;
Boolean(argv["watch"]) && log("watching handler")

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

  sock.ev.on("creds.update", function (state) {
    // log(JSON.parse(JSON.stringify(state, BufferJSON.replacer), BufferJSON.reviver));
  });
  
  sock.ev.on("connection.update", (update) => {
    let qr = update.qr;
    qr && log("scan qr");
  });
}

(async () => {
  global.handler = {};
  let pluginDir = path.join(__dirname, 'handler')
  for await (let plugins of fs.readdirSync("./handler")) {
    if (plugins.endsWith(".ts")) {
      let plugin = plugins.slice(0, -3);
      global.handler[plugin] = require("./handler/" + plugins);
    }
  }

  if(Boolean(argv["watch"])) fs.watch(path.join(__dirname, 'handler'), {}, (event, filename) => {
    let plugin = filename.slice(0,-3)
    let file = path.join(__dirname, 'handler', filename);
    require.cache[file] && delete require.cache[file]
    if(!fs.existsSync(file)) {
      delete global.handler[plugin]
      log("delete plugin: " + plugin)
    }
    else {
      log((global.handler[plugin] ? "importing plugin: " : "add plugin: ") + plugin)
      global.handler[plugin] = require(file)
    }
  })
  
  await startSock();
})();
