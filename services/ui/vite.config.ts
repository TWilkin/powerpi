import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    optimizeDeps: { include: ["@powerpi/common-api"] },
    build: {
        commonjsOptions: {
            include: [/common-api/, /node_modules/],
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    core: [
                        "@tanstack/react-query",
                        "react",
                        "react-cookie",
                        "react-dom",
                        "react-i18next",
                        "react-router",
                        "react-router-dom",
                    ],
                    icons: [
                        "@fortawesome/fontawesome-svg-core",
                        "@fortawesome/free-brands-svg-icons",
                        "@fortawesome/free-solid-svg-icons",
                        "@fortawesome/react-fontawesome",
                        "./src/components/BatteryIcon",
                        "./src/components/DeviceIcon",
                        "./src/components/Icon",
                        "./src/components/Loader",
                        "./src/components/Logo",
                        "./src/components/SensorIcon",
                    ],
                },
            },
        },
    },
    server: {
        port: 8080,
        open: true,
        proxy: {
            "/api": {
                changeOrigin: true,
                target: "http://localhost:3000",
            },
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./test-setup.ts",
    },
});
