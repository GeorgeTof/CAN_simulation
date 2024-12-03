function setupNodes(nodes) {
  let n = Object.create(Node);      // sketchy ca Node e declarat in sketch :/
  n.name = "Acceleration";
  n.id = 5;
  n.key = 'w';
  n.defaultData = -1;
  n.x = 200;
  n.y = 50;
  n.sensitivity = [4];
  // todo perform specific funtion
  nodes.push(n);
  n.functionAtReceive = accelerationFunction;
  n = Object.create(Node); 
  n.name = "Brake";
  n.id = 3;
  n.key = 's';
  n.defaultData = -1;
  n.x = 100;
  n.y = 50;
  nodes.push(n);
  n = Object.create(Node); 
  n.name = "Start Button";
  n.id = 4;
  n.key = 'k';
  n.defaultData = -2;
  n.x = 300;
  n.y = 50;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Speed sensor";
  n.id = 401;
  n.x = 400;
  n.y = 200;
  n.periodForTransmission = 10;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Motor";
  n.id = 2000;
  n.x = 300;
  n.y = 200;
  n.sensitivity = [5];
  n.functionAtReceive = motorFunction;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Speedometer";
  n.id = 1900;
  n.x = 500;
  n.y = 50;
  nodes.push(n);
}

function printPreviousFrame(previousFrame) {
  if(previousFrame == null){
    return;
  }
  let mainSize = 14, valSize = 11;
  let x = 160, y = 300;
  textSize(14);

  text("Previous frame:", 50, 300);

  x = printBits("0", x, y, "brown");

  printValue(previousFrame.id, x, y, valSize, mainSize, "desaturatedGreen");
  x = printBits(extendBits(previousFrame.id, 11), x, y, "green");

  x = printBits(extendBits(previousFrame.rtr, 1), x, y, "blue");

  x = printBits(extendBits(previousFrame.ide, 1), x, y, "gray");

  x = printBits(extendBits(previousFrame.reserved, 1), x, y, "gray");
  
  printValue(previousFrame.dlc, x, y, valSize, mainSize, "desaturatedOrange");
  x = printBits(extendBits(previousFrame.dlc, 4), x, y, "orange");

  if(previousFrame.rtr == 0){
    printValue(previousFrame.dataField, x, y, valSize, mainSize, "desaturatedMagenta");
    x = printBits(extendBits(previousFrame.dataField, previousFrame.dlc*8), x, y, "magenta");

    x = printBits(extendBits(previousFrame.crc, 15), x, y, "yellow");  
  }

  x = printBits(extendBits(previousFrame.eof, 7), x, y, "gray");    

  fill("black");  
}

function printBits(bits, x, y, color = "black") {
  fill(colorOf(color));
  for (let i = 0; i < bits.length; i++) {
    text(bits[i], x, y);
    x += 9;
  }
  return x;     // transmit the coordinate left at after writing
}

function printValue(val, x, y, size, prevSize, color = "black") {
  fill(colorOf(color));
  textSize(size);
  text(`(${val})`, x+9, y-15);
  textSize(prevSize);
}

function printNodes(nodes) {
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

function printCarParameters() {
  textSize(15);
  let x = 1100, y = 50, xVal = 1250;

  text("Simulation parameters:", x, y);
  y+=20;
  textSize(14);
  text("car speed:", x, y);
  text(car.speed, xVal, y);
  y+=15;
  text("motor load:", x, y);
  text(car.motorLoad, xVal, y);
  y+=15;
  text("engine temperature:", x, y);
  text(car.temperature, xVal, y);
  y+=15;
  text("simulation speed:", x, y);
  text((1/period*100).toFixed(2), xVal, y);            
  // text(period, xVal, y);            

}