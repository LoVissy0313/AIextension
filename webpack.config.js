
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        popup: './src/popup/popup.js',
        preview: './src/preview/preview.js',
        'preview-page': './src/preview/preview-page.js',
        content: './src/content.js',
        background: './src/background/background.js',
        download: './src/download/download.js',
        exportToMarkdown: './src/download/exportToMarkdown.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};