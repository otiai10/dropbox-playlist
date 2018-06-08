var path = require("path");

module.exports = [
  // TypeScript
  {
    mode: "development",
    devtool: "inline-sourcemap",
    entry: {
      background: "./src/js/background.ts",
      content: "./src/js/content.ts",
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
    },
    resolve: {
      extensions: [".js",".ts",".tsx"]
    }
  }
];
