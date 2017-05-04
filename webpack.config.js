var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extractSass = new ExtractTextPlugin('../../dist/css/[name]_[hash].css');
var AssetsPlugin = require('assets-webpack-plugin');
var assetsPluginInstance = new AssetsPlugin(
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
        index: __dirname + '/public/js/entry.js'
    },
    output: {
        path: __dirname + '/public/dist/js',
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
        extractSass,
        new webpack.BannerPlugin('This file is created by hwh'),
        assetsPluginInstance
    ]
};