# CAN Simulation

An interactive and visual simulation of the mechanism the nodes of a car use to communicate through a CAN.

<p align="center">
  <a href="#description">Description</a> •
  <a href="#theoretical_background">Theoretical background</a> •
  <a href="#functionalities">Functionalities</a> •
  <a href="#instructions">Instructions</a>
</p>

---

## Description

The project was built using **P5**, a web-based JavaScript framework.  
The car components are represented as nodes connected through a **controller area network bus** and implement functionalities such as **starting the car, accelerating, braking, and updating the dashboard speed and monitors**.  

The speed of the simulation can be varied by adjusting the **frequency of the clock**, allowing the flexibility of **easier tracing** of the communication at lower speeds and **more realism** at higher ones.  

Technical aspects of the implementation include:  
- Modeling the nodes, frames, the bus, and the car into **classes**  
- Implementing the transmission process of a frame on the bus as a **finite state machine**  
- Using advanced data structures, such as **sets** and **maps**  
- Using **callback functions** to define the dynamic functionality of each node when receiving data  

---

## Theoretical_background

The **controller area network** is the communication protocol present in all cars **since the mid-1990s**, as well as in most other vehicles and industrial applications for its **robustness and flexibility**.  

The communication on the bus works on the **open-collector principle**, i.e., if both **'1'** and **'0'** are written at the same time, only the **'0'** value will remain.  

Messages are sent on the bus in the form of **data frames** that have the following structure:  

- **11 bits** for the **ID**  
- **1 bit** for encoding the remote transmission request  
- **4 bits** for encoding the length of the data, in bytes  
- **1 acknowledgment bit**, which has the value **'1'** by default  

Based on the specification in the **remote transmission request bit**, frames can be:

- **Data frames**, that contain information encoded into bytes and have:
  - The length of the data stored in the **data length field**  
  - Data of the specified length  
  - A **cyclic redundancy check field**, for the receiving nodes to check in order to assure the consistency of the data  
- **Remote frames**, that only request data of the length specified in the **data length code field**  

For **error checking** and **synchronizing the internal clocks** of the connected nodes, the data frames are **'stuffed'** with a bit of the reverse polarity every **5 bits of the same one**.  

If no **errors** or **inconsistencies** are detected, all the nodes of the system will overwrite the **'1'** in the **acknowledgment bit** with a **'0'** to signal the **successful transmission**. The value **'1'** will not be overwritten otherwise, signaling the **transmitting node** to **repeat transmission**.  

---

## Functionalities

The following nodes are connected to the bus:

- *The acceleration* and *The brake*, sending the accumulated input on the pedal  
- *The start button*, that sends a **remote frame** that requests the acceleration to confirm not receiving any input, followed by sending the motor the command to start  
- *The motor*, that receives the command to start from the start button and the command to accelerate by a specific amount from the acceleration  
- *The motor sensors*, that periodically send a **two-byte data frame** about the **car speed and engine temperature** to the dashboard  
- *The dashboard*, that decodes the data and updates the **visible speedometer**, as well as the **check engine monitor**  
- *The brakes*, that execute the **braking command** by a given amount sent by the brake pedal  

*Arbitration* happens every time two nodes attempt to transmit on the bus at the same time. Following the **open-collector principle**, the frame with the **lower ID** will win, as when two values are written, only **'0'** will persist.  

*Stuff bits* are automatically encoded into the frames, checked in real time, and labeled with **brown** when displayed on the bus. They are decoded at reception.  

*Errors* can be introduced in the simulation, causing the **erroneous transmission of stuff bits**. These bits are labeled in **red** and cause the listening nodes **not to acknowledge** the frame.  

The *acknowledgment mechanism* is also implemented, with all nodes except the transmitting one writing on the bus in order to signal the successful reception of the frame.  

The **nodes attempting to transmit**, along with their **data**, are displayed in real time, as is the **data that gets on the bus**.  

The previously transmitted frame is displayed, each part of it being labeled with a different color, and the **ID, data length code, and data** are decoded into decimal.  

---

## Instructions

All the possible **keyboard inputs** are displayed on the **right side of the screen**.  

Pausing the simulation is recommended for checking any functionality or deciding on future inputs.  

**Adjusting the simulation speed** is also highly recommended:  
- A **lower speed** (like **0.25**) provides **easier tracing** of quick events like **acknowledgment of frames** or **arbitration**.  
- A **higher speed** (like **4.0**) provides **more realism** for more complex mechanisms like **braking after accelerating**.  

The **motor sensors** will attempt to send the most actual data about the car to the **dashboard** every **25 clock ticks**.  
This will **not affect** the rest of the functionalities since the **sensors have a large number for the ID** and will **lose arbitration** against any other node with a smaller ID.  

The **brake and acceleration** will have **no effect until the car is started**.  

By pressing the **start button**, a **remote frame** will be sent to the **acceleration** in order to confirm that it has no input. Then, if that confirmation is received, a **frame will be sent to the motor** to command it to start.  
The **starting of the motor** can be traced in the **simulation parameters** (upper right side), by updating the **'car started'** field, as well as the **base engine temperature**.  

After the **car is started**, the user can see the effects of pressing the **acceleration** and the **brake**.  
If the **bus is currently busy**, any **commands to the pedals following the first one will be accumulated** until the frame can be sent.  
This ensures that **no input from the driver is lost**.  

Each press of the **'R'** key will **inject an error into the simulation**. An error is **manifested** in the **erroneous transmission of a stuff bit** (labeled in **red**), followed by the **lack of acknowledgment** of the transmitted frame, **which causes the transmission to be repeated**.  
