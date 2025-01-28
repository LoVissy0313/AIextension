// scripts/update-paths.js
const fs = require('fs').promises;
const path = require('path');

// 定义路径映射关系
const pathMapping = {
    // 导入语句的路径映射
    importPaths: {
        './parser.js': '../utils/parser.js',
        '../parser.js': '../utils/parser.js',
        './popup.js': '../popup/popup.js',
        './preview.js': '../preview/preview.js',
        './download.js': '../download/download.js',
        './exportToMarkdown.js': '../download/exportToMarkdown.js',
        './mycss.css': '../styles/mycss.css',
        '../mycss.css': '../styles/mycss.css',
    },
    // chrome.runtime.getURL 的路径映射
    runtimePaths: {
        'preview.html': 'preview/preview.html',
        'preview.js': 'preview/preview.js',
        'preview-page.js': 'preview/preview-page.js',
        'popup.html': 'popup/popup.html',
        'mycss.css': 'styles/mycss.css',
    },
    // HTML文件中的路径映射
    htmlPaths: {
        'src="./popup.js"': 'src="../popup/popup.js"',
        'src="./preview.js"': 'src="../preview/preview.js"',
        'href="./mycss.css"': 'href="../styles/mycss.css"',
        'src="./preview-page.js"': 'src="../preview/preview-page.js"',
    }
};

async function updateFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        let updated = false;

        // 更新导入语句
        for (const [oldPath, newPath] of Object.entries(pathMapping.importPaths)) {
            const importRegex = new RegExp(`(import.*from\\s+['"])${oldPath}(['"])`, 'g');
            if (importRegex.test(content)) {
                content = content.replace(importRegex, `$1${newPath}$2`);
                updated = true;
                console.log(`✅ ${filePath}: 更新导入路径 ${oldPath} -> ${newPath}`);
            }
        }

        // 更新 chrome.runtime.getURL 调用
        for (const [oldPath, newPath] of Object.entries(pathMapping.runtimePaths)) {
            const runtimeRegex = new RegExp(`chrome\\.runtime\\.getURL\\(['"]${oldPath}['"]\\)`, 'g');
            if (runtimeRegex.test(content)) {
                content = content.replace(runtimeRegex, `chrome.runtime.getURL('${newPath}')`);
                updated = true;
                console.log(`✅ ${filePath}: 更新运行时路径 ${oldPath} -> ${newPath}`);
            }
        }

        // 更新 HTML 文件中的路径
        if (filePath.endsWith('.html')) {
            for (const [oldPath, newPath] of Object.entries(pathMapping.htmlPaths)) {
                if (content.includes(oldPath)) {
                    content = content.replace(new RegExp(oldPath, 'g'), newPath);
                    updated = true;
                    console.log(`✅ ${filePath}: 更新HTML路径 ${oldPath} -> ${newPath}`);
                }
            }
        }

        if (updated) {
            await fs.writeFile(filePath, content);
            console.log(`💾 保存更新: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ 处理文件失败: ${filePath}`, error);
    }
}

async function updateManifest() {
    try {
        const manifestPath = path.resolve(__dirname, '../manifest.json');
        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

        // 更新 content_scripts 路径
        if (manifest.content_scripts) {
            manifest.content_scripts.forEach(script => {
                if (script.css) {
                    script.css = script.css.map(css => css.replace('mycss.css', 'styles/mycss.css'));
                }
                if (script.js) {
                    script.js = script.js.map(js => js.replace('content.js', 'content.js'));
                }
            });
        }

        // 更新 web_accessible_resources 路径
        if (manifest.web_accessible_resources) {
            manifest.web_accessible_resources.forEach(resource => {
                if (resource.resources) {
                    resource.resources = resource.resources.map(res => {
                        if (res.includes('preview')) return `preview/${res}`;
                        if (res.includes('mycss')) return `styles/${res}`;
                        return res;
                    });
                }
            });
        }

        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('✅ 更新 manifest.json');
    } catch (error) {
        console.error('❌ 更新 manifest.json 失败:', error);
    }
}

async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.isFile() && 
                  (fullPath.endsWith('.js') || 
                   fullPath.endsWith('.html') || 
                   fullPath.endsWith('.css'))) {
            await updateFile(fullPath);
        }
    }
}

async function main() {
    console.log('🚀 开始更新文件路径...');
    
    try {
        // 更新 src 目录下的所有文件
        await processDirectory(path.resolve(__dirname, '../src'));
        
        // 更新 manifest.json
        await updateManifest();
        
        console.log('\n✨ 路径更新完成！');
        console.log('\n建议：');
        console.log('1. 检查 git diff 确认更改是否正确');
        console.log('2. 运行测试确保功能正常');
        console.log('3. 如有需要，手动调整未被自动更新的路径');
    } catch (error) {
        console.error('❌ 更新过程中发生错误:', error);
    }
}

// 执行脚本
console.log('⚠️ 此操作将更新项目中的文件路径');
console.log('建议在运行此脚本前提交或备份当前更改');
console.log('\n如果确认要继续，请按回车键...');

process.stdin.once('data', () => {
    main();
});