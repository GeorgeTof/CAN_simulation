function setupNodes(nodes) {
  let n = Object.create(Node);      // sketchy ca Node e declarat in sketch :/
  n.name = "Acceleration";
  n.id = 5;
  n.key = 'w';
  n.defaultData = -1;
  n.x = 200;
  n.y = 60;
  n.sensitivity = [4];
  n.functionAtReceive = accelerationFunction;
  nodes.push(n);
  n = Object.create(Node); 
  n.name = "Brake";
  n.id = 3;
  n.key = 's';
  n.defaultData = -1;
  n.x = 140;
  n.y = 60;
  nodes.push(n);
  n = Object.create(Node); 
  n.name = "Start Button";
  n.id = 4;
  n.key = 'k';
  n.defaultData = -2;
  n.x = 290;
  n.y = 60;
  n.sensitivity = [5];
  n.functionAtReceive = startButtonFunction;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Motor sensors";
  n.id = 401;
  n.x = 370;
  n.y = 220;
  n.periodForTransmission = 25;   // shorter than period of a data frame of dlc = 1
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Motor";
  n.id = 2000;
  n.x = 300;
  n.y = 220;
  n.sensitivity = [5, 4];
  n.functionAtReceive = motorFunction;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Dashboard";
  n.id = 1900;
  n.x = 450;
  n.y = 60;
  n.sensitivity = [401];
  n.functionAtReceive = dashboardFunction;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Brakes";
  n.id = 1000;
  n.x = 620;
  n.y = 220;
  n.sensitivity = [3];
  n.functionAtReceive = brakesFuncion;
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

    x = printBits(extendBits(previousFrame.crcD, 1), x, y, "gray");  

    x = printBits(extendBits(previousFrame.ack, 1), x, y, "green");  

    x = printBits(extendBits(previousFrame.ackD, 1), x, y, "gray");  
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
  let x = 1000, y = 50, xVal = 1150, xLine = 1200;

  text("Simulation parameters:", x, y);
  y+=20;
  textSize(14);
  text("car started:", x, y);
  text(car.started==1? "yes" : "no", xVal, y);
  y+=15;
  text("car speed:", x, y);
  text(Math.floor(car.speed), xVal, y);
  analogDraw(car.speed, xLine, y, 6, "blue");
  y+=15;
  text("motor load:", x, y);
  text(car.motorLoad, xVal, y);
  analogDraw(car.motorLoad, xLine, y, 6, "green");
  y+=15;
  text("brakes load:", x, y);
  if(car.brakesLoad > 0){
    analogDraw(car.brakesLoad, xLine, y, 5, "brown");
  }
  text(car.brakesLoad, xVal, y);
  y+=15;
  text("engine temperature:", x, y);
  text(car.temperature, xVal, y);
  analogDraw(car.temperature , xLine, y, 6, "orange");
  y+=15;
  text("simulation speed:", x, y);
  text((1/period*100).toFixed(2), xVal, y);            
  // text(period, xVal, y);            

}

function analogDraw(val, x, y, weight, color) {
  strokeWeight(weight);
  stroke(colorOf(color));
  line(x, y-6, x + val, y-6);
  // stroke("black");
  strokeWeight(0.01);
}