import time
import threading
import struct

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import serial
import serial.tools.list_ports

""" == SERVER SETUP == """

POLL_INTERVAL = 0.05

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

""" == SERIAL SETUP == """

ports = serial.tools.list_ports.comports()
print("AVAILABLE PORTS:")
for port, desc, hwid in sorted(ports):
    print("{}: {} [{}]".format(port, desc, hwid))
if len(ports) > 1:
    port = input("SELECT PORT > ")
    if port == "":
        port = sorted(ports)[0][0]
else:
    ports = []
    while len(ports) == 0:
        ports = serial.tools.list_ports.comports()
    port = ports[0][0]
print(f"SELECTED PORT: {port}")
serial_port = serial.Serial(port, baudrate=115200, timeout=1)

""" == CONFIGURATION == """

"""
struct sensor_data {
    int16_t altitude_bmp;	// altitude_bmp = altitude (m) * 4
    int16_t altitude_tof;	// altitude_tof = altitude (mm)
    int16_t gyro_lsm[3];	// gyro_lsm = gyro (millideg/sec) / 70
    int16_t accel_lsm[3];	// accel_lsm = accel (millig) / 0.122
    int16_t mag_lis[3];      // mag_lis = magnetometer (normalized: -1, 1) * 2^10
    int8_t gyro_bno[3];	// gyro_bno = gyro (degrees)

    double lat_cd;		// lat_cd = latitude (non-RTK)
    double lon_cd;		// lon_cd = longitude (non-RTK)
    double lat_rtk;		// lat_rtk = latitude (RTK)
    double lon_rtk;	// lon_rtk = longitude (RTK)
    
    uint8_t temp;		// temp = power board core temp (C) * 255 / 64
    uint8_t batt_voltage; 	// batt_voltage = battery voltage (V) * 255 / 16
    uint8_t servo_voltage;	// servo_voltage = servo voltage (V) * 255 / 8
    uint8_t count;
};
"""

SENSOR_STATE = {
    "altitude_bmp": 0,
    "altitude_tof": 0,
    "gyro_lsm": [0, 0, 0],
    "accel_lsm": [0, 0, 0],
    "mag_lis": [0, 0, 0],
    "gyro_bno": [0, 0, 0],
    "lat_cd": 0.0,
    "lon_cd": 0.0,
    "lat_rtk": 0.0,
    "lon_rtk": 0.0,
    "temperature": 0.0,
    "esc_voltage": 0.0,
    "servo_voltage": 0.0,
    "connected": False,
    "connection_reliability": 0.0
}

STRUCT_FORMAT = "<11h3b4d4B"
STRUCT_LENGTH = struct.calcsize(STRUCT_FORMAT)

CONNECTION_TIMEOUT = 5.0
LAST_RECEIVED_TIME = time.time()
COUNTS = []

" == SERIAL LOGIC =="

current_data = bytearray()

def receive_data():
    if serial_port.in_waiting > 0:
        packet = serial_port.read(serial_port.in_waiting)
        if packet.endswith(b"\r\n"):
            packet = packet[:-2]
        if packet:
            # debug_hex = " ".join(f"{b:02x}" for b in packet)
            # print("!!! RAW:", debug_hex)
            # print(f"!!! RAW LENGTH: {len(packet)} (expected {STRUCT_LENGTH})")
            return packet
    return None

def update_thread():
    global SENSOR_STATE, current_data, LAST_RECEIVED_TIME
    while True:
        data = receive_data()
        if data is not None:
            current_data.extend(data)

        while len(current_data) >= STRUCT_LENGTH:
            frame = bytes(current_data[:STRUCT_LENGTH])
            print(f"!!! FRAME: {frame.hex()}")
            current_data = current_data[STRUCT_LENGTH:]

            try:
                unpacked = struct.unpack(STRUCT_FORMAT, frame)
                print(unpacked)

                # Field offsets in <11h3b4d3B payload:
                SENSOR_STATE["altitude_bmp"] = unpacked[0] / 4.0
                SENSOR_STATE["altitude_tof"] = unpacked[1] / 1000
                SENSOR_STATE["gyro_lsm"] = [x * 70.0 for x in unpacked[2:5]]
                SENSOR_STATE["accel_lsm"] = [x * 0.122 for x in unpacked[5:8]]
                SENSOR_STATE["mag_lis"] = [x / 1024.0 for x in unpacked[8:11]]
                SENSOR_STATE["gyro_bno"] = list(unpacked[11:14])
                SENSOR_STATE["lat_cd"] = unpacked[14]
                SENSOR_STATE["lon_cd"] = unpacked[15]
                SENSOR_STATE["lat_rtk"] = unpacked[16]
                SENSOR_STATE["lon_rtk"] = unpacked[17]
                SENSOR_STATE["temperature"] = unpacked[18] * 64 / 255.
                SENSOR_STATE["esc_voltage"] = unpacked[19] * 16 / 255.
                SENSOR_STATE["servo_voltage"] = unpacked[20] * 8 / 255

                LAST_RECEIVED_TIME = time.time()
                COUNTS.append(unpacked[21])
                if len(COUNTS) > 20:
                    COUNTS.pop(0)

            except Exception as e:
                print(f"Error parsing data: {frame.hex()} ({e})")
        if time.time() - LAST_RECEIVED_TIME > CONNECTION_TIMEOUT:
            SENSOR_STATE["connected"] = False
            SENSOR_STATE["connection_reliability"] = 0.0
        else:
            SENSOR_STATE["connected"] = True
            if len(COUNTS) > 1:
                SENSOR_STATE["connection_reliability"] = len(COUNTS) / ((COUNTS[-1] - COUNTS[0] + 1) % 256)
        time.sleep(POLL_INTERVAL)

t = threading.Thread(target=update_thread, daemon=True)
t.start()

" == SERVER ROUTING == "

@app.get("/data")
def get_data():
    global SENSOR_STATE
    return SENSOR_STATE

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)