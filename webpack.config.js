const ExtractTextPlugin = require('extract-text-webpack-plugin')
const DEV = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: {
    'dist/speedy-tree': './src/index.js',
    'example/bundle': './example/app.js',
  },
  output: {
    path: __dirname,
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
    ],
  },

  plugins: [new ExtractTextPlugin('dist/styles.css')],

  mode: DEV ? 'development' : 'production',
}
