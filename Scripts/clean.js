// scripts/cleanup.js
const fs = require('fs').promises;
const path = require('path');

async function cleanup() {
    // 需要保留的文件和目录
    const keepFiles = [
        'src',
        'scripts',
        'dist',
        'node_modules',
        'manifest.json',
        'package.json',
        'package-lock.json',
        'webpack.config.js',
        '.git',
        '.gitignore',
        'README.md'
    ];

    try {
        console.log('开始清理旧文件...');
        
        // 获取当前目录下的所有文件和文件夹
        const files = await fs.readdir(path.resolve(__dirname, '..'));
        
        // 创建备份目录
        const backupDir = path.resolve(__dirname, '../backup');
        await fs.mkdir(backupDir, { recursive: true });
        console.log('✅ 创建备份目录: backup/');

        // 备份并删除不需要保留的文件
        for (const file of files) {
            if (!keepFiles.includes(file)) {
                const filePath = path.resolve(__dirname, '..', file);
                const backupPath = path.resolve(backupDir, file);
                const stat = await fs.stat(filePath);

                try {
                    if (stat.isDirectory()) {
                        console.log(`备份目录: ${file} -> backup/${file}`);
                        // 对于目录，使用复制然后删除的方式
                        await fs.cp(filePath, backupPath, { recursive: true });
                        await fs.rm(filePath, { recursive: true });
                    } else {
                        console.log(`备份文件: ${file} -> backup/${file}`);
                        await fs.copyFile(filePath, backupPath);
                        await fs.unlink(filePath);
                    }
                } catch (err) {
                    console.error(`❌ 处理文件失败: ${file}`, err);
                }
            }
        }
        
        console.log('\n✨ 清理完成！');
        console.log('所有旧文件已备份到 backup/ 目录');
        console.log('\n如果确认新的项目结构正常工作，可以手动删除 backup 目录');

    } catch (error) {
        console.error('❌ 清理过程中发生错误:', error);
    }
}

// 执行前确认
console.log('⚠️  此操作将移动所有不在保留列表中的文件到 backup 目录');
console.log('受影响的文件:');
console.log('- background.js');
console.log('- content.js');
console.log('- download.js');
console.log('- exportToMarkdown.js');
console.log('- mycss.css');
console.log('- parser.js');
console.log('- popup.html');
console.log('- popup.js');
console.log('- preview.html');
console.log('- preview.js');
console.log('- prewiew-page.js');
console.log('\n如果确认要继续，请按回车键...');

process.stdin.once('data', () => {
    cleanup();
});