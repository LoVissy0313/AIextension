// scripts/setup.js
const fs = require('fs').promises;
const path = require('path');

async function setupProject() {
    // 定义目标目录结构
    const directories = [
        'src/popup',
        'src/preview',
        'src/utils',
        'src/background',
        'src/styles',    // CSS文件目录
        'src/download',  // download相关文件
    ];

    console.log('开始创建项目结构...');

    try {
        // 创建目录
        for (const dir of directories) {
            await fs.mkdir(path.resolve(__dirname, '..', dir), { recursive: true });
            console.log(`✅ 创建目录: ${dir}`);
        }

        // 定义文件迁移映射
        const filesToMove = [
            // background
            { from: 'background.js', to: 'src/background/background.js' },
            
            // content scripts
            { from: 'content.js', to: 'src/content.js' },
            
            // download 相关
            { from: 'download.js', to: 'src/download/download.js' },
            { from: 'exportToMarkdown.js', to: 'src/download/exportToMarkdown.js' },
            
            // CSS
            { from: 'mycss.css', to: 'src/styles/mycss.css' },
            
            // parser
            { from: 'parser.js', to: 'src/utils/parser.js' },
            
            // popup
            { from: 'popup.html', to: 'src/popup/popup.html' },
            { from: 'popup.js', to: 'src/popup/popup.js' },
            
            // preview
            { from: 'preview.html', to: 'src/preview/preview.html' },
            { from: 'preview.js', to: 'src/preview/preview.js' },
            { from: 'prewiew-page.js', to: 'src/preview/preview-page.js' }
        ];

        // 移动文件
        for (const file of filesToMove) {
            try {
                const content = await fs.readFile(path.resolve(__dirname, '..', file.from), 'utf-8');
                await fs.writeFile(path.resolve(__dirname, '..', file.to), content);
                console.log(`✅ 移动文件: ${file.from} -> ${file.to}`);
            } catch (err) {
                console.log(`⚠️ 文件不存在或无法移动: ${file.from}`, err);
            }
        }

        // 更新 webpack.config.js
        const webpackConfig = `
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
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};`;
        
        await fs.writeFile(path.resolve(__dirname, '..', 'webpack.config.js'), webpackConfig);
        console.log('✅ 更新 webpack.config.js');

        console.log('\n✨ 项目结构创建完成！');
        console.log('\n下一步：');
        console.log('1. 检查所有文件是否正确移动');
        console.log('2. 更新 manifest.json 中的文件路径');
        console.log('3. 运行 npm install 安装依赖');
        console.log('4. 运行 webpack 构建项目');

    } catch (error) {
        console.error('❌ 错误:', error);
    }
}

setupProject();