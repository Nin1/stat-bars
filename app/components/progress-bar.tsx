'use client'

import { useState, useEffect } from 'react';
import {
    Frequency,
    ProgressData
  } from '../definitions';


function AddFrequencyToDate(frequency: Frequency, date: Date) {
    let nextDate: Date = new Date(date);
    if (frequency.unit === "minute")
    {
        nextDate.setTime(nextDate.getTime() + (1000 * 60 * frequency.amount));
    }
    else if (frequency.unit === "hour")
    {
        nextDate.setTime(nextDate.getTime() + (1000 * 60 * 60 * frequency.amount));
    }
    else if (frequency.unit === "day")
    {
        nextDate.setDate(nextDate.getDate() + frequency.amount);
    }
    else if (frequency.unit === "week")
    {
        nextDate.setDate(nextDate.getDate() + (frequency.amount * 7));
    }
    else if (frequency.unit === "month")
    {
        nextDate.setMonth(nextDate.getMonth() + frequency.amount);
    }
    return nextDate;
}

export default function ProgressBar(progress: ProgressData) {
    const [t, setT] = useState(0);
    const [overflow, setOverflow] = useState(0);
    function RefreshProgress() {
        let currentDate = new Date();

        // Calculate 
        let startMs: number = progress.startTime.getTime();
        let endMs: number = AddFrequencyToDate(progress.frequency, progress.startTime).getTime();
        let currentMs: number = currentDate.getTime();

        endMs -= startMs;
        currentMs -= startMs;
        let unboundT: number = currentMs / endMs;

        setT(Math.min(Math.max(unboundT, 0), 1));
        setOverflow(Math.max(0, currentMs - endMs));
    }

    // Update bar every 1000ms
    useEffect(() => {
        RefreshProgress();
        const interval = setInterval(RefreshProgress, 1000);
        return () => { clearInterval(interval); }
    });

    return (
        <div style={{
            height: 20,
            width: 200
        }}>
            <div
                style={{
                    height: "100%",
                    width: `${t * 100}%`,
                    backgroundColor: "blue"
                }}>
            </div>

        </div>
    );
}