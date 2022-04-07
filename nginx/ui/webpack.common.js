const path = require("path");

module.exports = {
    entry: {
        powerpi: path.join(__dirname, "src", "powerpi.tsx"),
    },
    target: "web",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: "/node_modules/",
            },
            {
                test: /\.module\.scss$/,
                use: [
                    "style-loader",
                    "css-modules-typescript-loader",
                    {
                        loader: "css-loader",
                        options: { modules: true },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.scss$/,
                exclude: /\.module\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                type: "assest/resource",
                dependency: { not: ["url"] },
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                type: "assest/resource",
                dependency: { not: ["url"] },
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js",
    },
};
