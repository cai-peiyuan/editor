var webpack = require('webpack');
var path = require('path');
var rules = require('./webpack.rules');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');
var artifacts = require("../test/artifacts");

var OUTPATH = artifacts.pathSync("/build");

module.exports = {
  entry: {
    app: './src/index.jsx',
  },
  output: {
    path: OUTPATH,
    filename: '[name].[contenthash].js',
    chunkFilename: '[contenthash].js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: rules
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new HtmlWebpackPlugin({
      template: './src/template.html',
      title: 'MapAbc 矢量地图设计器'
    }),
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/manifest.json',
          to: 'manifest.json'
        }
      ]
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      defaultSizes: 'gzip',
      openAnalyzer: false,
      generateStatsFile: true,
      reportFilename: 'bundle-stats.html',
      statsFilename: 'bundle-stats.json',
    })
  ]
};
