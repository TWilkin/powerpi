import { SupportedUnit, SupportedUnitLabel } from "./isSupportedUnit";

/** A numeric value with it's associated unit. */
export type UnitValue = {
    /** The value in the specified unit. */
    value: number;

    /** The measurement unit for the specified value. */
    unit: string;
};

/** The unit types that support conversion. */
export type UnitType =
    | "current"
    | "electricalPotential"
    | "gas"
    | "power"
    | "temperature"
    | "volume";

/** A possible conversion. */
export type Conversion = {
    /** The shorthand unit name, e.g. kWh. */
    unit: SupportedUnit;

    /** The translation key for the unit. */
    key: SupportedUnitLabel;
};

/** A converted function. */
export type Converter = (value: number) => number;

/** The definition of a unit and its possible conversions. */
export type ConverterDefinition = {
    /** The list of supported conversions. */
    convert: {
        [key in SupportedUnit]?: Converter;
    };
} & Conversion;
