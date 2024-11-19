import Resources from "../../@types/resources";

/** A numeric value with it's associated unit. */
export type UnitValue = {
    /** The value in the specified unit. */
    value: number;

    /** The measurement unit for the specified value. */
    unit: string;
};

/** The unit types that support conversion. */
export type UnitType = "gas" | "power" | "temperature" | "volume";

/** A converted function. */
export type Converter = (value: number) => number;

/** The definition of a unit and its possible conversions. */
export type ConverterDefinition = {
    /** The shorthand unit name, e.g. kWh. */
    unit: string;

    /** The translation key for the unit. */
    key: keyof Resources["translation"]["common"]["units"]["labels"];

    /** The list of supported conversions. */
    convert: {
        [key in string]?: Converter;
    };
};
