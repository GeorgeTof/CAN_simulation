function funForNode(thisNode, recFrame) {                                   // DEBUG function
  console.log("Node " + thisNode.name + " has received an important frame from node "+recFrame.id);
}

function motorFunction(thisNode, recFrame) {
    if(recFrame.id == IDS.acceleration){
        car.motorLoad += recFrame.dataField;
    }
    else if(recFrame.id == IDS.startButton){
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
    if(recFrame.id == IDS.acceleration){
        if(recFrame.dataField == 0){
            thisNode.generateDataFrame(1);
        }
    }
}

function brakesFuncion(thisNode, recFrame) {
    // console.log("increasing the brake load by " + recFrame.dataField);
    if(recFrame.id == IDS.brake){
        console.log("increasing the brake load by " + recFrame.dataField);
        car.brakesLoad += recFrame.dataField;
    }
}

function generateMotorSensorsData() {
    /// the first byte will be the car temperature and the second one will be the speed
    let data = 0;
    data += Math.floor(car.speed);
    data += Math.floor(car.temperature) * 256;
    return data;
}

function dashboardFunction(thisNode, recFrame) {
    if(recFrame.id == IDS.motorSensors){
        thisNode.dataRegister = recFrame.dataField % 256;
        if(Math.floor(recFrame.dataField / 256) > 45){     // if temperature greater tha treshold
            thisNode.dataRegister2 = 1;                 // set the check engine register indefinietly
        } 
    }
}