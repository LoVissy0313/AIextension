// parser.js
export function parseContent(element) {
    // 初始化返回对象
    const content = {
        type: 'message',
        blocks: []
    };

    // 判断消息类型
    if (element.parentElement.classList.contains('Message_leftSideMessageBubble__VPdk6')) {
        content.role = 'assistant';
    } else {
        content.role = 'user';
    }

    // 获取Markdown容器
    const markdownContainer = element.querySelector('.Markdown_markdownContainer__Tz3HQ');
    if (!markdownContainer) {
        console.log('未找到Markdown容器');
        return content;
    }

    // 遍历并解析每个子元素
    for (const child of markdownContainer.children) {
        if (child.tagName === 'P') {
            // 解析段落（可能包含格式化文本）
            content.blocks.push(parseTextContent(child));
        } 
        else if (child.classList.contains('MarkdownCodeBlock_container__nRn2j')) {
            // 解析代码块
            content.blocks.push(parseCodeBlock(child));
        }
        else if (child.tagName === 'UL' || child.tagName === 'OL') {
            // 解析列表
            content.blocks.push(parseList(child));
        }
    }

    return content;
}

function parseTextContent(element) {
    // 检查是否包含格式化标签
    if (element.querySelector('strong, em, code, a')) {
        return {
            type: 'formatted-text',
            content: element.innerHTML,
            plainText: element.textContent // 保存纯文本版本
        };
    }
    return {
        type: 'text',
        content: element.textContent
    };
}

function parseCodeBlock(element) {
    const headerElement = element.querySelector('.MarkdownCodeBlock_languageName__4_BF8');
    const codeElement = element.querySelector('code');
    
    return {
        type: 'code',
        language: headerElement?.textContent || 'plaintext',
        content: codeElement?.textContent || '',
        originalHTML: element.innerHTML // 可选：保存原始HTML
    };
}

function parseList(element) {
    return {
        type: element.tagName.toLowerCase(), // 'ul' 或 'ol'
        items: Array.from(element.children).map(li => ({
            type: 'list-item',
            content: li.innerHTML
        }))
    };
}