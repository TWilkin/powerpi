export type UnitValue = {
    value: number;
    unit: string;
};

export type UnitType = "temperature";

export type Converter = (value: number) => number;

export type ConverterDefinition = {
    unit: string;
    convert: {
        [key in string]?: Converter;
    };
};
