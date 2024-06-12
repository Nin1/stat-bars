import { useState } from "react";
import { Frequency, NeedConfig, NeedConfigDef } from "../definitions";


type StatEditProps = {
    config: NeedConfig | null,
    title: string,
    onConfirm: (oldConfig: NeedConfig | null, configDef: NeedConfigDef) => void,
    onDelete: (config: NeedConfig) => void,
    onCancel: Function
}

export default function StatEditModal(props: StatEditProps) {
    const defaultName = props.config != null ? props.config.name : "";
    const defaultFreqAmount = props.config != null ? props.config.frequency.amount : 7;
    const defaultFreqUnit = props.config != null ? props.config.frequency.unit : "day";

    let [name, setName] = useState(defaultName);
    let [freqAmount, setFreqAmount] = useState(defaultFreqAmount);
    let [freqUnit, setFreqUnit] = useState(defaultFreqUnit);

    function HandleNameFieldChange(event: { target: { value: SetStateAction<string>; }; }) {
        setName(event.target.value);
    }

    function HandleFreqAmountFieldChange(event: { target: { value: SetStateAction<string>; }; }) {
        setFreqAmount(event.target.value);
    }

    function HandleFreqUnitFieldChange(event: { target: { value: SetStateAction<string>; }; }) {
        setFreqUnit(event.target.value);
    }

    function OnConfirm() {
        const freq : Frequency = { unit: freqUnit, amount: freqAmount};
        const newConfig : NeedConfigDef = { name: name, frequency: freq };
        props.onConfirm(props.config, newConfig);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm">
            <h1>{props.title}</h1>
            <form>
                <label htmlFor="name">Name: </label>
                <input type="text" id="name" value={name} onChange={HandleNameFieldChange}/><br/>
                <label htmlFor="freqAmount">Frequency: </label>
                <input type="text" id="freqAmount" name="freqAmount" value={freqAmount} onChange = {HandleFreqAmountFieldChange}/>
                <select id="units" name="units" value={freqUnit} onChange={HandleFreqUnitFieldChange}>
                    <option value="minute">minutes</option>
                    <option value="hour">hours</option>
                    <option value="day">days</option>
                    <option value="week">weeks</option>
                    <option value="month">months</option>
                </select>
            </form>
            <div className="flex flex-row gap-5">
                <button onClick={() => OnConfirm()}>Confirm</button>
                <button onClick={() => props.onCancel()}>Cancel</button>
                {props.config != null && <button onClick={() => props.onDelete(props.config!)}>Delete</button>}
            </div>
        </div>
    );
}