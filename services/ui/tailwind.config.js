/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require("tailwindcss/defaultTheme");
const { default: flattenColorPalette } = require("tailwindcss/lib/util/flattenColorPalette");
const { parseColor } = require("tailwindcss/lib/util/color");

/** These are the semantic colours as defined in main.css which are swapped by the themes. */
const semanticColours = [
    "bg",
    "bg-primary",
    "bg-hover",
    "bg-active",
    "bg-selected",
    "bg-zebra",
    "bg-backdrop",
    "border",
    "outline",
    "outline-offset",
    "text",
    "placeholder",
    "warning",
    "critical",
    "on",
    "on-hover",
    "on-active",
    "off",
    "off-hover",
    "off-active",
    "unknown",
    "unknown-hover",
    "unknown-active",
];

/** @type {import("tailwindcss").Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colourComponents: ({ theme }) => {
                // adapted from: https://github.com/tailwindlabs/tailwindcss/discussions/11774
                const flatPalette = flattenColorPalette(theme("colors"));

                const entries = Object.entries(flatPalette)
                    .map(([key, value]) => [key, parseColor(value)?.color.join(" ")])
                    .filter(([, value]) => value);

                return Object.fromEntries(entries);
            },

            aria: {
                "current-page": 'current="page"',
            },

            borderWidth: {
                DEFAULT: defaultTheme.borderWidth[2],
            },

            colors: semanticColours.reduce(
                (dict, colour) => ({
                    ...dict,
                    [colour]: `rgb(var(--powerpi-colour-${colour}) / <alpha-value>)`,
                }),
                {},
            ),

            fontSize: {
                "2xs": "0.5rem",
            },

            lineHeight: {
                "2xs": "0.75rem",
            },

            spacing: {
                xs: defaultTheme.spacing[0.5],
                sm: defaultTheme.spacing[1],
                DEFAULT: defaultTheme.spacing[2],
            },
        },
    },
};
