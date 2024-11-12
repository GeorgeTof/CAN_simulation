const WIDTH = 1400;
const HEIGHT = 660;
const TRANSMITTING = 1, RECEIVING = 0 /* AKA idle */ , WAITING = 2;

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

const ids = {
  acceleration: 5,
  speedSensor: 1000,
  motor: 2000,
  speedometer: 1900
}

const Node = {
  name: "Default",
  id: 222,              // max = 2047
  state: RECEIVING,
  sendFramePointer: 0,
  receivedFrameRegister: 0,
  sendFrameRegister: 0,
  key: "nan",
  data: 0,
  x: 10,
  y: 10,
  printDetails() {
    console.log(this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  },
  getDetails() {
    return (this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  }
}

const Frame = {
  id: 10,               // 11 bits
  rtr: 1,
  ide: 0,
  reserved: 0,
  dlc: 1,               // max = 15 bytes
  dataField: 100,
  crc: 12,              // 15 bits
  crcD: 1,
  ack: 1,
  ackD: 1,
  eof: 127,
  ifs: 7
}

const car = {
  speed: 0,
  motorLoad: 0,
  temperature: 20
}


let clock = 1;
let lastSecond = 0;
let nodes = [];
let previousFrame = Object.create(Frame);
let pause = 0;


function setupNodes() {
  let n = Object.create(Node);
  n.name = "Acceleration";
  n.id = 5;
  n.key = 'w';
  n.x = 50;
  n.y = 50;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Speed sensor";
  n.id = 1000;
  n.x = 80;
  n.y = 150;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Motor";
  n.id = 2000;
  n.x = 180;
  n.y = 150;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Speedometer";
  n.id = 1900;
  n.x = 350;
  n.y = 50;
  nodes.push(n);
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupNodes();
}



function draw() {
  if(pause == 1) {
    return;
  }

  background(220, 220, 220);

  printNodes();

  printPreviousFrame();

  updateClock();
}

function keyPressed () {
  if (key == 'p') {
    pause = (pause + 1) % 2;
  }
}

function printPreviousFrame() {
  // TODO increase text size
  textSize(14);
  // fill(colorOf("green"));
  let x = 150;
  text("Previous frame:", 50, 300);

  fill(colorOf("brown"));
  text(extendBits(1), x, 300);
  x += (7 + 2);

  fill(colorOf("green"));
  text(extendBits(previousFrame.id, 11), x, 300);
  x += (8*11 );

  fill(colorOf("blue"));
  text(extendBits(previousFrame.rtr, 1), x, 300);
  x += (7 + 2);

  fill(colorOf("gray"));
  text(extendBits(previousFrame.ide, 1), x, 300);
  x += (7 + 1);
  text(extendBits(previousFrame.reserved, 1), x, 300);
  x += (7 + 3);

  fill(colorOf("orange"));
  text(extendBits(previousFrame.dlc, 4), x, 300);
  x += (4*9 - 1);

  fill(colorOf("magenta"));
  text(extendBits(previousFrame.dataField, previousFrame.dlc*8), x, 300);
  x += (previousFrame.dlc*8*8 + 1);

  fill(colorOf("yellow"));
  text(extendBits(previousFrame.crc, 15), x, 300);
  x += (4*9 - 1);

  // todo the rest

  fill("black");
}

function printNodes() {
  const size = 12;
  for (let i=0; i<nodes.length; i++){
    textSize(12);
    let n=nodes[i];
    text(n.name, n.x, n.y);
    text("ID: "+n.id, n.x, n.y+12);
    textSize(14);
    if (n.key != 'nan')
      text('( '+n.key+' )', n.x + n.name.length/2 - 1, n.y+24);
  }
}

function updateClock() {
  textSize(15);
  let period = 500;
  if(millis()-lastSecond > period){
    lastSecond = millis();
    clock ++;

    // console.log("p = " + pause);
    console.log( previousFrame.id );
    console.log( extendBits(previousFrame.id, 11) );
    console.log(ids['acceleration']);
    // nodes[0].printDetails();
    // console.log( nodes[1].getDetails() );
  }
  text("clock: "+ clock, 1250, 620);
}

function colorOf(colorName) {
  let c = colors[colorName];
  let actualC = color(c[0], c[1], c[2]);
  return actualC;
}

// and size 
function extendBits(nr, size) {         
  binaryString = nr.toString(2);
  let remaining = size - binaryString.length;
  let result = "";
  for (let i=0; i<remaining; i++)
    result += "0";
  result += binaryString;
  return result;
}
