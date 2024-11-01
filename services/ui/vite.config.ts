import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    optimizeDeps: { include: ["@powerpi/common-api"] },
    build: {
        commonjsOptions: {
            include: [/common-api/, /node_modules/],
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
});
