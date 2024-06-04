'use client'

import Image from "next/image";
import { Frequency, NeedConfig, NeedData } from "./definitions";
import StatPanel from "./components/stat-panel";
import { SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

function CONFIG_KEY(id: string): string { return id + ".config"; }
function ENTRIES_KEY(id: string): string { return id + ".entries"; }

function GetDefaultConfig(id: string): NeedConfig {
  let freq: Frequency = { unit: "minute", amount: 1 };
  let config: NeedConfig = { uuid: uuidv4(), name: id, frequency: freq };
  return config;
}

// Each 'need' has a unique ID (name) which are stored in a master list
function LoadNeedIDs(): string[] {
  const storedIDs: string | null = localStorage.getItem("needIDs");
  if (storedIDs != null) return JSON.parse(storedIDs);
  return [ "Jog", "Cook", "Laundry" ];
}

// Load config from local storage, or create a new one if it doesn't exist
function LoadNeedConfig(id: string): NeedConfig {
  const storedConfig: string | null = localStorage.getItem(CONFIG_KEY(id));
  if (storedConfig != null) return JSON.parse(storedConfig);
  // Else, create and save a new config for testing
  let config = GetDefaultConfig(id);
  localStorage.setItem(CONFIG_KEY(id), JSON.stringify(config));
  return config;
}

export default function StatsRoot() {
  let needIDs: string[] = LoadNeedIDs();

  let [configs, setNeedData] = useState<NeedConfig[]>(LoadConfigs());
  let [newName, setNewName] = useState("");

  // Loads all data for all needs currently present in 'needIDs' 
  function LoadConfigs() {
    let newConfigs: NeedConfig[] = [ ];
    needIDs.forEach(needID => {
      const config: NeedConfig = LoadNeedConfig(needID);
      newConfigs.push(config);
    });
    return newConfigs;
  }

  // Dangerous! Resets everything
  function ResetAllData() {
    needIDs.forEach(id => {
      localStorage.removeItem(CONFIG_KEY(id));
      localStorage.removeItem(ENTRIES_KEY(id));
    });
    localStorage.removeItem("needIDs");
    needIDs = LoadNeedIDs();
    Reload();
  }

  // (Re)Loads all data for all needs present in the 'needIDs' array
  function Reload() {
    setNeedData(LoadConfigs());
  }

  // Given a new config, add it to the data
  function AddNewConfig() {
    const config: NeedConfig = GetDefaultConfig(newName);
    needIDs.push(config.name);
    localStorage.setItem("needIDs", JSON.stringify(needIDs));
    localStorage.setItem(CONFIG_KEY(config.name), JSON.stringify(config));
    const initialEntries: Date[] = [ new Date() ];
    localStorage.setItem(ENTRIES_KEY(config.name), JSON.stringify(initialEntries));
    Reload();
    setNewName('');
  }

  // Deletes the given need from the list
  function DeleteConfig(config: NeedConfig) {
    localStorage.removeItem(CONFIG_KEY(config.name));
    localStorage.removeItem(ENTRIES_KEY(config.name));
    needIDs = needIDs.filter(value => value !== config.name);
    localStorage.setItem("needIDs", JSON.stringify(needIDs));
    Reload();
  }

  function HandleNewNameField(event: { target: { value: SetStateAction<string>; }; }) {
    setNewName(event.target.value);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ul>
        {configs.map((config) => (
          <li key={config.uuid}><StatPanel config={config} onDelete={DeleteConfig}/></li>
        ))}
      </ul>
      <input type="text" value={newName} onChange={HandleNewNameField}/>
      <button type="button" onClick={AddNewConfig}>Add New</button>
      <button type="button" onClick={ResetAllData}>Reset All</button>
    </main>
  );
}
