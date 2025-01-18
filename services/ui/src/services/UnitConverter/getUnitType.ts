import { UnitType } from "./types";

export default function getUnitType(type: string, unit: string): UnitType | undefined {
    switch (type) {
        case "current":
        case "gas":
        case "power":
        case "temperature":
        case "voltage":
        case "volume":
            return type as UnitType;
    }

    switch (unit) {
        case "mA":
        case "A":
            return "current";

        case "Wh":
        case "kWh":
        case "W":
        case "kW":
            return "power";

        case "°C":
        case "K":
        case "F":
            return "temperature";

        case "mV":
        case "V":
            return "voltage";

        case "m3":
        case "cf":
        case "hcf":
            return "volume";
    }

    return undefined;
}
