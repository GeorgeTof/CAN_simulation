const WIDTH = 1395;
const HEIGHT = 660;
const TRANSMITTING = 1, RECEIVING = 0 /* AKA idle */ , WAITING = 2;
const ARBITRATION = 0, CONTROL = 1, DATA = 2, CRC = 3, ACK = 4, EOF = 5, IDLE = 6;
const TIME_TO_SHOW_RECEIVAL = 10;

const IDS = {
  acceleration: 5,
  brake: 3,
  startButton: 4,
  motorSensors: 400,
  motor: 2000,
  dashboard: 1900,
  brakes: 1000
}

const colors = {
  red: [255, 51, 51],
  green: [51, 200, 51],
  blue: [51, 51, 255],
  yellow: [255, 255, 51],
  cyan: [51, 255, 255],
  magenta: [255, 51, 255],
  black: [0, 0, 0],
  white: [255, 255, 255],
  orange: [255, 153, 51],
  purple: [153, 51, 255],
  pink: [255, 102, 102],
  brown: [153, 76, 0],
  gray: [128, 128, 128],
  lime: [102, 255, 51],
  teal: [51, 153, 153],
  desaturatedGreen: [100, 175, 100],
  desaturatedMagenta: [220, 100, 220],
  desaturatedOrange: [220, 160, 100],
  darkCrimson: [120, 0, 25],
  darkBlue: [0, 0, 139],
  darkGreen: [0, 139, 0]
}

function colorOf(colorName) {
  let c = colors[colorName];
  let actualC = color(c[0], c[1], c[2]);
  return actualC;
}

let canBusImg;
let checkEngineImg;
let upKeyImg, downKeyImg, kKeyImg, wKeyImg, sKeyImg, pKeyImg, rKeyImg;
let keyImgMap = new Map();