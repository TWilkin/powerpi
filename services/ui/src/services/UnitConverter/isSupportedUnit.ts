import keysOf from "../../utils/keysOf";

/** The list of supported units for translation and conversion. */
const supportedUnits = {
    percentage: "%",

    // current
    milliampere: "mA",
    ampere: "A",

    // electrical potential
    millivolt: "mV",
    volt: "V",

    // energy
    "watt hours": "Wh",
    "kilowatt hours": "kWh",
    joule: "J",
    kilojoule: "kJ",

    // power
    watt: "W",
    kilowatt: "kW",

    // temperature
    celsius: "°C",
    kelvin: "K",
    fahrenheit: "F",

    // volume
    "metres cubed": "m3",
    "cubic feet": "cf",
    "hundred cubic feet": "hcf",
    "thousand cubic feet": "Mcf",
} as const;

/** The labels of the supported units. */
export type SupportedUnitLabel = keyof typeof supportedUnits;

/** The symbols for the supported units. */
export type SupportedUnit = (typeof supportedUnits)[SupportedUnitLabel];

/** Check whether the supplied unit is supported (i.e. has a translation).
 * @return true when supported or false when not
 */
export function isSupportedUnit(unit: string): unit is SupportedUnit {
    return (Object.values(supportedUnits) as string[]).includes(unit);
}

/** Check whether the supplied unit label is supported (i.e. has a translation).
 * @return true when supported or false when not
 */
export function isSupportedUnitLabel(label: string): label is SupportedUnitLabel {
    return label in supportedUnits;
}

/** Find a unit's label.
 * @return The unit's label if it exists, otherwise undefined.
 */
export function getUnitLabel(unit: SupportedUnit): SupportedUnitLabel | undefined {
    return keysOf(supportedUnits).find((key) => supportedUnits[key] === unit);
}
