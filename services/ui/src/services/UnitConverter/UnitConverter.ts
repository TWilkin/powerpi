import _ from "underscore";
import keysOf from "../../utils/keysOf";
import * as converterDefinitions from "./converters";
import { Conversion, Converter, ConverterDefinition, UnitType, UnitValue } from "./types";

/** Class representing the conversion from one numeric unit to another. */
export default class UnitConverter {
    private static readonly converters: { [key in UnitType]: ConverterDefinition[] } =
        converterDefinitions;

    private constructor() {}

    /** Retrieve the list of supports conversions for the specified unit.
     * @param type The unit to list the conversions for.
     * @returns The list of supported conversions for the specified unit.
     */
    public static getConverters(type: UnitType): Conversion[] {
        return _(this.converters[type])
            .unique((unit) => unit.unit)
            .map(({ unit, key }) => ({ unit, key }));
    }

    /** Convert the specified value from one unit to another.
     * @param type The unit to convert from.
     * @param value The value to convert.
     * @param desiredUnit The unit to convert to.
     * @returns The converted value.
     */
    public static convert(type: UnitType, value: UnitValue, desiredUnit: string): UnitValue {
        const convert = this.generateConversion(type, value.unit, desiredUnit);

        if (convert) {
            const convertedValue = convert(value.value);

            return { value: convertedValue, unit: desiredUnit };
        }

        return value;
    }

    /** Find a conversion through the set of possible conversions from the specified unit to
     * the desired unit.
     * @param type The unit to convert from.
     * @param currentUnit The unit we're currently converting from in the chain.
     * @param desiredUnit The unit to convert to.
     * @param consumed The list of units we've used in our conversions, to avoid duplicates.
     * @returns The converter from original unit to the currentUnit.
     */
    public static generateConversion(
        type: UnitType,
        currentUnit: string,
        desiredUnit: string,
        consumed: string[] = [],
    ): Converter | undefined {
        // we found the path for the conversion
        if (currentUnit === desiredUnit) {
            return (value) => value;
        }

        // find the converters for the current unit
        const converter = UnitConverter.converters[type].find(
            (converter) => converter.unit === currentUnit,
        );

        if (converter != null) {
            // we want the conversions that we haven't already tried
            const conversions = keysOf(converter.convert).filter(
                (converter) => !consumed.includes(converter),
            );

            for (const option of conversions) {
                // this is the converter for currentUnit -> option
                const currentConvert = converter.convert[option];
                if (!currentConvert) {
                    continue;
                }

                // this is the converter for option -> desiredUnit
                const convert = this.generateConversion(type, option, desiredUnit, [
                    ...consumed,
                    currentUnit,
                ]);

                if (convert != null) {
                    return (value) => {
                        const currentToIntermediate = currentConvert(value);

                        const intermediateToTarget = convert(currentToIntermediate);

                        return intermediateToTarget;
                    };
                }
            }
        }

        return undefined;
    }
}
