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
                    icons: [
                        "@fortawesome/fontawesome-svg-core",
                        "@fortawesome/free-brands-svg-icons",
                        "@fortawesome/free-solid-svg-icons",
                        "@fortawesome/react-fontawesome",
                        "./src/components/Icon",
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
