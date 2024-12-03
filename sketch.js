const Node = {
  name: "Default",
  id: 222,              // max = 2047
  state: RECEIVING,
  sendFrameInMemory: null,
  sendFramePointer: 0,
  sendFrameRegister: 0,
  receivedFrameRegister: 0,
  idSensitivityList: null,
  key: "nan",
  defaultData: 1,       // -1 for dynamic ones  // -2 for remote frames
  dataRegister: 0,
  periodForTransmission: 0,
  fieldForTransmission: 'speed',
  x: 10,
  y: 10,
  sensitivity: [],
  functionAtReceive: funForNode,
  printDetails() {
    console.log(this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  },
  getDetails() {
    return (this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  },
  generateDataFrame(data) {
    let newFrame = Object.create(Frame);
    newFrame.constructDataFrame(this.id, data);
    newFrame.crc = 21845;                 // TODO change from dummy to real, modify the function to return an int, not a string
    this.sendFrameInMemory = newFrame;
    newFrame.computeFrame();
    this.sendFrameRegister = newFrame.bitFrame;
    this.sendFramePointer = 0;
    nodesToTransmit.add(this);
    this.state = WAITING;
  },
  generateRemoteFrame() {
    let newFrame = Object.create(Frame);
    newFrame.constructRemoteFrame(this.id, 1);
    this.sendFrameInMemory = newFrame;
    newFrame.computeFrame();    // LAST CHECKPOINT TODO!! compute frame for remote frame
    this.sendFrameRegister = newFrame.bitFrame;
    this.sendFramePointer = 0;
    nodesToTransmit.add(this);
    this.state = WAITING;
  },
  getCurrentBit(){
    return Number(this.sendFrameRegister[this.sendFramePointer]);
  },
  incrementSendFramePointer(){
    this.sendFramePointer++;
  },
  endTransmission() {
    this.state = RECEIVING;
    this.dataRegister = 0;
    this.sendFrameInMemory = null;
    this.sendFrameRegister = "";
    this.sendFramePointer = 0;
    nodesToTransmit.delete(this);
  },
  decodeFrame() {
    newFrame = Object.create(Frame);
    bitstring = this.destuffFrame(this.receivedFrameRegister);
    newFrame.id = parseInt( bitstring.substring(1, 12), 2 );
    newFrame.rtr = parseInt( bitstring.substring(12, 13), 2 );
    newFrame.ide = parseInt( bitstring.substring(13, 14), 2 );
    newFrame.reserved = parseInt( bitstring.substring(14, 15), 2 );
    newFrame.dlc = parseInt( bitstring.substring(15, 19), 2 );
    if(newFrame.rtr == 0){
      newFrame.dataField = parseInt( bitstring.substring(19, 19+8*newFrame.dlc), 2 );
      newFrame.crc = parseInt( bitstring.substring(19+8*newFrame.dlc, 19+8*newFrame.dlc + 15), 2 );
    }
    return newFrame;
  },
  destuffFrame(bitstring) {
    // TODO! destuffing
    return bitstring;
  }
}

const Frame = {
  id: 10,               // 11 bits
  rtr: 0,
  ide: 0,
  reserved: 0,
  dlc: 1,               // max = 15 bytes
  dataField: 7,
  crc: 12,              // 15 bits
  crcD: 1,
  ack: 1,
  ackD: 1,
  eof: 127,
  ifs: 7,
  partialFrame: "",
  bitFrame: "",
  computePartialFrame() {
    let pf = "0";
    pf += extendBits(this.id, 11);
    // console.log("adding ", extendBits(this.id, 11));
    // console.log("current: ", pf);
    pf += extendBits(this.rtr, 1);
    pf += extendBits(this.ide, 1);
    pf += extendBits(this.reserved, 1);
    pf += extendBits(this.dlc, 4);
    if(this.rtr == 0){
      pf += extendBits(this.dataField, (this.dlc * 8));
    }
    this.partialFrame = pf;
  },
  computeFrame() {
    this.computePartialFrame();   // COMPLETE FUNCTIONALITY NOT TESTED
    // console.log("dummy CRC: ", calculateCRC_dummy(this.partialFrame));
    let f = this.partialFrame;
    if(this.rtr == 0){
      f += calculateCRC_dummy(this.partialFrame);
      f += extendBits(this.crcD, 1);
      f += extendBits(this.ack, 1);
      f += extendBits(this.ackD, 1);
    }
    f += extendBits(this.eof, 7);
    f += extendBits(this.ifs, 3);
    this.bitFrame = f;
  },
  constructDataFrame(newId, newData) {
    this.id = newId;
    newData = Math.floor(newData);      // maybe redundant
    this.dlc = Math.floor(newData/256+1);
    this.dataField = newData;
  },
  constructRemoteFrame(newId, dataLength) {
    this.rtr = 1;
    this.id = newId;
    this.dlc = dataLength;
  },
  displayData() {
    if (this.rtr == 1){
      return this.displayRemoteFrame();
    }
    return `
ID: ${this.id}
RTR: ${this.rtr}
IDE: ${this.ide}
Reserved: ${this.reserved}
DLC: ${this.dlc}
Data Field: ${this.dataField}
CRC: ${this.crc}
CRC Delimiter: ${this.crcD}
ACK: ${this.ack}
ACK Delimiter: ${this.ackD}
EOF: ${this.eof}
IFS: ${this.ifs}
Bit Frame: ${this.bitFrame}`;
  },
  displayRemoteFrame() {
    return `
ID: ${this.id}
RTR: ${this.rtr}
IDE: ${this.ide}
Reserved: ${this.reserved}
DLC: ${this.dlc}
EOF: ${this.eof}
IFS: ${this.ifs}
Bit Frame: ${this.bitFrame}`;
}
}

/*
    1 00000000101 0 0 0 0001 00001111
*/

const car = {
  speed: 0,
  motorLoad: 0,
  temperature: 20,
  started: false,
  errors: 0,
  brakesLoad: 0
}

const bus = {
  state: IDLE,
  currentFrame: "",
  frameToDisplay: "",
  consecutiveBitsOfSameParity: 0,
  changedState: false,
  nextFramePart(rtrFrame = false){
    if(rtrFrame == true){
      this.state = EOF;
    }
    else{
      this.state = (this.state+1) % 6; 
    }
    this.changedState = true;
  },
  clearFrameToDisplay(){
    if(this.changedState == true){
      this.currentFrame += this.frameToDisplay;
      this.frameToDisplay = "";
      this.changedState = false;
      this.stuffBits = new Map();
    }
  },
  // for bit stuffing
  polarity: 0,
  stuffBits: null,
  bitsOfSamePolarity: 0,
  error: 0,
  checkStuffBits(busValue){
    if(busValue == bus.polarity){
      bus.bitsOfSamePolarity ++;
      if(bus.bitsOfSamePolarity == 5){
        bus.stuffBits.set(bus.frameToDisplay.length, 1 - bus.polarity);
      }
    }
    else{
      bus.polarity = busValue;
      bus.bitsOfSamePolarity = 1;
    }
  },
  // for acknowledgement
  ack: 0
}

let clock = 1;
let lastClock = 1;
let lastSecond = 0;
let nodes = [];
const nodesToTransmit = new Set();
let pressedKeys = new Map();
// letpreviousFrame = null;
let previousFrame = Object.create(Frame);   // just for DEBUG
let pause = 0;
let winnerNode = null;
let period = 400;
let canBusImg;

function preload() {
  canBusImg = loadImage('resource/can_bus.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupNodes(nodes);
}

function receiveFrame() {
  // console.log(bus.currentFrame);
  nodes[0].receivedFrameRegister = bus.currentFrame;    // decoding performed only by one node to optimize the simulation
  receivedFrame = nodes[0].decodeFrame();
  // console.log("Nodes have received the frame:"+receivedFrame.displayData()); // NOT TESTED YET FOR DLC > 1
  for(let n of nodes) {
    if(n.sensitivity.includes(receivedFrame.id)) {
      funForNode(n, receivedFrame);
      n.functionAtReceive(n, receivedFrame);
    }
  }

}

function updateData() {
  // write debug here
  //
  if(bus.state == IDLE){
    if(nodesToTransmit.size != 0){
      nodesToTransmit.forEach((n, k , set) => {
        n.state = TRANSMITTING;
        n.incrementSendFramePointer();
      });
      bus.currentFrame = "";
      bus.nextFramePart();
      bus.frameToDisplay = "0";
      // console.log("Start arbitration stage");
      bus.polarity = 0;
      bus.bitsOfSamePolarity = 1;
      bus.error = 0;
      bus.stuffBits = new Map();
      bus.ack = 0;  // TODO: move to end of frame to avoid perpetual assignment in idle
    }
    return;
  }
  else if(bus.state == ARBITRATION) {
    let busValue = 1;
    nodesToTransmit.forEach((n) => {
      if(n.state == TRANSMITTING){
        busValue = busValue && n.getCurrentBit();
      }
    });
    bus.frameToDisplay += busValue.toString();
    bus.checkStuffBits(busValue);
    nodesToTransmit.forEach((n) => {
      if(n.state == TRANSMITTING){
        if(busValue != n.getCurrentBit()){
          n.state = WAITING;
        }
        n.incrementSendFramePointer();
      }
    });
    if(bus.frameToDisplay.length == 12) {      // TODO change with condition variable for stuff bits -> read the size of map
      nodesToTransmit.forEach((n) => {
        if(n.state == TRANSMITTING){
          winnerNode = n;
        }
      });
      console.log("The node that won the arbitration is " + winnerNode.name + "\ntransmitting the frame: "+winnerNode.sendFrameInMemory.displayData());
      bus.nextFramePart();
    }
  }
  else if(bus.state == CONTROL) {
    bus.clearFrameToDisplay();
    // console.log("The node that won the arbitration is "+winnerNode.name);
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer();
    if(bus.frameToDisplay.length == 7){
      if(winnerNode.sendFrameInMemory.rtr == 1){
        bus.ack = 1;
        bus.nextFramePart(true);
      }
      else{
        bus.nextFramePart();
      }
    }
  }
  else if(bus.state == DATA) {
    bus.clearFrameToDisplay();
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer();
    if(bus.frameToDisplay.length == 8*winnerNode.sendFrameInMemory.dlc){
      bus.nextFramePart();
    }
  }
  else if(bus.state == CRC) {
    bus.clearFrameToDisplay();
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer();                           
    if(bus.frameToDisplay.length == 18){
      bus.nextFramePart();
      bus.ack = 1;                        // TODO! implement logic for ack bit
    }
  }
  else if(bus.state == EOF) {
    bus.clearFrameToDisplay();
    if(bus.ack == 1){
      bus.ack = 0;
      receiveFrame();
    }
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer();                           // TODO! implement logic for storing the frame in interested nodes and in previous frame
    if(bus.frameToDisplay.length == 7){
      bus.nextFramePart();
      previousFrame = winnerNode.sendFrameInMemory;
      winnerNode.endTransmission();
    }
    // bus.clearFrameToDisplay();       // 
  }
}

function checkTransmittingNodes() {
  for (let i=0; i<nodes.length; i++){
    let n=nodes[i];
    if(n.periodForTransmission != 0){
      if(clock % n.periodForTransmission == 0 && n.state != TRANSMITTING){
        n.generateDataFrame(car[n.fieldForTransmission]);
      }
    }
  }
}

function updateSimulation() {
  // TODO! increase the car speed and temp only when the car is started
  if(car.motorLoad > 0){
    car.speed += 2;
    car.motorLoad = max(car.motorLoad - 2, 0);
    car.temperature += 1;
  }
  else{
    car.speed = max(car.speed - 1, 0);    // TODO!! try change to 0.5 or smaller value
    car.temperature -=1;
    if(car.started == true)
      car.temperature = max (car.temperature, 30);
    else
      car.temperature = max (car.temperature, 20);
  }
  if(car.brakesLoad > 0){
    car.speed = max(car.speed - 3, 0);
    car.brakesLoad = max(car.brakesLoad - 2, 0); 
  }
}

function draw() {
  if(pause == 1) {
    return;
  }

  background(220, 220, 220);
  image(canBusImg, 0, 0);

  if(clock > lastClock){
    lastClock = clock;
    updateData();
    updateSimulation();
    checkTransmittingNodes();    // DEBUG isolate the interactive nodes for better trace
  }

  printNodes(nodes);

  printPreviousFrame(previousFrame);

  printBusMessage();

  printNodesToTransmit();

  printCarParameters();

  updateClock();
}

function keyPressed() {
  if (key == 'p') {
    pause = (pause + 1) % 2;
  }
  else if (keyCode === UP_ARROW) {
    if(period == 50){
      period = 25;
    }
    else if(period > 25)
      period = max((period - 50), 50);
  } 
  else if (keyCode === DOWN_ARROW) {
    if(period == 25){
      period = 50;
    }
    else
      period = min(period + 50, 600);
  }
  if (pause == 0){
    let n = findNodeByKey(nodes, key);
    if(n != null){
      if(n.defaultData == -1){
        pressedKeys.set(key, millis());
      }
      else if(n.defaultData == -2){
        n.generateRemoteFrame();
      }
      else{
        n.generateDataFrame(n.defaultData);
      }
    }
  }
}

function keyReleased() {
  if(pause == 1){
    return;
  }
  let n = findNodeByKey(nodes, key);
  if(n != null){
    if(n.defaultData == -1 && n.state != TRANSMITTING){     // node with dynamic data and not currently transmitting
      if(pressedKeys.has(key) == false){
        console.log("ERROR, key press not detected for key "+key);
        return;
      }
      let satrtTime = pressedKeys.get(key);
      let timePassed = millis() - satrtTime;
      pressedKeys.delete(key);
      console.log("key "+key+" pressed for "+Math.floor(timePassed/60)+" time units (" + (timePassed/1000) + " seconds)");
      n.dataRegister += Math.floor(timePassed/60);      
      console.log("node "+n.name+" sending data frame containing the data "+n.dataRegister);   
      n.generateDataFrame(n.dataRegister);
    }
  }
}

function printBusMessage() {
  textSize(15);
  let y = 350;
  text("Bus data: ", 50, y);
  let x = 150;
  for(let i = 0; i < bus.frameToDisplay.length; i++){
    if(bus.stuffBits.has(i)){
      if(bus.stuffBits.get(i) == Number(bus.frameToDisplay[i])){
        fill(colorOf("brown"));
      }
      else{
        fill(colorOf("red"));
        bus.error = 1;          
      }
    }
    text(bus.frameToDisplay[i], x, y);
    fill(colorOf("black"));
    x+=20;
  }
  let bState = "";
  switch (bus.state) {
    case ARBITRATION:
      bState = "arbitration";
      break;
    case CONTROL:
      bState = "control";
      break;
    case DATA:
      bState = "data";
      break;
    case CRC:
      bState = "CRC";
      break;
    case EOF:
      bState = "EOF";
      break;
    default:
      bState = "";
  }
  if(bState != "") bState = "(stage: " + bState + ")";
  textSize(11);
  text(bState, 50, y+17);  
}

function printNodesToTransmit() {
  textSize(15);
  text("Nodes Transmitting: ", 50, 440);
  y = 440;
  for (let tn of nodesToTransmit) {
    let label = ">>" + tn.name + ": ";
    let label2 = tn.sendFrameRegister.slice(0, tn.sendFramePointer);
    if(tn.state == WAITING){
      label2 += " -- Waiting";  
    }
    text(label, 200, y);
    text(label2, 320, y);
    y+=20;
  }
}

function findNodeByKey(nodes, key) {
  for (let i=0; i<nodes.length; i++){
    if(nodes[i].key === key)
      return nodes[i];
  }
  return null;
}

function updateClock() {
  textSize(15);
  if(millis()-lastSecond > period){
    lastSecond = millis();
    clock ++;
  }
  text("clock: "+ clock, WIDTH - 150, HEIGHT - 50);
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

function calculateCRC_dummy(data) {
  return "101010101010101";
}

function calculateCRC(data, poly = 0x4599, crcLen = 15) {
    // Convert the data string to an integer, and shift it left to make space for the CRC bits
    let dataInt = parseInt(data, 2) << crcLen;

    // Align the polynomial with the leftmost bit of the data
    poly = poly << (data.length + crcLen - 1);

    // Perform bitwise division (modulo-2 division)
    while ((dataInt.toString(2).length) > crcLen) {
        if ((dataInt & (1 << (dataInt.toString(2).length - 1))) !== 0) {
            dataInt ^= poly; // XOR with polynomial
        }
        poly >>= 1; // Shift polynomial right to continue division
    }

    // Convert the remainder to a binary string of length crcLen
    return dataInt.toString(2).padStart(crcLen, '0');
}






/*
  NOTES:
  nodes aren't allowed to generate a new frame while transmitting one on the bus
*/