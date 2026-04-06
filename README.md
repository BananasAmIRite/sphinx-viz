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
