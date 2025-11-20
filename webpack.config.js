const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'none',
    target: 'node',
    entry: './src/main.ts',
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new OptimizeCssAssetsPlugin(),
        new CleanWebpackPlugin(),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        noParse: /polyfills-.*\.js/,
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    }
};
