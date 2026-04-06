# sphinx-viz
Telemetry viewer for SPHINX, a VTVL pathfinder of a propulsively landed rocket. Reads serial stream from ground station LoRa system, unpacks binary telemetry struct, and displays in a graphical interface.

<img width="957" height="654" alt="image" src="https://github.com/user-attachments/assets/08374f28-ab0b-4cac-94e1-88a526fd94e9" />

## Installation
- Graphical frontend installation: `cd frontend && npm i`
- Server: requires `fastapi` and `pyserial`

## Usage
Open two terminals for the server and client respectively.
- `python server.py`, then select port connected to ground station
- `npm run build && npm run start`, then visualizer should be active at `http://localhost:3000`

## Ground Station
This is the minimal example needed to get the ground station ESP32C3 board to receive telemetry.
```python
#include <SPI.h>
#include <LoRa.h>

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("! LoRa receive active !");
  LoRa.setPins(1,3,2);
  if (!LoRa.begin(868E6)) {
    Serial.println("! Starting LoRa failed !");
    while (1);
  }
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (!packetSize) return;
  String msg = "";
  while (LoRa.available()) msg += (char)LoRa.read();
  Serial.println(msg);
}
```
