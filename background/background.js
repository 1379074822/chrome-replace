// Chrome Replace 插件后台服务脚本 - 简化版本
console.log('Chrome Replace 后台脚本开始加载...');

// 插件安装事件
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Chrome Replace插件已安装/更新', details.reason);
    
    if (details.reason === 'install') {
        // 设置默认设置
        const defaultSettings = {
            enableAutoReplace: true,
            enableHighlight: true,
            enableNotification: true,
            globalScope: '',
            replaceDelay: 500
        };
        
        chrome.storage.local.set({ 
            chromeReplaceSettings: defaultSettings,
            chromeReplaceKeywords: []
        }).then(() => {
            console.log('默认设置已保存');
        }).catch(error => {
            console.error('保存默认设置失败:', error);
        });
    }
});

// 消息监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request.action);
    
    handleMessage(request, sender, sendResponse);
    return true; // 保持消息通道开放
});

// 处理消息的函数
async function handleMessage(request, sender, sendResponse) {
    try {
        switch (request.action) {
            case 'getSettings':
                const settings = await getSettings();
                sendResponse({ success: true, data: settings });
                break;
                
            case 'saveSettings':
                await saveSettings(request.data);
                sendResponse({ success: true });
                break;
                
            case 'getKeywords':
                const keywords = await getKeywords();
                sendResponse({ success: true, data: keywords });
                break;
                
            case 'saveKeywords':
                await saveKeywords(request.data);
                sendResponse({ success: true });
                break;
                
            case 'getTabInfo':
                const tabInfo = await getTabInfo(sender.tab.id);
                sendResponse({ success: true, data: tabInfo });
                break;
                
            default:
                sendResponse({ success: false, error: '未知操作: ' + request.action });
        }
    } catch (error) {
        console.error('处理消息失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// 获取设置
async function getSettings() {
    try {
        const result = await chrome.storage.local.get('chromeReplaceSettings');
        return result.chromeReplaceSettings || {
            enableAutoReplace: true,
            enableHighlight: true,
            enableNotification: true,
            globalScope: '',
            replaceDelay: 500
        };
    } catch (error) {
        console.error('获取设置失败:', error);
        return {
            enableAutoReplace: true,
            enableHighlight: true,
            enableNotification: true,
            globalScope: '',
            replaceDelay: 500
        };
    }
}

// 保存设置
async function saveSettings(settings) {
    try {
        await chrome.storage.local.set({ chromeReplaceSettings: settings });
        console.log('设置已保存');
    } catch (error) {
        console.error('保存设置失败:', error);
        throw error;
    }
}

// 获取关键字
async function getKeywords() {
    try {
        const result = await chrome.storage.local.get('chromeReplaceKeywords');
        return result.chromeReplaceKeywords || [];
    } catch (error) {
        console.error('获取关键字失败:', error);
        return [];
    }
}

// 保存关键字
async function saveKeywords(keywords) {
    try {
        await chrome.storage.local.set({ chromeReplaceKeywords: keywords });
        console.log('关键字已保存');
    } catch (error) {
        console.error('保存关键字失败:', error);
        throw error;
    }
}

// 获取标签页信息
async function getTabInfo(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        return {
            id: tab.id,
            url: tab.url,
            title: tab.title,
            active: tab.active
        };
    } catch (error) {
        console.error('获取标签页信息失败:', error);
        return null;
    }
}

// 延迟创建右键菜单
setTimeout(() => {
    try {
        if (chrome.contextMenus) {
            chrome.contextMenus.create({
                id: 'chromeReplace',
                title: 'Chrome Replace',
                contexts: ['page']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.warn('创建右键菜单失败:', chrome.runtime.lastError.message);
                } else {
                    console.log('右键菜单创建成功');
                }
            });
            
            // 右键菜单点击事件
            chrome.contextMenus.onClicked.addListener((info, tab) => {
                if (info.menuItemId === 'chromeReplace') {
                    chrome.action.openPopup();
                }
            });
        }
    } catch (error) {
        console.error('设置右键菜单失败:', error);
    }
}, 2000);

console.log('Chrome Replace 后台脚本加载完成'); 