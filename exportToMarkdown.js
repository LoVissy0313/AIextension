function exportToMarkdown(conversations) {
    return conversations.map(message => {
        const blocks = message.blocks.map(block => {
            switch (block.type) {
                case 'code':
                    return `\`\`\`${block.language}\n${block.content}\n\`\`\``;
                case 'formatted-text':
                    // 将HTML转换为Markdown格式
                    return convertHtmlToMarkdown(block.content);
                case 'text':
                    return block.content;
                case 'ul':
                    return block.items
                        .map(item => `- ${convertHtmlToMarkdown(item.content)}`)
                        .join('\n');
                case 'ol':
                    return block.items
                        .map((item, index) => `${index + 1}. ${convertHtmlToMarkdown(item.content)}`)
                        .join('\n');
                default:
                    return '';
            }
        }).join('\n\n');

        return `### ${message.role === 'assistant' ? 'AI' : '用户'}\n\n${blocks}`;
    }).join('\n\n---\n\n');
}

// HTML 转 Markdown 的辅助函数
function convertHtmlToMarkdown(html) {
    // 这是一个简单的实现，可以根据需要扩展
    return html
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<code>(.*?)<\/code>/g, '`$1`')
        .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
        .replace(/<br\s*\/?>/g, '\n');
}