const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getAbsolutePath = p => path.resolve(__dirname, p);

module.exports = {
    entry: {
        app: getAbsolutePath('../src/index.js')
    },
    output: {
        hashDigestLength: 8,
        filename: '[name].[chunkhash:8].js',
        path: getAbsolutePath('../dist')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            '@': getAbsolutePath('../src'),
            lodash: 'lodash-es'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: getAbsolutePath('../src/index.html'),
            filename: getAbsolutePath('../dist/index.html')
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
        ]
    }
};
