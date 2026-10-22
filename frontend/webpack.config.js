const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_env, argv = {}) => {
  const mode = argv.mode || "production";
  return {
    mode,
    entry: "./src/index.jsx",

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash:8].js",
      chunkFilename: "[name].[contenthash:8].chunk.js",
      assetModuleFilename: "assets/[name].[contenthash:8][ext]",
      publicPath: "/",
      clean: true
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              // Webpack mode must also control Babel, regardless of host BABEL_ENV/NODE_ENV.
              envName: mode,
              configFile: path.resolve(__dirname, "babel.config.json"),
              babelrc: false
            }
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },

    resolve: {
      extensions: [".js", ".jsx"]
    },

    optimization: {
      runtimeChunk: "single",
      moduleIds: "deterministic",
      chunkIds: "deterministic",
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          react: { test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, name: "react-vendor", priority: 30 },
          three: { test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/, name: "three-vendor", chunks: "async", priority: 40 }
        }
      }
    },

    plugins: [
      new HtmlWebpackPlugin({
        templateContent: () => require("fs").readFileSync(path.resolve(__dirname, "public/index.html"), "utf8").replace("</head>", `<script>${require("fs").readFileSync(path.resolve(__dirname, "src/ui/state/theme-bootstrap.js"), "utf8")}</script></head>`)
      })
    ],

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true
    }
  };
};
