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
    capitalize = true,
    mini = false,
}: {
    label: string;
    value: number | string;
    unit?: string;
    capitalize?: boolean;
    mini?: boolean;
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
        <div className={`flex w-full flex-col items-center space-y-0 ${mini ? "" : "rounded-xl border border-gray-700 p-1"}`}>
            <div className={`${mini ? "text-xs" : "text-sm"} tracking-widest text-gray-200 m-0${capitalize ? " uppercase" : ""}`}>{label}</div>
            <div className={`${mini ? "" : "text-xl"} font-mono tracking-widest`}>
                {typeof value === "number" ? +value.toFixed(4) : value}
                {unit}
            </div>

            <div className={`${mini ? "h-12" : "h-16"} w-full`}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="t" hide />
                        <YAxis domain={["auto", "auto"]} width={4} />
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke="#d90e0b"
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