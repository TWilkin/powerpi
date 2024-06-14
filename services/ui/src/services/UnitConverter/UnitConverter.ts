import { keysOf } from "../../util";
import { gas, temperature, volume } from "./converters";
import { Converter, ConverterDefinition, UnitType, UnitValue } from "./types";

export default class UnitConverter {
    private static readonly converters: { [key in UnitType]: ConverterDefinition[] } = {
        gas,
        temperature,
        volume,
    };

    public convert(type: UnitType, value: UnitValue, desiredUnit: string): UnitValue {
        const convert = this.generateConversion(type, value.unit, desiredUnit);

        if (convert) {
            const convertedValue = convert(value.value);

            return { value: convertedValue, unit: desiredUnit };
        }

        return value;
    }

    private generateConversion(
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
