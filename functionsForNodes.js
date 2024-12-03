function funForNode(thisNode, recFrame) {                                   // DEBUG function
  console.log("Node " + thisNode.name + " has received an important frame from node "+recFrame.id);
}

function motorFunction(thisNode, recFrame) {
    car.motorLoad += recFrame.dataField;
}

function accelerationFunction(thisNode, recFrame) {
    if(recFrame.rtr == 1){
        thisNode.generateDataFrame(thisNode.dataRegister);
    }
}