const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
    entry: {
        app: path.join(__dirname, "src", "app.tsx"),
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
                test: /\.s[ac]ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.(ttf|eot|svg|gif|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "file-loader",
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    externals: [
        nodeExternals({
            modulesFromFile: true,
        }),
    ],
};
