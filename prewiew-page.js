// 初始化函数
async function initPreviewPage() {
    console.log('初始化预览页面');
    const contentElement = document.getElementById('previewContent');
    
    if (!contentElement) {
        console.error('未找到预览内容元素');
        return;
    }
    
    try {
        const storageKey = getStorageKeyFromUrl();
        if (!storageKey) {
            throw new Error('未找到对话标识符');
        }

        const data = await fetchPreviewData(storageKey);
        renderConversations(contentElement, data);
        console.log('渲染完成');
        
    } catch (error) {
        console.error('初始化失败:', error.message);
        renderError(contentElement, error.message);
    }
}

// 从URL获取存储键
function getStorageKeyFromUrl() {
    try {
        return new URLSearchParams(window.location.search).get('key');
    } catch (error) {
        throw new Error('URL参数解析失败');
    }
}

// 获取预览数据
async function fetchPreviewData(key) {
    try {
        const result = await chrome.storage.local.get(key);
        if (!result || !result[key]) {
            throw new Error('未找到存储的数据');
        }
        if (!result[key].conversations || !Array.isArray(result[key].conversations)) {
            throw new Error('数据格式不正确');
        }
        return result[key];
    } catch (error) {
        throw new Error(`获取预览数据失败: ${error.message}`);
    }
}

// 渲染整个对话内容
function renderConversations(element, data) {
    const messagesHtml = data.conversations.map(message => renderMessage(message)).join('\n');
    element.innerHTML = `
        <div class="conversations-container">
            ${messagesHtml}
        </div>
    `;
}

// 渲染单条消息
function renderMessage(message) {
    const blocks = message.blocks.map(block => {
        switch (block.type) {
            case 'code':
                return `
                    <div class="code-block">
                        <div class="code-header">${block.language}</div>
                        <pre><code class="language-${block.language}">${escapeHtml(block.content)}</code></pre>
                    </div>
                `;
            case 'formatted-text':
                return `<p>${block.content}</p>`;
            case 'text':
                return `<p>${escapeHtml(block.content)}</p>`;
            case 'ul':
            case 'ol':
                const items = block.items
                    .map(item => `<li>${item.content}</li>`)
                    .join('');
                return `<${block.type}>${items}</${block.type}>`;
            default:
                console.warn(`未知的块类型: ${block.type}`);
                return '';
        }
    }).join('\n');

    return `
        <div class="message ${message.role}">
            <div class="message-header">
                <span class="role-indicator">
                    ${message.role === 'assistant' ? 'AI' : '用户'}
                </span>
            </div>
            <div class="message-content">
                ${blocks}
            </div>
        </div>
    `;
}

// 渲染错误信息
function renderError(element, message) {
    element.innerHTML = `
        <div class="error-message">
            <p>❌ ${message}</p>
        </div>
    `;
}

// HTML转义函数
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return '';
    }
    
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => escapeMap[char]);
}

// 监听器
document.addEventListener('DOMContentLoaded', () => {
    initPreviewPage();
});