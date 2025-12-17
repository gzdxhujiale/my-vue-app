# TDesign Vue3 表格示例

这是一个使用 TDesign Vue3 组件库创建的表格和按钮示例项目。

## 功能特性

- 📊 TDesign 数据表格展示
- 🔘 多种操作按钮（添加、删除、刷新、导出）
- 🎨 现代化 UI 设计
- 📱 响应式布局

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署

### 1. 本地文件部署
```bash
# 构建项目（使用相对路径）
npm run build

# 构建完成后，可以直接打开 dist/index.html 文件
```

### 2. GitHub Pages 部署

#### 方法一：自动部署（推荐）
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 "GitHub Actions" 作为源
4. 推送到 main 分支时会自动构建和部署

#### 方法二：手动部署
```bash
# 如果你的仓库名不是根域名，需要修改 package.json 中的仓库名
# 然后运行：
npm run build:github

# 将 dist 文件夹内容推送到 gh-pages 分支
```

### 3. 其他服务器部署
```bash
# 普通构建
npm run build

# 将 dist 文件夹上传到服务器即可
```

## 路径配置说明

项目已配置为自动适应不同部署环境：

- **开发环境**: 使用 `/` 作为基础路径
- **生产环境**: 使用 `./` 相对路径，适用于本地文件和大多数服务器
- **GitHub Pages**: 可使用 `build:github` 命令指定仓库路径

## 重要提示

如果要部署到 GitHub Pages 且仓库名不是 `username.github.io`，请：

1. 修改 `package.json` 中的 `build:github` 脚本，将 `/your-repo-name/` 替换为你的实际仓库名
2. 或者修改 `vite.config.js` 中的配置

## 技术栈

- Vue 3
- Vite
- TDesign Vue Next
- JavaScript (ES6+)