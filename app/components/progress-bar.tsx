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

// g=255 below t=0.5, then linearly to g=0 at t=1
function GetGreenFromT(t: number): number {
    let g: number = (1 - ((t - 0.5) * 2)) * 255;
    return Math.min(Math.max(g, 0), 255)
}

// r=255 above t=0.5, then linearly to r=0 at t=0
function GetRedFromT(t: number): number {
    let r: number = ((t - 0.5) * 2) * 255;
    return Math.min(Math.max(r, 0), 255)
}

function GetFGColourFromT(t: number) {
    return "rgb(" + GetRedFromT(t) + ", " + GetGreenFromT(t) + ", 0)";
}

function GetBGColourFromT(t: number) {
    if (t === 1)
    {
        return "red";
    }
    return "rgb(" + GetRedFromT(t)/2 + ", " + GetGreenFromT(t)/2 + ", 0)";
}

function MsToTimeString(ms: number): string {
    let seconds = (ms / 1000);
    let minutes = (ms / (1000 * 60));
    let hours = (ms / (1000 * 60 * 60));
    let days = (ms / (1000 * 60 * 60 * 24));
    if (seconds < 60) return seconds.toFixed(0) + "s";
    else if (minutes < 60) return minutes.toFixed(0) + " mins";
    else if (hours < 24) return hours.toFixed(0) + " hours";
    else return days + " days"
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

    function GetOverlayText() {
        if (overflow > 0) {
            return MsToTimeString(overflow) + " overdue!";
        }
        return "";
    }

    // Grid here lets us layer things on top of each other
    return (
        <div style={{display:"block", height:"30px"}}>
            <div className="progress-bar-grid">
                <div className="progress-bar-bg"
                    style={{
                        backgroundColor: `${GetBGColourFromT(t)}`
                    }}>
                </div>
                <div className="progress-bar-fg-container"
                    style={{
                        width: `${100 - (t * 100)}%`,
                    }}>
                    <div className="progress-bar-fg"
                        style={{
                            backgroundColor: `${GetFGColourFromT(t)}`
                        }}>
                    </div>
                </div>
                <h3 className="progress-bar-text">{GetOverlayText()}</h3>
            </div>
        </div>
    );
}