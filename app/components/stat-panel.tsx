import { useEffect, useState } from 'react';
import {
    NeedData,
    Frequency,
    NeedConfig
  } from '../definitions';
import ProgressBar from './progress-bar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faCheck, faBars } from '@fortawesome/free-solid-svg-icons'
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from '@hello-pangea/dnd';
import { Prosto_One } from 'next/font/google';

function ENTRIES_KEY(id: string): string { return id + ".entries"; }

function GetLastEntryTime(entries: Date[]) {
    if (entries.length > 0)
    {
        return entries[entries.length - 1];
    }
    return new Date();
}

function LoadEntries(id: string): Date[] {
  // Load entries from local storage
  const storedEntries: string | null = localStorage.getItem(ENTRIES_KEY(id));
  if (storedEntries != null) {
    let dateStrings: string[] = JSON.parse(storedEntries);
    let dateArray: Date[] = [ ];
    dateStrings.forEach(date => {
      dateArray.push(new Date(date));
    });
    return dateArray;
  }
  // Else, create and save a default start time for testing
  const initialEntries: Date[] = [ new Date() ];
  localStorage.setItem(ENTRIES_KEY(id), JSON.stringify(initialEntries));
  return [ new Date() ];
}

type StatPanelProps = {
    config: NeedConfig,
    onEdit: (config : NeedConfig) => void,
    dragHandleProps: DraggableProvidedDragHandleProps | null
}

export default function StatPanel(props: StatPanelProps) {
    let entries = LoadEntries(props.config.name);

    let [startTime, setStartTime] = useState(GetLastEntryTime(entries));

    // Runs when 'Done!' is clicked, to add a new date entry and reset the progress bar
    function OnDone() {
        let newDate = new Date();
        entries.push(newDate);
        setStartTime(newDate);
        localStorage.setItem(ENTRIES_KEY(props.config.name), JSON.stringify(entries));
    }

    function FrequencyString(): string {
        const amount: number = props.config.frequency.amount;
        return `Every ${amount} ${props.config.frequency.unit}${amount == 1 ? '' : 's'}`
    }

    return (
        <div className="stat-panel-root">
            <div className="stat-panel-handle" {...props.dragHandleProps}>
                <FontAwesomeIcon icon={faBars} size="xl"/>
            </div>
            <div className="stat-panel-info-container">
                <div className="stat-panel-info-text">
                    <h1 className='stat-panel-info-header'>{props.config.name}</h1>
                    <h1 className='stat-panel-info-frequency'>{FrequencyString()}</h1>
                </div>
                <ProgressBar startTime={startTime} frequency={props.config.frequency}/>
            </div>
            <button className="stat-panel-button" type="button" onClick={() => props.onEdit(props.config)}>
                <FontAwesomeIcon icon={faGear} size="xl"/>
            </button>
            <button className="stat-panel-button" type="button" onClick={OnDone}>
                <FontAwesomeIcon icon={faCheck} size="xl" style={{color: "#63E6BE"}}/>
            </button>
        </div>
    );
}