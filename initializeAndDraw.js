function setupNodes(nodes) {
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

function printPreviousFrame(previousFrame) {
  // TODO increase text size
  textSize(14);
  // fill(colorOf("green"));
  let x = 150;
  text("Previous frame:", 50, 300);

  fill(colorOf("brown"));
  text(extendBits(1, 1), x, 300);
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