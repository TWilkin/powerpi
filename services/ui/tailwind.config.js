// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            aria: {
                "current-page": 'current="page"',
            },
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
