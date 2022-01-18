export interface ISensor {
    name: string;
    type: string;
    display_name?: string;
    location: string;
    visible?: boolean;
}

export class Sensor implements ISensor {
    name: string;
    type: string;
    location: string;
    display_name?: string;

    constructor(name?: string, type?: string, location?: string, displayName?: string) {
        this.name = name ?? "unknown";
        this.type = type ?? "unknown";
        this.location = location ?? "unknown";
        this.display_name = displayName;
    }

    get displayName() {
        return this.display_name ?? this.name;
    }
}
