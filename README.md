# Chrome Replace 插件

一个功能强大的Chrome浏览器插件，用于在网页中查找和替换文本内容，支持关键字管理和自动替换功能。

## 🌟 核心功能

### 手动替换
- 🔍 **智能搜索**: 支持普通文本搜索和正则表达式搜索
- 🔄 **灵活替换**: 支持单个替换和批量替换
- 📊 **实时统计**: 显示匹配数量和替换统计
- 🎨 **高亮显示**: 高亮显示匹配的文本

### 关键字管理
- 📝 **关键字规则**: 预设多个关键字和对应的替换内容
- 🌐 **作用域控制**: 支持URL匹配规则，指定特定页面生效
- ⚙️ **规则选项**: 每个规则支持独立的搜索选项（大小写、全词匹配、正则表达式）
- 🔄 **导入导出**: 支持规则的导入和导出功能

### 自动替换
- 🚀 **页面加载自动执行**: 页面加载完成后自动扫描并替换预设关键字
- 🎯 **精准匹配**: 基于URL规则智能判断是否在当前页面执行替换
- 📢 **替换通知**: 可选的替换完成通知提示
- ⏱️ **延迟控制**: 可调节的替换延迟时间

### 高级功能
- 💾 **自动保存**: 自动保存搜索历史和设置
- ⌨️ **快捷键**: 支持键盘快捷键操作
- 🎯 **右键菜单**: 支持右键菜单快速操作
- 🔧 **丰富设置**: 全局设置和个性化配置

## 📁 项目结构

```
chrome-replace/
├── manifest.json          # 插件配置文件
├── popup/                 # 弹出窗口
│   ├── popup.html        # 弹出窗口HTML（支持标签页）
│   ├── popup.css         # 弹出窗口样式
│   └── popup.js          # 弹出窗口逻辑
├── background/            # 后台脚本
│   └── background.js     # 后台服务脚本
├── content/              # 内容脚本
│   ├── content.js        # 内容脚本逻辑（支持自动替换）
│   └── content.css       # 内容样式
├── icons/                # 图标文件
│   ├── icon16.png        # 16x16图标
│   ├── icon32.png        # 32x32图标
│   ├── icon48.png        # 48x48图标
│   └── icon128.png       # 128x128图标
└── README.md             # 说明文档
```

## 🚀 安装方法

### 开发者模式安装

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 打开右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择本插件的文件夹
6. 插件安装完成

## 📖 使用方法

### 手动替换

1. **打开插件**: 点击浏览器工具栏中的插件图标
2. **选择"手动替换"标签**: 默认显示的标签页
3. **输入搜索文本**: 在"查找文本"框中输入要搜索的内容
4. **输入替换文本**: 在"替换为"框中输入替换的内容
5. **选择选项**: 根据需要选择搜索选项
6. **执行替换**: 点击"替换"或"全部替换"按钮

### 关键字管理

1. **切换到"关键字管理"标签**: 点击弹出窗口中的"关键字管理"标签
2. **添加关键字规则**: 点击"+ 添加"按钮创建新规则
3. **配置规则**:
   - **规则名称**: 为规则起一个便于识别的名字
   - **查找内容**: 要查找的关键字或文本
   - **替换内容**: 要替换成的内容
   - **作用域**: URL匹配规则，支持通配符（留空则应用到所有页面）
   - **选项**: 区分大小写、全词匹配、正则表达式等
4. **管理规则**: 可以编辑、禁用/启用、删除已有规则
5. **导入导出**: 支持规则的批量导入和导出

### 自动替换设置

1. **切换到"设置"标签**: 点击弹出窗口中的"设置"标签
2. **配置自动替换**:
   - **启用页面加载时自动替换**: 开启后每次页面加载都会自动执行替换
   - **高亮显示替换的文本**: 开启后会高亮显示被替换的文本
   - **显示替换通知**: 开启后会显示替换完成的通知
3. **设置全局作用域**: 配置全局的URL匹配规则
4. **调整替换延迟**: 设置页面加载后多久开始执行替换（毫秒）

### URL匹配规则

支持灵活的URL匹配模式：

```
# 匹配特定域名的所有页面
https://example.com/*

# 匹配所有协议的GitHub页面
*://github.com/*

# 匹配特定路径
https://www.google.com/search*

# 匹配子域名
https://*.example.com/*
```

### 搜索选项

- **区分大小写**: 启用后严格区分大小写字母
- **全词匹配**: 只匹配完整的单词，避免部分匹配
- **使用正则表达式**: 启用正则表达式搜索模式

### 快捷键

- `Ctrl/Cmd + Enter`: 执行替换
- `Ctrl/Cmd + Shift + Enter`: 执行全部替换
- `Escape`: 清除输入内容或关闭模态框

### 右键菜单

- **替换选中文本**: 选中文本后右键快速设置为搜索内容
- **执行自动替换**: 立即在当前页面执行自动替换
- **打开替换工具**: 打开插件弹出窗口
- **切换自动替换**: 快速开启/关闭自动替换功能

## 🔧 开发说明

### 技术栈

- **Manifest V3**: 使用最新的Chrome扩展API
- **ES6+**: 使用现代JavaScript语法
- **CSS3**: 现代化的界面样式和动画
- **Chrome Extension APIs**: 完整的Chrome扩展功能

### 核心组件

1. **Popup组件** (`popup/`): 
   - 标签页式用户界面
   - 关键字管理功能
   - 设置配置界面
   - 模态框组件

2. **Background组件** (`background/`): 
   - 后台服务和事件处理
   - 右键菜单管理
   - 数据迁移和同步
   - 标签页生命周期管理

3. **Content组件** (`content/`): 
   - 页面内容操作和文本处理
   - 自动替换执行逻辑
   - URL匹配和作用域控制
   - 通知系统

### 数据结构

#### 关键字规则
```javascript
{
  id: number,           // 唯一标识
  name: string,         // 规则名称
  searchText: string,   // 查找内容
  replaceText: string,  // 替换内容
  urls: string,         // URL规则（每行一个）
  options: {
    caseSensitive: boolean,  // 区分大小写
    wholeWord: boolean,      // 全词匹配
    useRegex: boolean        // 使用正则表达式
  },
  enabled: boolean,     // 是否启用
  createdAt: number,    // 创建时间
  updatedAt: number     // 更新时间
}
```

#### 设置配置
```javascript
{
  enableAutoReplace: boolean,   // 启用自动替换
  enableHighlight: boolean,     // 启用高亮显示
  enableNotification: boolean,  // 启用通知
  globalScope: string,          // 全局作用域规则
  replaceDelay: number         // 替换延迟（毫秒）
}
```

## 💡 使用场景

1. **学习辅助**: 将英文术语自动替换为中文解释
2. **内容过滤**: 替换不当内容或敏感词汇
3. **个性化定制**: 根据个人喜好替换特定文本
4. **工作效率**: 批量替换常见的错误拼写或格式
5. **本地化**: 将外文网站内容替换为本地语言

## 📝 更新日志

### v2.0.0 (2024-12-19)
- ✨ 新增关键字管理功能
- 🚀 新增自动替换功能
- 🌐 新增URL作用域控制
- 📢 新增替换通知系统
- 📁 新增规则导入导出功能
- 🎨 重新设计用户界面（标签页式）
- ⚡ 优化性能和用户体验

### v1.0.0 (2024-12-19)
- 🎉 初始版本发布
- 🔍 基本的查找替换功能
- 📝 支持正则表达式
- 🎨 高亮显示匹配文本
- 💾 自动保存设置

## 🛠️ 开发环境

需要Chrome浏览器的开发者模式支持。开发时建议使用以下工具：

- Chrome DevTools
- Visual Studio Code
- Git版本控制

## 🤝 贡献指南

欢迎提交问题报告和功能请求！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目贡献代码和想法的开发者！ 