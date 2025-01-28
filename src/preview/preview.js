// 初始化预览功能
const initPreview = () => {
    console.log('初始化预览功能');
    const previewButton = document.getElementById('previewChat');
    
    if (previewButton) {
        previewButton.addEventListener('click', openPreview);
    } else {
        console.error('未找到预览按钮');
    }
};

// 打开预览页面
async function openPreview() {
    console.log('开始处理预览...');
    
    try {
        const savedData = await getSavedData();
        
        if (!savedData.conversations?.length) {
            console.log('无对话内容');
            alert('没有找到保存的对话内容');
            return;
        }

        const previewKey = `preview_${Date.now()}`;
        await saveTemporaryData(previewKey, savedData);
        await openPreviewTab(previewKey);
        scheduleCleanup(previewKey);

        console.log('预览流程完成');

    } catch (error) {
        console.error('预览失败:', error.message);
        alert(`预览加载失败: ${error.message}`);
    }
}

// 获取已保存的数据
async function getSavedData() {
    try {
        // 获取最新保存的聊天记录
        const result = await chrome.storage.local.get(null);
        const chatKeys = Object.keys(result).filter(key => key.startsWith('chat_'));
        if (chatKeys.length === 0) {
            throw new Error('没有找到保存的对话');
        }
        
        // 获取最新的聊天记录
        const latestKey = chatKeys.sort().pop();
        return result[latestKey];
    } catch (error) {
        throw new Error(`获取存储数据失败: ${error.message}`);
    }
}

// 临时保存预览数据
async function saveTemporaryData(key, data) {
    try {
        // 保存为相同的数据结构
        const tempData = {
            [key]: {
                conversations: data.conversations,
                timestamp: data.timestamp,
                url: data.url
            }
        };
        await chrome.storage.local.set(tempData);
    } catch (error) {
        throw new Error(`保存临时数据失败: ${error.message}`);
    }
}

// 打开预览标签页
async function openPreviewTab(previewKey) {
    try {
        const previewUrl = `${chrome.runtime.getURL('preview/preview.html')}?key=${previewKey}`;
        await chrome.tabs.create({ url: previewUrl });
    } catch (error) {
        throw new Error(`打开预览标签页失败: ${error.message}`);
    }
}

// 设置清理定时器
function scheduleCleanup(previewKey) {
    setTimeout(async () => {
        try {
            await chrome.storage.local.remove(previewKey);
            console.log('临时数据已清理');
        } catch (error) {
            console.error('清理临时数据失败');
        }
    }, 5 * 60 * 1000);
}

// 初始化
document.addEventListener('DOMContentLoaded', initPreview);

// 错误处理
window.addEventListener('error', (event) => {
    console.error('错误:', event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise错误:', event.reason);
});