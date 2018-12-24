const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = () => {

    return merge(common, {
        mode: 'development',
        devtool: 'inline-source-map',
        output: {
            publicPath: '/',
            filename: '[name].js'
        },
        devServer: {
            host: '0.0.0.0',
            hot: true,
            overlay: true,
            historyApiFallback: true,
            publicPath: '/',
            contentBase: '../dist',
            disableHostCheck: true,
            proxy: {}
        },
        plugins: [new webpack.HotModuleReplacementPlugin()],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader', 'postcss-loader']
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader?importLoader=1&modules&localIdentName=[local]-[hash:base64:6]',
                        'sass-loader'
                    ]
                }
            ]
        }
    });
};
