import chroma from "chroma-js";

export default function generateGradient(min: number, max: number, intervals: number) {
    const range = max - min;
    const increment = range / intervals;
    const percentageIncrement = 100 / intervals;

    const colours = [...generateColours(min, max, increment, percentageIncrement)];

    return `linear-gradient(to right, ${colours.join()})`;
}

function* generateColours(
    min: number,
    max: number,
    increment: number,
    percentageIncrement: number,
) {
    for (
        let kelvin = min, percent = 0;
        kelvin <= max;
        kelvin += increment, percent += percentageIncrement
    ) {
        const colour = chroma.temperature(kelvin);
        const [red, green, blue] = colour.rgb();

        yield `rgb(${red}, ${green}, ${blue}) ${percent}%`;
    }
}
