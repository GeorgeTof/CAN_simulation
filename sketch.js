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
  dataRegister2: 0,     // needed for the dashboard
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
    // newFrame.crc = 21845;      // change computation in computeFrame           // TODO change from dummy to real, modify the function to return an int, not a string
    this.sendFrameInMemory = newFrame;
    newFrame.computeFrame();
    this.sendFrameRegister = this.stuffFrame(newFrame.bitFrame);
    this.sendFramePointer = 0;
    nodesToTransmit.add(this);
    this.state = WAITING;
  },
  generateRemoteFrame() {
    let newFrame = Object.create(Frame);
    newFrame.constructRemoteFrame(this.id, 1);
    this.sendFrameInMemory = newFrame;
    newFrame.computeFrame();
    this.sendFrameRegister = this.stuffFrame(newFrame.bitFrame);
    this.sendFramePointer = 0;
    nodesToTransmit.add(this);
    this.state = WAITING;
  },
  getCurrentBit() {
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
  repeatTransmission() {
    console.log("node", this.name, "is repeating transmission");  // DEBUG
    this.sendFramePointer = 0;
  },
  decodeFrame() {
    newFrame = Object.create(Frame);
    bitstring = this.receivedFrameRegister;
    bitstring = this.destuffFrame(this.receivedFrameRegister);
    newFrame.id = parseInt( bitstring.substring(1, 12), 2 );
    newFrame.rtr = parseInt( bitstring.substring(12, 13), 2 );
    newFrame.ide = parseInt( bitstring.substring(13, 14), 2 );
    newFrame.reserved = parseInt( bitstring.substring(14, 15), 2 );
    newFrame.dlc = parseInt( bitstring.substring(15, 19), 2 );              
    if(newFrame.rtr == 0){
      newFrame.dataField = parseInt( bitstring.substring(19, 19+8*newFrame.dlc), 2 );
      newFrame.crc = parseInt( bitstring.substring(19+8*newFrame.dlc,      19+8*newFrame.dlc + 15), 2 );
      newFrame.ack = parseInt( bitstring.substring(19+8*newFrame.dlc + 15 + 1, 19+8*newFrame.dlc + 16 + 1), 2 );  
    }
    else{
      newFrame.ack = parseInt( bitstring.substring(19, 20), 2 );
    }
    return newFrame;
  },
  stuffFrame(bitstring) {
    let len = bitstring.length;
    len -= 12;      // stop when we reach (not crcD) ACK
    let i = 1;
    let polarity = bitstring[0];
    let samePolarity = 1;
    let newBitFrame = polarity;
    let stuffed = 0;
    while (i < len) {
      newBitFrame += bitstring[i];
      if(bitstring[i] == polarity){
        samePolarity ++;
        if(samePolarity == 5){
          newBitFrame += (polarity == "0") ? "1" : "0";   // add the stuff bit
          samePolarity = 1;
          polarity = (polarity == "0") ? "1" : "0";
          stuffed ++;
        }
      }
      else{
        polarity = bitstring[i];
        samePolarity = 1;
      }
      i ++;
    }
    for(let i = 0; i < 12; i++){
      newBitFrame += "1";
    }
    return newBitFrame;
  },
  destuffFrame(bitstring) {
    let len = bitstring.length;
    len -= ( 1 + 1);
    let polarity = bitstring[0];
    let samePolarity = 1;
    let newBitFrame = polarity;
    let stuffed = 0;
    let i = 1;
    let isRf = 0;
    while (i < len) {
      newBitFrame += bitstring[i];
      if(bitstring[i] == polarity){
        samePolarity ++;
        if(samePolarity == 5){
          i ++;                       // skip the stuff bit
          samePolarity = 1;
          polarity = (polarity == "0") ? "1" : "0";
          stuffed ++;
        }
      }
      else{
        polarity = bitstring[i];
        samePolarity = 1;
      }
      i ++;
    }
    if(! isRf){                                 // isrf always false TODO! remove if
      newBitFrame += bitstring.slice(-2);
    }
    if (stuffed > 0){
      console.log("Destuffed the frame of", stuffed, "bits");   // DEBUG
      // console.log("stuffed frame was:\n", bitstring);
      console.log("the destuffed frame is:\n", newBitFrame);
    }
    return newBitFrame;
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
    this.computePartialFrame();
    let f = this.partialFrame;
    if(this.rtr == 0){
      f += calculateCRC(this.partialFrame);
      f += extendBits(this.crcD, 1);
    }
    f += extendBits(this.ack, 1);
    f += extendBits(this.ackD, 1);
    f += extendBits(this.eof, 7);
    f += extendBits(this.ifs, 3);
    this.bitFrame = f;
  },
  constructDataFrame(newId, newData) {
    this.id = newId;
    newData = Math.floor(newData);      // maybe redundant
    this.dlc = calculateBytes(newData);
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
ACK: ${this.ack}
ACK Delimiter: ${this.ackD}
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
  temperature: 15,
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
      this.state = ACK;       
    }
    else{
      this.state = (this.state+1) % 7;    
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
  nextIsStuff: false,
  checkStuffBits(busValue){
    if(bus.nextIsStuff){
      bus.stuffBits.set(bus.frameToDisplay.length - 1, 1 - bus.polarity);  
      if(car.errors > 0){                                             //  if(car.errors > 0 && clock % 2 == 0)  for 1/2 chance of introducing the error
        bus.frameToDisplay = bus.frameToDisplay.slice(0, -1) + String(bus.polarity);
        car.errors --;
        bus.error = 1;
        console.log("ERROR!");
        console.log("Actual bus value for stuff bit is", bus.polarity, "when it should be", 1-bus.polarity);
      } 
      bus.polarity = 1 - bus.polarity;
      bus.bitsOfSamePolarity = 1;
      bus.nextIsStuff = false;
    }
    else if(busValue == bus.polarity){
      bus.bitsOfSamePolarity ++;
      if(bus.bitsOfSamePolarity == 5){
        bus.nextIsStuff = true;
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
let acknowledge = 0;
let nodesThatReceived = new Map();
let pressedKeys = new Map();
let previousFrame = null;   
let pause = 0;
let winnerNode = null;
let period = 400;

function preload() {
  canBusImg = loadImage('resource/can_bus_2.png');
  checkEngineImg = loadImage('resource/check_engine.png');
  upKeyImg = loadImage('resource/up-arrow.png');
  downKeyImg = loadImage('resource/down-arrow.png');
  wKeyImg = loadImage('resource/w-key.png');
  sKeyImg = loadImage('resource/s-key.png');
  kKeyImg = loadImage('resource/k-key.png');
  pKeyImg = loadImage('resource/p-key.png');
  rKeyImg = loadImage('resource/r-key.png');
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupNodes(nodes);
  keyImgMap.set('w', wKeyImg);
  keyImgMap.set('s', sKeyImg);
  keyImgMap.set('p', pKeyImg);
  keyImgMap.set('k', kKeyImg);
}

function receiveFrame() {
  // console.log(bus.currentFrame);
  nodes[0].receivedFrameRegister = bus.currentFrame;    // decoding performed only by one node to optimize the simulation  
  console.log("received frame is:\n", bus.currentFrame);
  let receivedFrame = nodes[0].decodeFrame();
  previousFrame = receivedFrame;
  for(let n of nodes) {
    if(n.sensitivity.includes(receivedFrame.id)) {
      funForNode(n, receivedFrame);
      n.functionAtReceive(n, receivedFrame);
      nodesThatReceived.set(n.id, TIME_TO_SHOW_RECEIVAL);
    }
  }
}

function decodeFrameOnlyForDisplay() {
  let n = Object.create(Node);
  n.receivedFrameRegister = bus.currentFrame;
  let receivedFrame = n.decodeFrame();
  previousFrame = receivedFrame;
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
      bus.polarity = 0;
      bus.bitsOfSamePolarity = 1;
      bus.error = 0;
      bus.stuffBits = new Map();
      bus.nextIsStuff = false;
      bus.ack = 0;  
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
    if(bus.frameToDisplay.length == 12 + bus.stuffBits.size + (bus.nextIsStuff ? 1 : 0)) { 
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
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    bus.checkStuffBits(winnerNode.getCurrentBit());
    winnerNode.incrementSendFramePointer();
    if(bus.frameToDisplay.length == 7 + bus.stuffBits.size + (bus.nextIsStuff ? 1 : 0)){
      resetWaitingNodes();
      if(winnerNode.sendFrameInMemory.rtr == 1){
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
    bus.checkStuffBits(winnerNode.getCurrentBit());
    winnerNode.incrementSendFramePointer();
    if(bus.frameToDisplay.length == 8*winnerNode.sendFrameInMemory.dlc  + bus.stuffBits.size + (bus.nextIsStuff ? 1 : 0)){
      bus.nextFramePart();
    }
  }
  else if(bus.state == CRC) {
    bus.clearFrameToDisplay();
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();                  
    bus.checkStuffBits(winnerNode.getCurrentBit());
    winnerNode.incrementSendFramePointer(); 
    if(bus.frameToDisplay.length == 16  + bus.stuffBits.size + (bus.nextIsStuff ? 1 : 0)){
      bus.nextFramePart();
    }
  }
  else if(bus.state == ACK) {
    bus.clearFrameToDisplay();
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer(); 
    if(bus.frameToDisplay.length == 1){      // ACK bit
      if(bus.error == 0){
        acknowledge = 1;
        bus.ack = 1;
        bus.frameToDisplay = bus.frameToDisplay.slice(0, -1) + "0";
        winnerNode.sendFrameInMemory.ack = 0;
      }
      else{
        console.log("Error found!");      // DEBUG
      }
    }
    else if(bus.frameToDisplay.length == 2){
      acknowledge = 0;
      bus.nextFramePart();
    }
  }
  else if(bus.state == EOF) {
    bus.clearFrameToDisplay();
    bus.frameToDisplay += winnerNode.getCurrentBit().toString();
    winnerNode.incrementSendFramePointer();                           
    if(bus.frameToDisplay.length == 7){
      bus.nextFramePart();
      if(bus.ack == 1){
        receiveFrame();
        winnerNode.endTransmission();
      }
      else{
        decodeFrameOnlyForDisplay();
        winnerNode.repeatTransmission();
      }
      bus.ack = 0;
    }
    // bus.clearFrameToDisplay();
  }
}

function resetWaitingNodes() {
  for(let n of nodesToTransmit){
    if(n.state == WAITING){
      n.sendFramePointer = 0;
    }
  }
}

function checkTransmittingNodes() {
  for (let i=0; i<nodes.length; i++){
    let n=nodes[i];
    if(n.periodForTransmission != 0){
      if(clock % n.periodForTransmission == 0 && n.state != TRANSMITTING){
        if(n.name == "Motor sensors"){
          n.generateDataFrame(generateMotorSensorsData());
        }
        else{
          n.generateDataFrame(car[n.fieldForTransmission]);
        }
      }
    }
  }
}

function updateNodesThatReceived() {
  for (let [key, val] of nodesThatReceived.entries()){
    if (val > 0){
      nodesThatReceived.set(key, val - 1);
    }
    else if (val == 0){
      nodesThatReceived.delete(key);
    }
  }
}

function updateSimulation() {
  if(car.motorLoad > 0){
    if(car.started == true){
      car.speed += 2;
      car.temperature += 1;
    }
    car.motorLoad = max(car.motorLoad - 2, 0);
  }
  else{
    car.speed = max(car.speed - 0.3, 0); 
    car.temperature -=0.3;
    if(car.started == true)
      car.temperature = max (car.temperature, 30);
    else
      car.temperature = max (car.temperature, 15);
  }
  if(car.brakesLoad > 0){
    car.speed = max(car.speed - 3.5, 0);
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
    checkTransmittingNodes();
    updateNodesThatReceived();
  }

  printNodes(nodes);

  printPreviousFrame(previousFrame);

  printBusMessage();

  printNodesToTransmit();

  printCarParameters();

  printInstructions();

  updateClock();
}

function keyPressed() {
  if (key == 'p') {
    pause = (pause + 1) % 2;
  }
  else if (key == 'r') {
    car.errors ++;
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
    case ACK:
      bState = "ACK";
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
      if(acknowledge == 1){
        label2 += "0";
      }
      label2 += " -- Waiting";  
    }
    text(label, 200, y);
    text(label2, 320, y);
    y+=20;
  }
  if(acknowledge == 1){
    const idleNodes = nodes.filter(n => n.state == RECEIVING);
    for(let an of idleNodes) {
      let label = ">>" + an.name + ": ";
      let label2 = "0";
      if(an.state == WAITING){
        // label2 += " -- Waiting";  
        continue;
      }
      text(label, 200, y);
      text(label2, 320, y);
      y+=20;
    }
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

function calculateCRC(data) {
  // 1. Convert the input string into an array of numeric bits 
  let bits = data.split('').map(char => parseInt(char, 10));

  // 2. Append 15 zero bits
  for (let i = 0; i < 15; i++) {
    bits.push(0);
  }

  // 3. Represent the generator polynomial in array form
  const polyStr = "1100010110011001";
  const poly = polyStr.split('').map(char => parseInt(char, 10));

  // 4. Perform polynomial long division:
  //    - If a bit in the original data is 1, XOR the following 16 bits with the polynomial.
  for (let i = 0; i < data.length; i++) {
    if (bits[i] === 1) {
      // XOR bits[i..i+15] with polynomial[0..15]
      for (let j = 0; j < 16; j++) {
        bits[i + j] = bits[i + j] ^ poly[j];
      }
    }
  }

  // 5. The remainder in the last 15 bits of the bits array.
  const remainderBits = bits.slice(bits.length - 15);

  // 6. Convert remainder array back to a string
  const remainderStr = remainderBits.join('');

  return remainderStr;
}

function calculateBytes(n) {
    if (n === 0) {
        return 1; 
    }
    
    const bits = Math.floor(Math.log2(n)) + 1;

    return Math.ceil(bits / 8);
}





/*
  NOTES:
  nodes aren't allowed to generate a new frame while transmitting one on the bus
*/