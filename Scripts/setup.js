// scripts/setup.js
const fs = require('fs').promises;
const path = require('path');

async function setupProject() {
    const directories = [
        'src/popup',
        'src/preview',
        'src/utils',
    ];

    console.log('开始创建项目结构...');

    try {
        // 创建目录
        for (const dir of directories) {
            await fs.mkdir(path.resolve(__dirname, '..', dir), { recursive: true });
            console.log(`✅ 创建目录: ${dir}`);
        }

        // 移动现有文件
        const filesToMove = [
            { from: 'popup.html', to: 'src/popup/popup.html' },
            { from: 'popup.js', to: 'src/popup/popup.js' },
            { from: 'preview.html', to: 'src/preview/preview.html' },
            { from: 'preview.js', to: 'src/preview/preview.js' },
            { from: 'parser.js', to: 'src/utils/parser.js' },
            { from: 'content.js', to: 'src/content.js' }
        ];

        for (const file of filesToMove) {
            try {
                const content = await fs.readFile(path.resolve(__dirname, '..', file.from), 'utf-8');
                await fs.writeFile(path.resolve(__dirname, '..', file.to), content);
                console.log(`✅ 移动文件: ${file.from} -> ${file.to}`);
            } catch (err) {
                console.log(`⚠️ 文件不存在或无法移动: ${file.from}`);
            }
        }

        // 创建 package.json（如果不存在）
        const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
        try {
            await fs.access(packageJsonPath);
        } catch {
            const packageJson = {
                name: "chrome-extension",
                version: "1.0.0",
                description: "Chrome Extension Project",
                scripts: {
                    "build": "webpack --mode production",
                    "dev": "webpack --mode development --watch"
                }
            };
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('✅ 创建 package.json');
        }

        // 创建 webpack.config.js（如果不存在）
        const webpackConfigPath = path.resolve(__dirname, '..', 'webpack.config.js');
        try {
            await fs.access(webpackConfigPath);
        } catch {
            const webpackConfig = `
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
            `;
            await fs.writeFile(webpackConfigPath, webpackConfig.trim());
            console.log('✅ 创建 webpack.config.js');
        }

        console.log('\n✨ 项目结构创建完成！');
        console.log('\n下一步：');
        console.log('1. 运行 npm install 安装依赖');
        console.log('2. 检查所有文件是否正确移动');
        console.log('3. 确认后可以删除原始文件');

    } catch (error) {
        console.error('❌ 错误:', error);
    }
}

setupProject();