// Chrome插件内容脚本 - 处理页面内容的查找和替换
class ChromeReplaceContent {
    constructor() {
        this.isInitialized = false;
        this.highlightClass = 'chrome-replace-highlight';
        this.currentHighlights = [];
        this.replacementHistory = [];
        this.autoReplaceExecuted = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupMessageListener();
        this.injectStyles();
        this.isInitialized = true;
        
        console.log('Chrome Replace内容脚本已初始化');
        
        // 页面加载完成后检查是否需要自动替换
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAutoReplace();
            });
        } else {
            this.checkAutoReplace();
        }
    }
    
    // 检查是否需要自动替换
    async checkAutoReplace() {
        try {
            const result = await chrome.storage.local.get(['chromeReplaceSettings', 'chromeReplaceKeywords']);
            const settings = result.chromeReplaceSettings || {};
            const keywords = result.chromeReplaceKeywords || [];
            
            if (settings.enableAutoReplace && keywords.length > 0 && !this.autoReplaceExecuted) {
                // 延迟执行，确保页面内容加载完成
                setTimeout(() => {
                    this.performAutoReplace(keywords, settings);
                }, settings.replaceDelay || 500);
            }
        } catch (error) {
            console.error('检查自动替换失败:', error);
        }
    }
    
    // 执行自动替换
    async performAutoReplace(keywords, settings) {
        if (this.autoReplaceExecuted) return;
        
        try {
            const currentUrl = window.location.href;
            const applicableKeywords = keywords.filter(keyword => 
                keyword.enabled && this.isUrlMatch(currentUrl, keyword.urls, settings.globalScope)
            );
            
            if (applicableKeywords.length === 0) return;
            
            console.log(`开始自动替换，应用 ${applicableKeywords.length} 个规则`);
            
            let totalReplacements = 0;
            const replacementResults = [];
            
            for (const keyword of applicableKeywords) {
                const result = await this.performReplace({
                    searchText: keyword.searchText,
                    replaceText: keyword.replaceText,
                    options: keyword.options,
                    replaceAll: true
                });
                
                if (result.success) {
                    totalReplacements += result.replaceCount;
                    replacementResults.push({
                        keyword: keyword.name,
                        replacements: result.replaceCount
                    });
                }
            }
            
            this.autoReplaceExecuted = true;
            
            // 显示通知
            if (settings.enableNotification && totalReplacements > 0) {
                this.showNotification(`自动替换完成：${totalReplacements} 处替换`, 'success');
            }
            
            console.log('自动替换完成:', replacementResults);
            
        } catch (error) {
            console.error('自动替换失败:', error);
        }
    }
    
    // URL匹配检查
    isUrlMatch(currentUrl, keywordUrls, globalScope) {
        // 构建所有需要检查的URL规则
        const urlRules = [];
        
        // 添加全局作用域规则
        if (globalScope) {
            urlRules.push(...globalScope.split('\n').filter(rule => rule.trim()));
        }
        
        // 添加关键字特定的URL规则
        if (keywordUrls) {
            urlRules.push(...keywordUrls.split('\n').filter(rule => rule.trim()));
        }
        
        // 如果没有规则，默认匹配所有页面
        if (urlRules.length === 0) {
            return true;
        }
        
        // 检查是否匹配任何规则
        return urlRules.some(rule => this.matchUrl(currentUrl, rule.trim()));
    }
    
    // URL模式匹配
    matchUrl(url, pattern) {
        // 将通配符模式转换为正则表达式
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        
        // 处理特殊字符和通配符
        let regexPattern = escapeRegExp(pattern)
            .replace(/\\\*/g, '.*')  // * 匹配任意字符
            .replace(/\\\?/g, '.');  // ? 匹配单个字符
        
        // 确保模式匹配整个URL
        regexPattern = '^' + regexPattern + '$';
        
        try {
            const regex = new RegExp(regexPattern, 'i');
            return regex.test(url);
        } catch (error) {
            console.warn('URL模式匹配失败:', pattern, error);
            return false;
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `chrome-replace-notification chrome-replace-notification-${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // 设置消息监听器
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // 保持消息通道开放用于异步响应
        });
    }
    
    // 处理来自弹出窗口的消息
    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'replace':
                    const replaceResult = await this.performReplace(request.data);
                    sendResponse(replaceResult);
                    break;
                    
                case 'count':
                    const countResult = await this.countMatches(request.data);
                    sendResponse(countResult);
                    break;
                    
                case 'highlight':
                    const highlightResult = await this.highlightMatches(request.data);
                    sendResponse(highlightResult);
                    break;
                    
                case 'clearHighlights':
                    this.clearHighlights();
                    sendResponse({ success: true });
                    break;
                    
                case 'undo':
                    const undoResult = await this.undoLastReplace();
                    sendResponse(undoResult);
                    break;
                    
                case 'autoReplace':
                    const autoReplaceResult = await this.handleAutoReplace(request.data);
                    sendResponse(autoReplaceResult);
                    break;
                    
                default:
                    sendResponse({ success: false, error: '未知操作' });
            }
        } catch (error) {
            console.error('处理消息失败:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    // 处理手动触发的自动替换
    async handleAutoReplace(data) {
        const { keywords, settings } = data;
        
        try {
            const currentUrl = window.location.href;
            const applicableKeywords = keywords.filter(keyword => 
                this.isUrlMatch(currentUrl, keyword.urls, settings.globalScope)
            );
            
            let totalReplacements = 0;
            
            for (const keyword of applicableKeywords) {
                const result = await this.performReplace({
                    searchText: keyword.searchText,
                    replaceText: keyword.replaceText,
                    options: keyword.options,
                    replaceAll: true
                });
                
                if (result.success) {
                    totalReplacements += result.replaceCount;
                }
            }
            
            return { success: true, totalReplacements };
            
        } catch (error) {
            console.error('手动自动替换失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 执行替换操作
    async performReplace(data) {
        const { searchText, replaceText, options, replaceAll } = data;
        
        try {
            // 清除之前的高亮
            this.clearHighlights();
            
            // 创建搜索模式
            const pattern = this.createPattern(searchText, options);
            if (!pattern) {
                return { success: false, error: '无效的搜索模式' };
            }
            
            // 获取所有文本节点
            const textNodes = this.getAllTextNodes();
            let replaceCount = 0;
            const replacements = [];
            
            for (let node of textNodes) {
                const originalText = node.textContent;
                let newText;
                let matches = 0;
                
                if (options.useRegex) {
                    // 使用正则表达式替换
                    if (replaceAll) {
                        newText = originalText.replace(pattern, replaceText);
                        matches = (originalText.match(pattern) || []).length;
                    } else {
                        newText = originalText.replace(pattern, replaceText);
                        matches = pattern.test(originalText) ? 1 : 0;
                    }
                } else {
                    // 普通文本替换
                    if (replaceAll) {
                        newText = this.replaceAllText(originalText, searchText, replaceText, options);
                        matches = this.countTextMatches(originalText, searchText, options);
                    } else {
                        newText = this.replaceFirstText(originalText, searchText, replaceText, options);
                        matches = this.hasTextMatch(originalText, searchText, options) ? 1 : 0;
                    }
                }
                
                if (newText !== originalText) {
                    replacements.push({
                        node: node,
                        originalText: originalText,
                        newText: newText
                    });
                    replaceCount += matches;
                }
            }
            
            // 执行替换
            replacements.forEach(replacement => {
                replacement.node.textContent = replacement.newText;
            });
            
            // 保存替换历史用于撤销
            if (replacements.length > 0) {
                this.replacementHistory.push(replacements);
            }
            
            // 高亮新的匹配项（如果有剩余的）
            if (!replaceAll && replaceCount > 0) {
                setTimeout(() => {
                    this.highlightMatches({ searchText, options });
                }, 100);
            }
            
            return { 
                success: true, 
                replaceCount: replaceCount,
                totalReplacements: replacements.length 
            };
            
        } catch (error) {
            console.error('替换操作失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 统计匹配数量
    async countMatches(data) {
        const { searchText, options } = data;
        
        try {
            const pattern = this.createPattern(searchText, options);
            if (!pattern) {
                return { success: true, count: 0 };
            }
            
            const textNodes = this.getAllTextNodes();
            let totalCount = 0;
            
            for (let node of textNodes) {
                const text = node.textContent;
                
                if (options.useRegex) {
                    const matches = text.match(pattern);
                    totalCount += matches ? matches.length : 0;
                } else {
                    totalCount += this.countTextMatches(text, searchText, options);
                }
            }
            
            return { success: true, count: totalCount };
            
        } catch (error) {
            console.error('统计匹配失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 高亮匹配项
    async highlightMatches(data) {
        const { searchText, options } = data;
        
        try {
            // 清除之前的高亮
            this.clearHighlights();
            
            const pattern = this.createPattern(searchText, options);
            if (!pattern) {
                return { success: true, count: 0 };
            }
            
            const textNodes = this.getAllTextNodes();
            let highlightCount = 0;
            
            for (let node of textNodes) {
                const text = node.textContent;
                let highlightedHTML = '';
                
                if (options.useRegex) {
                    highlightedHTML = text.replace(pattern, (match) => {
                        highlightCount++;
                        return `<span class="${this.highlightClass}">${match}</span>`;
                    });
                } else {
                    highlightedHTML = this.highlightText(text, searchText, options);
                    highlightCount += this.countTextMatches(text, searchText, options);
                }
                
                if (highlightedHTML !== text) {
                    // 创建临时容器来解析HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = highlightedHTML;
                    
                    // 替换原始文本节点
                    const parent = node.parentNode;
                    while (tempDiv.firstChild) {
                        const newNode = tempDiv.firstChild;
                        parent.insertBefore(newNode, node);
                        
                        if (newNode.classList && newNode.classList.contains(this.highlightClass)) {
                            this.currentHighlights.push(newNode);
                        }
                    }
                    parent.removeChild(node);
                }
            }
            
            return { success: true, count: highlightCount };
            
        } catch (error) {
            console.error('高亮匹配失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 清除高亮
    clearHighlights() {
        this.currentHighlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize(); // 合并相邻的文本节点
            }
        });
        this.currentHighlights = [];
    }
    
    // 撤销最后一次替换
    async undoLastReplace() {
        if (this.replacementHistory.length === 0) {
            return { success: false, error: '没有可撤销的操作' };
        }
        
        try {
            const lastReplacements = this.replacementHistory.pop();
            
            lastReplacements.forEach(replacement => {
                if (replacement.node.parentNode) {
                    replacement.node.textContent = replacement.originalText;
                }
            });
            
            return { success: true, undoCount: lastReplacements.length };
            
        } catch (error) {
            console.error('撤销操作失败:', error);
            return { success: false, error: error.message };
        }
    }
    
    // 创建搜索模式
    createPattern(searchText, options) {
        if (!searchText) return null;
        
        try {
            if (options.useRegex) {
                const flags = options.caseSensitive ? 'g' : 'gi';
                return new RegExp(searchText, flags);
            } else {
                // 对于非正则表达式搜索，我们不在这里创建RegExp
                return searchText;
            }
        } catch (error) {
            console.error('创建搜索模式失败:', error);
            return null;
        }
    }
    
    // 获取所有文本节点
    getAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // 排除脚本和样式标签内的文本
                    const parent = node.parentNode;
                    const tagName = parent.tagName;
                    
                    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // 排除插件自己创建的元素
                    if (parent.classList && 
                        (parent.classList.contains('chrome-replace-notification') || 
                         parent.classList.contains(this.highlightClass))) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // 排除空白文本节点
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }
    
    // 普通文本替换（全部）
    replaceAllText(text, searchText, replaceText, options) {
        if (options.wholeWord) {
            const pattern = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                options.caseSensitive ? 'g' : 'gi'
            );
            return text.replace(pattern, replaceText);
        } else {
            if (options.caseSensitive) {
                return text.split(searchText).join(replaceText);
            } else {
                const pattern = new RegExp(this.escapeRegExp(searchText), 'gi');
                return text.replace(pattern, replaceText);
            }
        }
    }
    
    // 普通文本替换（第一个）
    replaceFirstText(text, searchText, replaceText, options) {
        if (options.wholeWord) {
            const pattern = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                options.caseSensitive ? '' : 'i'
            );
            return text.replace(pattern, replaceText);
        } else {
            if (options.caseSensitive) {
                const index = text.indexOf(searchText);
                if (index !== -1) {
                    return text.substring(0, index) + replaceText + text.substring(index + searchText.length);
                }
                return text;
            } else {
                const pattern = new RegExp(this.escapeRegExp(searchText), 'i');
                return text.replace(pattern, replaceText);
            }
        }
    }
    
    // 统计文本匹配数量
    countTextMatches(text, searchText, options) {
        if (options.wholeWord) {
            const pattern = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                options.caseSensitive ? 'g' : 'gi'
            );
            const matches = text.match(pattern);
            return matches ? matches.length : 0;
        } else {
            if (options.caseSensitive) {
                return (text.split(searchText).length - 1);
            } else {
                const pattern = new RegExp(this.escapeRegExp(searchText), 'gi');
                const matches = text.match(pattern);
                return matches ? matches.length : 0;
            }
        }
    }
    
    // 检查是否有文本匹配
    hasTextMatch(text, searchText, options) {
        if (options.wholeWord) {
            const pattern = new RegExp(
                `\\b${this.escapeRegExp(searchText)}\\b`,
                options.caseSensitive ? '' : 'i'
            );
            return pattern.test(text);
        } else {
            if (options.caseSensitive) {
                return text.includes(searchText);
            } else {
                return text.toLowerCase().includes(searchText.toLowerCase());
            }
        }
    }
    
    // 高亮文本
    highlightText(text, searchText, options) {
        if (options.wholeWord) {
            const pattern = new RegExp(
                `\\b(${this.escapeRegExp(searchText)})\\b`,
                options.caseSensitive ? 'g' : 'gi'
            );
            return text.replace(pattern, `<span class="${this.highlightClass}">$1</span>`);
        } else {
            if (options.caseSensitive) {
                return text.split(searchText).join(`<span class="${this.highlightClass}">${searchText}</span>`);
            } else {
                const pattern = new RegExp(`(${this.escapeRegExp(searchText)})`, 'gi');
                return text.replace(pattern, `<span class="${this.highlightClass}">$1</span>`);
            }
        }
    }
    
    // 转义正则表达式特殊字符
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // 注入样式
    injectStyles() {
        if (document.getElementById('chrome-replace-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'chrome-replace-styles';
        style.textContent = `
            .${this.highlightClass} {
                background-color: #ffff00 !important;
                color: #000000 !important;
                padding: 1px 2px !important;
                border-radius: 2px !important;
                box-shadow: 0 0 3px rgba(255, 255, 0, 0.5) !important;
                animation: chrome-replace-blink 1s ease-in-out !important;
            }
            
            @keyframes chrome-replace-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .chrome-replace-notification {
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: #333 !important;
                color: white !important;
                padding: 12px 16px !important;
                border-radius: 8px !important;
                font-size: 14px !important;
                font-family: 'Segoe UI', Arial, sans-serif !important;
                z-index: 2147483647 !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                animation: chrome-replace-notification-slide 0.3s ease-out !important;
                max-width: 300px !important;
                word-wrap: break-word !important;
            }
            
            .chrome-replace-notification-success {
                background: #28a745 !important;
            }
            
            .chrome-replace-notification-error {
                background: #dc3545 !important;
            }
            
            .chrome-replace-notification-warning {
                background: #ffc107 !important;
                color: #000 !important;
            }
            
            @keyframes chrome-replace-notification-slide {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 初始化内容脚本
if (typeof window !== 'undefined' && !window.chromeReplaceContent) {
    window.chromeReplaceContent = new ChromeReplaceContent();
} 