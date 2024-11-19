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
  defaultData: 1,       // -1 for dynamic ones
  dataRegister: 0,
  periodForTransmission: 0,
  fieldForTransmission: 'speed',
  x: 10,
  y: 10,
  printDetails() {
    console.log(this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  },
  getDetails() {
    return (this.name + " " + this.id + " " + this.key + " " + this.state + " ");
  },
  generateDataFrame(data) {
    let newFrame = Object.create(Frame);
    newFrame.constructDataFrame(this.id, data);
    newFrame.computeFrame();
    this.sendFrameRegister = newFrame.bitFrame;
    this.sendFramePointer = 0;
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
    let pf = "1";
    pf += extendBits(this.id, 11);
    // console.log("adding ", extendBits(this.id, 11));
    // console.log("current: ", pf);
    pf += extendBits(this.rtr, 1);
    pf += extendBits(this.ide, 1);
    pf += extendBits(this.reserved, 1);
    pf += extendBits(this.dlc, 4);
    pf += extendBits(this.dataField, (this.dlc * 8));
    this.partialFrame = pf;
  },
  computeFrame() {
    this.computePartialFrame();   // COMPLETE FUNCTIONALITY NOT TESTED
    // console.log("dummy CRC: ", calculateCRC_dummy(this.partialFrame));
    let f = this.partialFrame;
    f += calculateCRC_dummy(this.partialFrame);
    f += extendBits(this.crcD, 1);
    f += extendBits(this.ack, 1);
    f += extendBits(this.ackD, 1);
    f += extendBits(this.eof, 7);
    f += extendBits(this.ifs, 3);
    this.bitFrame = f;
  },
  constructDataFrame(newId, newData) {
    this.id = newId;
    this.dlc = newData/8+1;
    this.dataField = newData;
  },
  constructRemoteFrame(newId, dataLength) {
    this.id = newId;
    this.dlc = dataLength;
  }
}

/*
    1 00000000101 0 0 0 0001 00001111
*/

const car = {
  speed: 0,
  motorLoad: 0,
  temperature: 20
}

const bus = {
  state: IDLE,
  currentFrame: "",
  consecutiveBitsOfSameParity: 0
}


let clock = 1;
let lastClock = 1;
let lastSecond = 0;
let nodes = [];
const nodesToTransmit = new Set();
let pressedKeys = new Map();
let previousFrame = Object.create(Frame);
let pause = 0;


function setup() {
  createCanvas(WIDTH, HEIGHT);
  setupNodes(nodes);
}

function updateData() {
  // console.log("Clock became ", clock);
  // DEMO FOR FRAME BIT ENCODING:
  // f = Object.create(Frame);
  // n = nodes[0];
  // console.log("creating the frame for node ", n.name);
  // f.id = n.id;
  // f.dlc = 1;
  // f.dataField = 15; 
  // f.computePartialFrame();
  // console.log("partial frame: ", f.partialFrame);
  // f.computeFrame();
  // console.log("complete frame: ", f.bitFrame);

  
}

function checkTransmittingNodes() {
  for (let i=0; i<nodes.length; i++){
    let n=nodes[i];
    if(n.periodForTransmission != 0){
      if(clock % n.periodForTransmission == 0){
        n.generateDataFrame(car[n.fieldForTransmission]);
        nodesToTransmit.add(n);
      }
    }
  }
}

function draw() {
  if(pause == 1) {
    return;
  }

  background(220, 220, 220);

  if(clock > lastClock){
    lastClock = clock;
    updateData();
    checkTransmittingNodes();
  }

  printNodes(nodes);

  printPreviousFrame(previousFrame);

  printBusMessage();

  printNodesToTransmit();

  updateClock();
}

function keyPressed(){
  if (key == 'p') {
    pause = (pause + 1) % 2;
  }
  if (pause == 0){
    let n = findNodeByKey(nodes, key);
    if(n != null){
      if(n.defaultData != -1){
        // TODO ADD SPECFIC FUNCTIONALITY FOR NODES REQUESTING DATA
        n.generateDataFrame(n.defaultData);
        nodesToTransmit.add(n);
      }
      else{
        pressedKeys.set(key, millis());
      }
    }
  }
}

function keyReleased(){
  if(pause == 1){
    return;
  }
  let n = findNodeByKey(nodes, key);
  if(n != null){
    if(n.defaultData == -1){
      if(pressedKeys.has(key) == false){
        console.log("ERROR, key press not detected for key "+key);
        return;
      }
      let satrtTime = pressedKeys.get(key);
      let timePassed = millis() - satrtTime;
      pressedKeys.delete(key);
      console.log("key "+key+" pressed for "+Math.floor(timePassed/60)+" time units (" + (timePassed/1000) + " seconds)");
      n.dataRegister += Math.floor(timePassed/60);      // TODO clear data after successful transmission
      console.log("node "+n.name+" sending data frame containing the data "+n.dataRegister);   
      n.generateDataFrame(n.dataRegister);
      nodesToTransmit.add(n);
    }
  }
}

function printBusMessage() {
  textSize(15);
  text("Bus data: ", 50, 350);
}

function printNodesToTransmit() {
  textSize(15);
  text("Nodes Transmitting: ", 50, 440);
  y = 440;
  for (let tn of nodesToTransmit) {
    let label = ">>" + tn.name + ": ";
    if(tn.sendFramePointer == 0){
      label += "Waiting";
    }
    else{
      text(tn.sendFrameRegister.slice(0, sendFramePointer), 250, y);
    }
    text(label, 200, y);
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
  let period = 500;
  if(millis()-lastSecond > period){
    lastSecond = millis();
    clock ++;

    // console.log("p = " + pause);
    // console.log( previousFrame.id );
    // console.log( extendBits(previousFrame.id, 11) );
    // console.log(ids['acceleration']);
    // nodes[0].printDetails();
    // console.log( nodes[1].getDetails() );
  }
  text("clock: "+ clock, 1250, 620);
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
