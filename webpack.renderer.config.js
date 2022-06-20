'use strict';

const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
}, {
  test: /\.tsx$/,
  use: [{ loader: 'ts-loader' }],
}, {
  test: /\.(png|woff|woff2|eot|ttf|svg|webp)$/,
  use: [{ loader: 'file-loader' }],
});

module.exports = {
  target: 'electron-renderer',
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
