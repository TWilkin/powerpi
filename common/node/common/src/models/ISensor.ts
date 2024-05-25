import { ISensorConfig } from "./IConfigFile";

export interface ISensor extends ISensorConfig {
    displayName: string;
}

export class Sensor implements ISensor {
    name: string;
    type: string;
    location: string;
    entity?: string;
    action?: string;
    visible?: boolean;
    display_name?: string;

    constructor(
        name?: string,
        type?: string,
        location?: string,
        displayName?: string,
        entity?: string,
        action?: string,
    ) {
        this.name = name ?? "unknown";
        this.type = type ?? "unknown";
        this.location = location ?? "unknown";
        this.entity = entity;
        this.action = action;
        this.display_name = displayName;
    }

    get displayName() {
        return this.display_name ?? this.name;
    }
}
