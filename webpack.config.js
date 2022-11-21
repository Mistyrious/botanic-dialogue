const path = require('path');

module.exports = {
    entry: {
        botanicDialogue: './client/botanicDialogue.jsx',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            { 
                test: /\.css$/, 
                use: 'css-loader' 
            },
        ],
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]bundle.js',
    },
    // in webpack options
    externals: {
        serialport: 'serialport',
    }
};