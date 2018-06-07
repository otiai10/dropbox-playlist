var path = require("path");

module.exports = [
  {
    mode: "development",
    devtool: "inline-sourcemap",
    entry: {
      background: "./src/background.ts",
      content: "./src/content.ts",
    },
    output: {
      path: path.resolve(__dirname, "dest/js"),
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loaders: ["ts-loader"]
        }
      ]
    }
  }
];
