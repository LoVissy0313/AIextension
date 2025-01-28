const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        popup: './src/popup/popup.js',
        preview: './src/preview/preview.js',
        content: './src/content.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
};