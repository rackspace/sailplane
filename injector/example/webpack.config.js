const path = require('path');
const slsw = require('serverless-webpack');

const entries = {};

Object.keys(slsw.lib.entries).forEach(key => (
  entries[key] = ['./source-map-install.js', slsw.lib.entries[key]]
));

module.exports = {
    entry: entries,
    devtool: 'source-map',
    resolve: {
        extensions: [
            '.js',
            '.json',
            '.ts'
        ]
    },
    target: 'node',
    mode: 'development',
    module: {
        rules: [
            {
                test: /^(?!.*\.spec\.ts$).*\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ],
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
    }
};
