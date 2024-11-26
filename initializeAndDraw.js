function setupNodes(nodes) {
  let n = Object.create(Node);      // sketchy ca Node e declarat in sketch :/
  n.name = "Acceleration";
  n.id = 5;
  n.key = 'w';
  n.defaultData = -1;
  n.x = 50;
  n.y = 50;
  nodes.push(n);
  n = Object.create(Node);
  n.name = "Speed sensor";
  n.id = 401;
  n.x = 80;
  n.y = 150;
  n.periodForTransmission = 10;
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

function printPreviousFrame(previousFrame) {
  if(previousFrame == null){
    return;
  }
  let mainSize = 14;
  let x = 160, y = 300;
  textSize(14);

  text("Previous frame:", 50, 300);

  x = printBits("0", x, y, "brown");

  x = printBits(extendBits(previousFrame.id, 11), x, y, "green");

  x = printBits(extendBits(previousFrame.rtr, 1), x, y, "blue");

  x = printBits(extendBits(previousFrame.ide, 1), x, y, "gray");

  x = printBits(extendBits(previousFrame.reserved, 1), x, y, "gray");
  
  x = printBits(extendBits(previousFrame.dlc, 4), x, y, "orange");

  x = printBits(extendBits(previousFrame.dataField, previousFrame.dlc*8), x, y, "magenta");

  x = printBits(extendBits(previousFrame.crc, 15), x, y, "yellow");

  fill("black");  
}

function printBits(bits, x, y, color = "black") {
  fill(colorOf(color));
  for (let i = 0; i < bits.length; i++) {
    text(bits[i], x, y);
    x += 9;
  }
  return x;
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