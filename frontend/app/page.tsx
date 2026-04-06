'use client';
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { fetch_data } from "./api";
import Readout from "./readout";

export default function Home() {
  const [state, updateState] = useState({
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
    "connected": false,
    "connection_reliability": 0.0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch_data().then((data) => {
        updateState(data);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black h-screen text-white font-sans overflow-hidden">
    {/* HEADER */}
    <header>
      <div className="flex items-center p-4 space-x-4">
        <div className="logo">
          <Image
            src="/rocketteam.png"
            alt="MIT Rocket Team"
            width={100}
            height={50}
            className="inline-block"
          />
        </div>
        <div className="text-2xl tracking-widest">
          SPHINX
        </div>
        <div className="text-2xl tracking-widest text-gray-400">
          〉TELEMETRY
        </div>
        <div className="flex-1"></div>
        {
          state.connected ? (
            <div className="text-green-500 font-mono tracking-widest border border-green-900 rounded-full px-2">
              ● {Math.round(state.connection_reliability * 100)}% PACKETS RECEIVED
            </div>
          ) : (
            <div className="text-red-500 font-mono tracking-widest border border-red-900 rounded-full px-2">
              ● DISCONNECTED
            </div>
          )
        }
        <Image
          src="/mit.png"
          alt="MIT Logo"
          width={60}
          height={20}
          className="inline-block"
        />
      </div>
      <div className="border-t h-0.5 border-gray-400 mx-4"></div>
    </header>
    {/* MAIN CONTENT */}
    <main className="p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Readout label="Altitude/BMP" value={state.altitude_bmp} unit=" m" />
        <Readout label="Altitude/ToF" value={state.altitude_tof} unit=" m" />
        <Readout label="Gyro[X]/LSM" value={state.gyro_lsm[0]} unit=" m°/s" />
        <Readout label="Gyro[Y]/LSM" value={state.gyro_lsm[1]} unit=" m°/s" />
        <Readout label="Gyro[Z]/LSM" value={state.gyro_lsm[2]} unit=" m°/s" />
        <Readout label="Accel[X]/LSM" value={state.accel_lsm[0]} unit=" mg" />
        <Readout label="Accel[Y]/LSM" value={state.accel_lsm[1]} unit=" mg" />
        <Readout label="Accel[Z]/LSM" value={state.accel_lsm[2]} unit=" mg" />
        <Readout label="Heading/BNO" value={state.gyro_bno[0]} unit="°" />
        <Readout label="Roll/BNO" value={state.gyro_bno[1]} unit="°" />
        <Readout label="Pitch/BNO" value={state.gyro_bno[2]} unit="°" />
        <Readout label="Temperature" value={state.temperature} unit=" °C" />
        <Readout label="Battery Voltage" value={state.esc_voltage} unit=" V" />
        <Readout label="Servo Voltage" value={state.servo_voltage} unit=" V" />
      </div>
      {/* Additional content can go here */}
    </main>
    </div>
  );
}
