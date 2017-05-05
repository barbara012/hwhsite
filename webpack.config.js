const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const extractSass = new ExtractTextPlugin('../../dist/css/[name]_[hash].css')
const AssetsPlugin = require('assets-webpack-plugin')
const CleanDir = require('clean-webpack-plugin')
const assetsPluginInstance = new AssetsPlugin(
    {
        filename: 'asset.json',
        includeManifest: true,
        prettyPrint: true,
        metadata: {version: 123}
    }
);
//noinspection JSUnresolvedVariable
module.exports = {
    devtool: 'eval-source-map',
    entry: {
        index: __dirname + '/static/entry.js'
    },
    output: {
        path: __dirname + '/static/dist/js',
        filename: '[name]_[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new CleanDir([__dirname + '/static/dist']),
        extractSass,
        new webpack.BannerPlugin('This file is created by hwh'),
        assetsPluginInstance
    ]
};