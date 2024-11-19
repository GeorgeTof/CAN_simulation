const WIDTH = 1400;
const HEIGHT = 660;
const TRANSMITTING = 1, RECEIVING = 0 /* AKA idle */ , WAITING = 2;
const ARBITRATION = 0, CONTROL = 1, DATA = 2, CRC = 3, EOF = 4, IDLE = 5;

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
  teal: [51, 153, 153]
}

function colorOf(colorName) {
  let c = colors[colorName];
  let actualC = color(c[0], c[1], c[2]);
  return actualC;
}