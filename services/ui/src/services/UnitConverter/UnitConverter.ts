import temperature from "./temperature";

export type UnitValue = {
    value: number;
    unit: string;
};

type Converter = (value: number) => number;

export default class UnitConverter {
    private readonly converters = {
        ...temperature,
    };

    public convert(value: number, currentUnit: string, desiredUnit: string): UnitValue {
        const convert = this.generateConversion(currentUnit, desiredUnit);

        if (convert) {
            const convertedValue = convert(value);

            return { value: convertedValue, unit: desiredUnit };
        }

        return { value, unit: currentUnit };
    }

    private generateConversion(
        currentUnit: string,
        desiredUnit: string,
        consumed: string[] = [],
    ): Converter | undefined {
        // we found the path for the conversion
        if (currentUnit === desiredUnit) {
            return (value) => value;
        }

        // find the converters for the current unit
        const converter = this.converters.find((converter) => converter.unit === currentUnit);

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
                const convert = this.generateConversion(option, desiredUnit, [
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

function keysOf<TObjectType extends object>(obj: TObjectType): (keyof TObjectType)[] {
    return Object.keys(obj) as (keyof TObjectType)[];
}
