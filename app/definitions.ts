

export type ProgressData = {
    startTime: Date,
    frequency: Frequency,
}

export type NeedData = {
    config: NeedConfig;
    entries: Date[];
}

export type NeedConfig = {
    // uuid is used as a key for this config when rendering the list
    uuid: string;
    // name is displayed and used as the key for storing the data
    name: string;
    frequency: Frequency;
}

export type Frequency = {
    amount: number;
    unit: "minute" | "hour" | "day" | "week" | "month";
}