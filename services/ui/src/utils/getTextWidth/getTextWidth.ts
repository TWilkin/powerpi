export default function getTextWidth(parent: HTMLElement, text: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
        return 0;
    }

    const fontWeight = getCSSStyle(parent, "font-weight");
    const fontFamily = getCSSStyle(parent, "font-family");
    const fontSize = getCSSStyle(parent, "font-size");
    context.font = `${fontWeight} ${fontSize} ${fontFamily}`;

    const metrics = context.measureText(text);
    return metrics.width;
}

function getCSSStyle(element: HTMLElement, prop: string) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}
