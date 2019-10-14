var path = require('path');

module.exports = {
  entry: "./webpack/entry.js",
  output: {
    path: path.resolve(__dirname, "assets/js"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        query: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react"
          ]
        }
      }
    ]
  }
};