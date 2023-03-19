declare module "*.module.scss" {
    const content: Record<string, string>;
    export default content;
}

declare module "color-temperature" {
    function colorTemperature2rgb(kelvin: number): { red: number; green: number; blue: number };
}
