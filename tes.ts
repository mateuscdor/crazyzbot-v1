import QRCode = require("qrcode");
import canvas = require("canvas");
let { createCanvas, loadImage } = canvas;
import fs from "fs";

async function create(dataForQRcode, width, cwidth) {
  let center_image = "data:image/png;base64," + fs.readFileSync("wa-nobg.png", { encoding: "base64" });
  const canvas = createCanvas(width, width);
  QRCode.toCanvas(canvas, dataForQRcode, {
    errorCorrectionLevel: "H",
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  const ctx = canvas.getContext("2d");
  ctx.scale(width,width)
  const img = await loadImage(center_image);
  const center = (width / 2 - cwidth) / 2;
  ctx.drawImage(img, center, center, cwidth, cwidth);
  return canvas.toDataURL("image/png");
}

async function main() {
  let text = "nur azizzzzzzzzz";
  const qrCode = await create(text, 200, 20);
  fs.writeFileSync("tes.png", qrCode.split("base64,")[1], { encoding: "base64" });
}
main()