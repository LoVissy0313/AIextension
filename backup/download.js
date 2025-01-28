// 创建页面监听器
document.addEventListener('DOMContentLoaded', () => {
    console.log('download.js loaded');
    const downloadButton = document.getElementById('downloadChat');
    if (downloadButton) {
        console.log('Download button found');
        downloadButton.addEventListener('click', downloadChat);
    } else {
        console.error('Download button not found');
    }
});

async function downloadChat() {
    console.log('Download chat triggered');
    try {
        // 从storage中获取保存的对话
        const result = await chrome.storage.local.get(null);
        console.log('Retrieved data:', result);

        if (!result.conversations || result.conversations.length === 0) {
            alert('没有找到保存的对话内容');
            return;
        }

        // 格式化对话内容
        const formattedContent = formatConversation(result);
        
        // 创建Blob对象
        const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `chat-${timestamp}.txt`;
        
        // 创建并触发下载
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // 清理URL对象
        URL.revokeObjectURL(url);
        
        console.log('Download successful');
        alert('对话已下载！');
    } catch (error) {
        console.error('Error in downloadChat:', error);
        alert(`下载失败：${error.message}`);
    }
}

// 格式化对话内容的辅助函数
function formatConversation(data) {
    const lines = [
        `对话保存时间: ${data.timestamp}`,
        `对话URL: ${data.url}`,
        '\n--- 对话内容 ---\n'
    ];
    
    data.conversations.forEach((message, index) => {
        lines.push(`[消息 ${index + 1}]\n${message}\n`);
    });
    
    return lines.join('\n');
}