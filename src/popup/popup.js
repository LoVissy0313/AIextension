// 添加初始化检查
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup initialized');
    const saveButton = document.getElementById('saveChat');
    if (saveButton) {
        console.log('Save button found');
        saveButton.addEventListener('click', saveChat);
    } else {
        console.error('Save button not found');
    }
});

async function saveChat() {
    console.log('Save chat triggered');
    try {
        // 查询当前标签页
        console.log('Querying active tab...');
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const currentTab = tabs[0];
        console.log('Current tab:', currentTab);
        
        if (!currentTab) {
            console.error('No active tab found');
            alert('未找到活动标签页');
            return;
        }

        // 发送消息到content script
        console.log('Sending message to content script...');
        const response = await chrome.tabs.sendMessage(currentTab.id, {
            action: "getChat"
        });
        console.log('Received response:', response);
        
        if (!response) {
            console.error('No response received');
            alert('未收到响应，请确认页面已完全加载');
            return;
        }

        if (!response.conversation) {
            console.error('No conversation data in response');
            alert('未找到对话内容');
            return;
        }
        
        // 保存到存储
        const storageKey = `chat_${Date.now()}`;
        const dataToSave = {
            [storageKey]: {
                conversations: response.conversation.conversations,
                timestamp: new Date().toISOString(),
                url: currentTab.url
            }
        };
        console.log('Data to save:', dataToSave);
        
        await chrome.storage.local.set(dataToSave);
        console.log('Save successful');
        alert('对话已保存！');
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        alert(`保存失败：${error.message}`);
    }
}