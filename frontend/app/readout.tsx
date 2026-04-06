"use client";

import { useEffect, useRef, useState } from "react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Sample = {
    t: string;
    v: number;
};

const MAX_POINTS = 60;

export default function Readout({
    label,
    value,
    unit,
}: {
    label: string;
    value: number | string;
    unit?: string;
}) {
    const [series, setSeries] = useState<Sample[]>([]);
    const latestValueRef = useRef<number | string>(value);

    useEffect(() => {
        latestValueRef.current = value;
    }, [value]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const latestValue = latestValueRef.current;

            if (typeof latestValue !== "number" || Number.isNaN(latestValue)) {
                return;
            }

            const nextPoint: Sample = {
                t: new Date().toLocaleTimeString(),
                v: latestValue,
            };

            setSeries((prev) => {
                const next = [...prev, nextPoint];
                return next.slice(-MAX_POINTS);
            });
        }, 100);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <div className="flex w-full flex-col items-center space-y-3 rounded-lg border border-gray-700 p-2">
            <div className="text-sm tracking-widest text-gray-400 uppercase">{label}</div>
            <div className="text-2xl font-mono tracking-widest">
                {typeof value === "number" ? value.toFixed(2) : value}
                {unit}
            </div>

            <div className="h-16 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="t" hide />
                        <YAxis domain={["auto", "auto"]} width={16} />
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke="#cf2c1d"
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}