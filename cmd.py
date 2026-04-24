import time
import threading
import serial
import serial.tools.list_ports

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
serial_port = serial.Serial(port, baudrate=9600, timeout=1)

CONNECTION_TIMEOUT = 5.0
LAST_RECEIVED_TIME = time.time()
COUNTS = []

" == SERIAL LOGIC =="

def receive_data():
    if serial_port.in_waiting > 0:
        packet = serial_port.read(serial_port.in_waiting)
        if packet.endswith(b"\r\n"):
            packet = packet[:-2]
        if packet:
            return packet
    return None

def update_thread():
    global SENSOR_STATE, current_data, LAST_RECEIVED_TIME
    while True:
        data = receive_data()
        if data:
            print(data)

# t = threading.Thread(target=update_thread, daemon=True)
# t.start()

while True:
    x = input("> ")
    serial_port.write(x.encode() + b"\r\n")