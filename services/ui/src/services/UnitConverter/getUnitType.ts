import { UnitType } from "./types";

export default function getUnitType(type: string, unit: string): UnitType | undefined {
    switch (type) {
        case "current":
        case "electricalPotential":
        case "energy":
        case "gas":
        case "power":
        case "temperature":
        case "volume":
            return type as UnitType;
    }

    switch (unit) {
        case "mA":
        case "A":
            return "current";

        case "mV":
        case "V":
            return "electricalPotential";

        case "Wh":
        case "kWh":
            return "energy";

        case "W":
        case "kW":
            return "power";

        case "°C":
        case "K":
        case "F":
            return "temperature";

        case "m3":
        case "cf":
        case "hcf":
            return "volume";
    }

    return undefined;
}
