function funForNode(thisNode, recFrame) {                                   // DEBUG function
  console.log("Node " + thisNode.name + " has received an important frame from node "+recFrame.id);
}

function motorFunction(thisNode, recFrame) {
    if(recFrame.id == 5){   // acceleration
        car.motorLoad += recFrame.dataField;
    }
    else if(recFrame.id == 4){  // start button
        if(recFrame.rtr == 0){  // is a data frame
            car.started = recFrame.dataField;
        }
    }
}

function accelerationFunction(thisNode, recFrame) {
    if(recFrame.rtr == 1){
        thisNode.generateDataFrame(thisNode.dataRegister);
    }
}

function startButtonFunction(thisNode, recFrame) {
    // LAST CHECKPOINT 
    if(recFrame.id == 5){
        if(recFrame.dataField == 0){
            thisNode.generateDataFrame(1);
        }
    }
}