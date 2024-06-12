'use client'

import Image from "next/image";
import { Frequency, NeedConfig, NeedConfigDef, NeedData } from "./definitions";
import StatPanel from "./components/stat-panel";
import { SetStateAction, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import StatList from "./components/stat-list";
import StatEditModal from "./components/stat-edit-modal";

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

  let [isEditing, setIsEditing] = useState(false);
  let [editingConfig, setEditingConfig] = useState<NeedConfig | null>(null);

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

  // Given a new config, add it to the data and refresh
  function AddNewConfig(newConfig: NeedConfigDef) {
    if (newConfig.name.length <= 0 || needIDs.includes(newConfig.name)) {
      // Error: name is invalid
      return;
    }
    let config: NeedConfig = { uuid: uuidv4(), name: newConfig.name, frequency: newConfig.frequency };
    needIDs.push(config.name);
    localStorage.setItem("needIDs", JSON.stringify(needIDs));
    localStorage.setItem(CONFIG_KEY(config.name), JSON.stringify(config));
    const initialEntries: Date[] = [ new Date() ];
    localStorage.setItem(ENTRIES_KEY(config.name), JSON.stringify(initialEntries));
    Reload();
  }

  // Sets the new config in the list.
  // If oldConfig is not null, the new config will overwrite it.
  // Otherwise, the new config will be added as a new entry in the list.
  function SetConfig(oldConfig: NeedConfig | null, newConfig: NeedConfigDef) {
    if (oldConfig == null) {
      AddNewConfig(newConfig);
    }
    else {
      // Find the old config just to make sure we have the latest one
      const sourceIndex = configs.findIndex((config) => config.uuid === oldConfig.uuid);
      if (sourceIndex != -1) {
        const newIdList = [...needIDs];
        const newConfigs = [...configs];

        // Rename the stored data
        const oldName = configs[sourceIndex].name;
        const entriesData = localStorage.getItem(ENTRIES_KEY(oldName));
        if (entriesData != null) localStorage.setItem(ENTRIES_KEY(newConfig.name), entriesData);
        localStorage.removeItem(CONFIG_KEY(oldName));
        localStorage.removeItem(ENTRIES_KEY(oldName));

        // Update the ID
        newIdList[sourceIndex] = newConfig.name;
        needIDs = newIdList;
        localStorage.setItem("needIDs", JSON.stringify(needIDs));

        // Update the config
        newConfigs[sourceIndex].name = newConfig.name;
        newConfigs[sourceIndex].frequency = newConfig.frequency;
        setNeedData(newConfigs);
      }
      else {
        // Error
      }
    }
    setIsEditing(false);
  }

  // Deletes the given need from the list
  function DeleteConfig(config: NeedConfig) {
    localStorage.removeItem(CONFIG_KEY(config.name));
    localStorage.removeItem(ENTRIES_KEY(config.name));
    needIDs = needIDs.filter(value => value !== config.name);
    localStorage.setItem("needIDs", JSON.stringify(needIDs));
    Reload();
    setIsEditing(false);
  }

  function OpenEditModal(config: NeedConfig) {
    setEditingConfig(config);
    setIsEditing(true);
  }

  function OpenAddNewModal() {
    setEditingConfig(null);
    setIsEditing(true);
  }

  const HandleReorder = async (result: any) => {
    if (result.destination === null) return;
    const sourceIndex = configs.findIndex(
        (config) => config.uuid === result.draggableId
    );
    const destinationIndex = result.destination.index;

    // Shift arrays
    const newIdList = [...needIDs];
    const newConfigs = [...configs];
    if (sourceIndex < destinationIndex)
    {
      for (let i = sourceIndex; i < destinationIndex; i++)
      {
        newIdList[i] = needIDs[i + 1];
        newConfigs[i] = configs[i + 1];
      }
    }
    else if (sourceIndex > destinationIndex)
    {
      for (let i = sourceIndex; i > destinationIndex; i--)
      {
        newIdList[i] = needIDs[i - 1];
        newConfigs[i] = configs[i - 1];
      }
    }
    newIdList[destinationIndex] = needIDs[sourceIndex];
    newConfigs[destinationIndex] = configs[sourceIndex];

    // Set arrays
    needIDs = newIdList;
    localStorage.setItem("needIDs", JSON.stringify(needIDs));
    setNeedData(newConfigs);
  }

  return (
    <main>
      <StatList configs={configs} onEdit={OpenEditModal} onReorder={HandleReorder}/>
      <button type="button" onClick={OpenAddNewModal}>Add New</button>
      <button type="button" onClick={ResetAllData}>Reset All</button>
      {isEditing && <StatEditModal
        title={editingConfig == null ? "Add new stat" : "Edit stat"}
        config={editingConfig}
        onConfirm={SetConfig}
        onDelete={DeleteConfig}
        onCancel={() => setIsEditing(false)}/>}
    </main>
  );
}
