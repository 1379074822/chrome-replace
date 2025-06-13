// 插件弹出窗口的主要逻辑
class ChromeReplacePopup {
    constructor() {
        this.searchText = '';
        this.replaceText = '';
        this.options = {
            caseSensitive: false,
            wholeWord: false,
            useRegex: false
        };
        this.stats = {
            matchCount: 0,
            replaceCount: 0
        };
        this.keywords = [];
        this.settings = {
            enableAutoReplace: true,
            enableHighlight: true,
            enableNotification: true,
            globalScope: '',
            replaceDelay: 500
        };
        this.currentEditingKeyword = null;
        this.keywordListClickHandler = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSavedData();
        this.updateUI();
    }
    
    bindEvents() {
        // 获取DOM元素
        this.elements = {
            // 手动替换元素
            searchText: document.getElementById('searchText'),
            replaceText: document.getElementById('replaceText'),
            caseSensitive: document.getElementById('caseSensitive'),
            wholeWord: document.getElementById('wholeWord'),
            useRegex: document.getElementById('useRegex'),
            replaceBtn: document.getElementById('replaceBtn'),
            replaceAllBtn: document.getElementById('replaceAllBtn'),
            clearBtn: document.getElementById('clearBtn'),
            status: document.getElementById('status'),
            matchCount: document.getElementById('matchCount'),
            replaceCount: document.getElementById('replaceCount'),
            
            // 标签页元素
            tabButtons: document.querySelectorAll('.tab-button'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // 关键字管理元素
            addKeywordBtn: document.getElementById('addKeywordBtn'),
            keywordsList: document.getElementById('keywordsList'),
            autoReplaceBtn: document.getElementById('autoReplaceBtn'),
            exportKeywordsBtn: document.getElementById('exportKeywordsBtn'),
            importKeywordsBtn: document.getElementById('importKeywordsBtn'),
            importFileInput: document.getElementById('importFileInput'),
            
            // 设置元素
            enableAutoReplace: document.getElementById('enableAutoReplace'),
            enableHighlight: document.getElementById('enableHighlight'),
            enableNotification: document.getElementById('enableNotification'),
            globalScope: document.getElementById('globalScope'),
            replaceDelay: document.getElementById('replaceDelay'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            
            // 模态框元素
            keywordModal: document.getElementById('keywordModal'),
            modalTitle: document.getElementById('modalTitle'),
            closeModal: document.getElementById('closeModal'),
            keywordName: document.getElementById('keywordName'),
            keywordSearch: document.getElementById('keywordSearch'),
            keywordReplace: document.getElementById('keywordReplace'),
            keywordUrls: document.getElementById('keywordUrls'),
            keywordCaseSensitive: document.getElementById('keywordCaseSensitive'),
            keywordWholeWord: document.getElementById('keywordWholeWord'),
            keywordUseRegex: document.getElementById('keywordUseRegex'),
            keywordEnabled: document.getElementById('keywordEnabled'),
            saveKeywordBtn: document.getElementById('saveKeywordBtn'),
            cancelKeywordBtn: document.getElementById('cancelKeywordBtn')
        };
        
        // 绑定手动替换事件
        this.bindManualReplaceEvents();
        
        // 绑定标签页事件
        this.bindTabEvents();
        
        // 绑定关键字管理事件
        this.bindKeywordEvents();
        
        // 绑定设置事件
        this.bindSettingsEvents();
        
        // 绑定模态框事件
        this.bindModalEvents();
        
        // 绑定快捷键
        this.bindShortcuts();
    }
    
    bindManualReplaceEvents() {
        this.elements.searchText.addEventListener('input', (e) => {
            this.searchText = e.target.value;
            this.saveData();
            this.updateStats();
        });
        
        this.elements.replaceText.addEventListener('input', (e) => {
            this.replaceText = e.target.value;
            this.saveData();
        });
        
        this.elements.caseSensitive.addEventListener('change', (e) => {
            this.options.caseSensitive = e.target.checked;
            this.saveData();
            this.updateStats();
        });
        
        this.elements.wholeWord.addEventListener('change', (e) => {
            this.options.wholeWord = e.target.checked;
            this.saveData();
            this.updateStats();
        });
        
        this.elements.useRegex.addEventListener('change', (e) => {
            this.options.useRegex = e.target.checked;
            this.saveData();
            this.updateStats();
        });
        
        this.elements.replaceBtn.addEventListener('click', () => {
            this.performReplace(false);
        });
        
        this.elements.replaceAllBtn.addEventListener('click', () => {
            this.performReplace(true);
        });
        
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });
    }
    
    bindTabEvents() {
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }
    
    bindKeywordEvents() {
        this.elements.addKeywordBtn.addEventListener('click', () => {
            this.openKeywordModal();
        });
        
        this.elements.autoReplaceBtn.addEventListener('click', () => {
            this.triggerAutoReplace();
        });
        
        this.elements.exportKeywordsBtn.addEventListener('click', () => {
            this.exportKeywords();
        });
        
        this.elements.importKeywordsBtn.addEventListener('click', () => {
            this.elements.importFileInput.click();
        });
        
        this.elements.importFileInput.addEventListener('change', (e) => {
            this.importKeywords(e.target.files[0]);
        });
    }
    
    bindSettingsEvents() {
        this.elements.enableAutoReplace.addEventListener('change', (e) => {
            this.settings.enableAutoReplace = e.target.checked;
            this.saveSettings();
        });
        
        this.elements.enableHighlight.addEventListener('change', (e) => {
            this.settings.enableHighlight = e.target.checked;
            this.saveSettings();
        });
        
        this.elements.enableNotification.addEventListener('change', (e) => {
            this.settings.enableNotification = e.target.checked;
            this.saveSettings();
        });
        
        this.elements.globalScope.addEventListener('input', (e) => {
            this.settings.globalScope = e.target.value;
            this.saveSettings();
        });
        
        this.elements.replaceDelay.addEventListener('input', (e) => {
            this.settings.replaceDelay = parseInt(e.target.value);
            this.saveSettings();
        });
        
        this.elements.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
            this.updateStatus('设置已保存', 'success');
        });
        
        this.elements.resetSettingsBtn.addEventListener('click', () => {
            this.resetSettings();
            this.updateStatus('设置已重置', 'success');
        });
    }
    
    bindModalEvents() {
        this.elements.closeModal.addEventListener('click', () => {
            this.closeKeywordModal();
        });
        
        this.elements.cancelKeywordBtn.addEventListener('click', () => {
            this.closeKeywordModal();
        });
        
        this.elements.saveKeywordBtn.addEventListener('click', () => {
            this.saveKeyword();
        });
        
        // 点击模态框外部关闭
        this.elements.keywordModal.addEventListener('click', (e) => {
            if (e.target === this.elements.keywordModal) {
                this.closeKeywordModal();
            }
        });
    }
    
    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (this.getCurrentTab() === 'manual') {
                            this.performReplace(e.shiftKey);
                        }
                        break;
                    case 'Escape':
                        if (this.elements.keywordModal.classList.contains('show')) {
                            this.closeKeywordModal();
                        } else {
                            this.clearAll();
                        }
                        break;
                }
            }
        });
    }
    
    // 标签页切换
    switchTab(tabName) {
        this.elements.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.elements.tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // 根据标签页加载对应数据
        switch(tabName) {
            case 'keywords':
                this.loadKeywordsList();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }
    
    getCurrentTab() {
        const activeTab = document.querySelector('.tab-button.active');
        return activeTab ? activeTab.dataset.tab : 'manual';
    }
    
    // 关键字管理相关方法
    loadKeywordsList() {
        const container = this.elements.keywordsList;
        
        if (this.keywords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">还没有设置关键字规则</div>
                    <button class="btn btn-primary btn-small" data-action="add-first-keyword">添加第一个规则</button>
                </div>
            `;
        } else {
            container.innerHTML = this.keywords.map((keyword, index) => `
                <div class="keyword-item ${!keyword.enabled ? 'disabled' : ''}" data-index="${index}">
                    <div class="keyword-header">
                        <div class="keyword-name">${this.escapeHtml(keyword.name)}</div>
                        <div class="keyword-actions">
                            <button class="keyword-btn keyword-btn-toggle ${keyword.enabled ? 'enabled' : ''}" 
                                    data-action="toggle" data-index="${index}">
                                ${keyword.enabled ? '✓' : '✗'}
                            </button>
                            <button class="keyword-btn keyword-btn-edit" 
                                    data-action="edit" data-index="${index}">
                                编辑
                            </button>
                            <button class="keyword-btn keyword-btn-delete" 
                                    data-action="delete" data-index="${index}">
                                删除
                            </button>
                        </div>
                    </div>
                    <div class="keyword-details">
                        <span class="keyword-search">${this.escapeHtml(keyword.searchText)}</span>
                        →
                        <span class="keyword-replace">${this.escapeHtml(keyword.replaceText)}</span>
                        ${keyword.options.caseSensitive ? '<small>[区分大小写]</small>' : ''}
                        ${keyword.options.wholeWord ? '<small>[全词匹配]</small>' : ''}
                        ${keyword.options.useRegex ? '<small>[正则]</small>' : ''}
                    </div>
                    ${keyword.urls ? `<div class="keyword-urls">作用域: ${this.escapeHtml(keyword.urls.slice(0, 100))}</div>` : ''}
                </div>
            `).join('');
        }
        
        // 绑定事件委托
        this.bindKeywordListEvents();
    }
    
    // 绑定关键字列表事件委托
    bindKeywordListEvents() {
        // 移除之前的事件监听器
        this.elements.keywordsList.removeEventListener('click', this.keywordListClickHandler);
        
        // 创建事件处理器
        this.keywordListClickHandler = (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            const index = parseInt(button.dataset.index);
            
            switch (action) {
                case 'add-first-keyword':
                    this.openKeywordModal();
                    break;
                case 'toggle':
                    this.toggleKeyword(index);
                    break;
                case 'edit':
                    this.editKeyword(index);
                    break;
                case 'delete':
                    this.deleteKeyword(index);
                    break;
            }
        };
        
        // 绑定事件委托
        this.elements.keywordsList.addEventListener('click', this.keywordListClickHandler);
    }
    
    openKeywordModal(keyword = null, index = null) {
        this.currentEditingKeyword = index;
        const isEdit = keyword !== null;
        
        this.elements.modalTitle.textContent = isEdit ? '编辑关键字规则' : '添加关键字规则';
        
        if (isEdit) {
            this.elements.keywordName.value = keyword.name;
            this.elements.keywordSearch.value = keyword.searchText;
            this.elements.keywordReplace.value = keyword.replaceText;
            this.elements.keywordUrls.value = keyword.urls || '';
            this.elements.keywordCaseSensitive.checked = keyword.options.caseSensitive;
            this.elements.keywordWholeWord.checked = keyword.options.wholeWord;
            this.elements.keywordUseRegex.checked = keyword.options.useRegex;
            this.elements.keywordEnabled.checked = keyword.enabled;
        } else {
            this.elements.keywordName.value = '';
            this.elements.keywordSearch.value = '';
            this.elements.keywordReplace.value = '';
            this.elements.keywordUrls.value = '';
            this.elements.keywordCaseSensitive.checked = false;
            this.elements.keywordWholeWord.checked = false;
            this.elements.keywordUseRegex.checked = false;
            this.elements.keywordEnabled.checked = true;
        }
        
        this.elements.keywordModal.classList.add('show');
        this.elements.keywordName.focus();
    }
    
    closeKeywordModal() {
        this.elements.keywordModal.classList.remove('show');
        this.currentEditingKeyword = null;
    }
    
    saveKeyword() {
        const name = this.elements.keywordName.value.trim();
        const searchText = this.elements.keywordSearch.value.trim();
        const replaceText = this.elements.keywordReplace.value;
        const urls = this.elements.keywordUrls.value.trim();
        
        if (!name || !searchText) {
            this.updateStatus('请填写规则名称和查找内容', 'error');
            return;
        }
        
        const keywordData = {
            id: this.currentEditingKeyword !== null ? this.keywords[this.currentEditingKeyword].id : Date.now(),
            name: name,
            searchText: searchText,
            replaceText: replaceText,
            urls: urls,
            options: {
                caseSensitive: this.elements.keywordCaseSensitive.checked,
                wholeWord: this.elements.keywordWholeWord.checked,
                useRegex: this.elements.keywordUseRegex.checked
            },
            enabled: this.elements.keywordEnabled.checked,
            createdAt: this.currentEditingKeyword !== null ? this.keywords[this.currentEditingKeyword].createdAt : Date.now(),
            updatedAt: Date.now()
        };
        
        if (this.currentEditingKeyword !== null) {
            this.keywords[this.currentEditingKeyword] = keywordData;
        } else {
            this.keywords.push(keywordData);
        }
        
        this.saveKeywords();
        this.loadKeywordsList();
        this.closeKeywordModal();
        this.updateStatus(this.currentEditingKeyword !== null ? '规则已更新' : '规则已添加', 'success');
    }
    
    editKeyword(index) {
        this.openKeywordModal(this.keywords[index], index);
    }
    
    deleteKeyword(index) {
        if (confirm('确定要删除这个关键字规则吗？')) {
            this.keywords.splice(index, 1);
            this.saveKeywords();
            this.loadKeywordsList();
            this.updateStatus('规则已删除', 'success');
        }
    }
    
    toggleKeyword(index) {
        this.keywords[index].enabled = !this.keywords[index].enabled;
        this.keywords[index].updatedAt = Date.now();
        this.saveKeywords();
        this.loadKeywordsList();
        this.updateStatus(`规则已${this.keywords[index].enabled ? '启用' : '禁用'}`, 'success');
    }
    
    // 触发自动替换
    async triggerAutoReplace() {
        try {
            this.updateStatus('正在执行自动替换...', 'processing');
            
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // 检查是否是特殊页面
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
                this.updateStatus('无法在此页面执行自动替换', 'error');
                return;
            }
            
            const result = await chrome.tabs.sendMessage(tab.id, {
                action: 'autoReplace',
                data: {
                    keywords: this.keywords.filter(k => k.enabled),
                    settings: this.settings
                }
            });
            
            if (result && result.success) {
                this.updateStatus(`自动替换完成，共替换 ${result.totalReplacements} 处`, 'success');
            } else {
                this.updateStatus('自动替换失败', 'error');
            }
        } catch (error) {
            console.error('自动替换失败:', error);
            if (error.message.includes('Could not establish connection')) {
                this.updateStatus('无法连接到页面，请刷新页面后重试', 'error');
            } else {
                this.updateStatus('自动替换失败，请刷新页面后重试', 'error');
            }
        }
    }
    
    // 导出关键字
    exportKeywords() {
        const data = {
            keywords: this.keywords,
            settings: this.settings,
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chrome-replace-rules-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.updateStatus('规则导出成功', 'success');
    }
    
    // 导入关键字
    importKeywords(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.keywords && Array.isArray(data.keywords)) {
                    // 合并导入的关键字
                    const existingIds = new Set(this.keywords.map(k => k.id));
                    const newKeywords = data.keywords.filter(k => !existingIds.has(k.id));
                    
                    this.keywords.push(...newKeywords);
                    this.saveKeywords();
                    this.loadKeywordsList();
                    
                    this.updateStatus(`成功导入 ${newKeywords.length} 个规则`, 'success');
                } else {
                    this.updateStatus('导入文件格式不正确', 'error');
                }
            } catch (error) {
                console.error('导入失败:', error);
                this.updateStatus('导入失败，文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
        
        // 清空文件输入
        this.elements.importFileInput.value = '';
    }
    
    // 设置相关方法
    loadSettingsData() {
        this.elements.enableAutoReplace.checked = this.settings.enableAutoReplace;
        this.elements.enableHighlight.checked = this.settings.enableHighlight;
        this.elements.enableNotification.checked = this.settings.enableNotification;
        this.elements.globalScope.value = this.settings.globalScope;
        this.elements.replaceDelay.value = this.settings.replaceDelay;
    }
    
    resetSettings() {
        this.settings = {
            enableAutoReplace: true,
            enableHighlight: true,
            enableNotification: true,
            globalScope: '',
            replaceDelay: 500
        };
        this.saveSettings();
        this.loadSettingsData();
    }
    
    // 执行替换操作
    async performReplace(replaceAll = false) {
        if (!this.searchText.trim()) {
            this.updateStatus('请输入要查找的文本', 'error');
            return;
        }
        
        try {
            this.updateStatus('正在处理...', 'processing');
            
            // 获取当前活动标签页
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // 检查是否是特殊页面
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
                this.updateStatus('无法在此页面执行替换操作', 'error');
                return;
            }
            
            // 向内容脚本发送替换指令
            const result = await chrome.tabs.sendMessage(tab.id, {
                action: 'replace',
                data: {
                    searchText: this.searchText,
                    replaceText: this.replaceText,
                    options: this.options,
                    replaceAll: replaceAll
                }
            });
            
            if (result && result.success) {
                this.stats.replaceCount += result.replaceCount || 0;
                this.updateStats();
                this.updateStatus(`${replaceAll ? '全部' : ''}替换完成`, 'success');
            } else {
                this.updateStatus('替换失败', 'error');
            }
        } catch (error) {
            console.error('替换操作失败:', error);
            if (error.message.includes('Could not establish connection')) {
                this.updateStatus('无法连接到页面，请刷新页面后重试', 'error');
            } else {
                this.updateStatus('操作失败，请刷新页面后重试', 'error');
            }
        }
    }
    
    // 更新匹配统计
    async updateStats() {
        if (!this.searchText.trim()) {
            this.stats.matchCount = 0;
            this.updateStatsDisplay();
            return;
        }
        
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // 检查是否是特殊页面
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
                this.stats.matchCount = 0;
                this.updateStatsDisplay();
                return;
            }
            
            const result = await chrome.tabs.sendMessage(tab.id, {
                action: 'count',
                data: {
                    searchText: this.searchText,
                    options: this.options
                }
            });
            
            if (result && result.success) {
                this.stats.matchCount = result.count || 0;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('统计更新失败:', error);
            // 静默处理统计错误，不显示给用户
            this.stats.matchCount = 0;
            this.updateStatsDisplay();
        }
    }
    
    // 清除所有内容
    clearAll() {
        this.searchText = '';
        this.replaceText = '';
        this.stats = { matchCount: 0, replaceCount: 0 };
        
        this.elements.searchText.value = '';
        this.elements.replaceText.value = '';
        this.elements.caseSensitive.checked = false;
        this.elements.wholeWord.checked = false;
        this.elements.useRegex.checked = false;
        
        this.options = {
            caseSensitive: false,
            wholeWord: false,
            useRegex: false
        };
        
        this.saveData();
        this.updateStatsDisplay();
        this.updateStatus('已清除', 'success');
    }
    
    // 更新状态显示
    updateStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        
        // 自动清除状态
        setTimeout(() => {
            if (this.elements.status.textContent === message) {
                this.elements.status.textContent = '就绪';
                this.elements.status.className = 'status';
            }
        }, 3000);
    }
    
    // 更新统计显示
    updateStatsDisplay() {
        this.elements.matchCount.textContent = `匹配: ${this.stats.matchCount}`;
        this.elements.replaceCount.textContent = `已替换: ${this.stats.replaceCount}`;
    }
    
    // 保存数据到本地存储
    saveData() {
        const data = {
            searchText: this.searchText,
            replaceText: this.replaceText,
            options: this.options,
            stats: this.stats
        };
        
        chrome.storage.local.set({ chromeReplaceData: data });
    }
    
    // 保存关键字
    saveKeywords() {
        chrome.storage.local.set({ chromeReplaceKeywords: this.keywords });
    }
    
    // 保存设置
    saveSettings() {
        chrome.storage.local.set({ chromeReplaceSettings: this.settings });
    }
    
    // 从本地存储加载数据
    async loadSavedData() {
        try {
            const result = await chrome.storage.local.get([
                'chromeReplaceData',
                'chromeReplaceKeywords',
                'chromeReplaceSettings'
            ]);
            
            // 加载手动替换数据
            if (result.chromeReplaceData) {
                const data = result.chromeReplaceData;
                this.searchText = data.searchText || '';
                this.replaceText = data.replaceText || '';
                this.options = { ...this.options, ...data.options };
                this.stats = { ...this.stats, ...data.stats };
                
                this.elements.searchText.value = this.searchText;
                this.elements.replaceText.value = this.replaceText;
                this.elements.caseSensitive.checked = this.options.caseSensitive;
                this.elements.wholeWord.checked = this.options.wholeWord;
                this.elements.useRegex.checked = this.options.useRegex;
            }
            
            // 加载关键字数据
            if (result.chromeReplaceKeywords) {
                this.keywords = result.chromeReplaceKeywords;
            }
            
            // 加载设置数据
            if (result.chromeReplaceSettings) {
                this.settings = { ...this.settings, ...result.chromeReplaceSettings };
            }
            
        } catch (error) {
            console.error('加载保存的数据失败:', error);
        }
    }
    
    // 更新UI状态
    updateUI() {
        this.updateStatsDisplay();
        // 延迟更新统计，确保内容脚本已加载
        setTimeout(() => {
            this.updateStats();
        }, 100);
    }
    
    // 工具方法
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.chromeReplacePopup = new ChromeReplacePopup();
}); 