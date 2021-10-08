const { merge } = require("webpack-merge");
const path = require("path");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: [path.join(__dirname, "dist"), path.join(__dirname, "public")],
    port: 8080,
    proxy: {
      "/api": {
        changeOrigin: true,
        target: "http://localhost:3000"
      }
    },
    historyApiFallback: true
  }
});
