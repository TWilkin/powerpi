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
        },
    },
};
