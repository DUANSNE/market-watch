# 市场追踪 | Daily Market Watch

一个可配置的金融与内容追踪站。每日自动更新数据，生成分析摘要，所有知道链接的人都可以同步查看。

## 快速本地启动

```bash
npm install       # 安装依赖，同时生成初始数据快照
npm run dev       # 启动开发服务 → http://localhost:3000
```

## 生产环境部署（供他人访问）

### 方式一：VPS / 云服务器

```bash
# 克隆项目并安装
git clone <仓库地址> market-watch
cd market-watch
npm install

# 构建生产版本
npm run build

# 启动服务（默认 3000 端口）
npm start
```

推荐用 `pm2` 管理进程保活：

```bash
npm install -g pm2
pm2 start npm --name market-watch -- start
pm2 save
```

> 如果服务器有防火墙，记得开放 3000 端口。  
> 如需绑定域名，推荐在 Nginx 里做反向代理 + 域名指向。

### 方式二：Vercel 一键部署

1. 把项目推送到 GitHub / GitLab
2. 登录 [Vercel](https://vercel.com) → Import 该项目
3. 构建命令：`npm run build`  
   输出目录：自动检测 Next.js
4. 部署完成后，Vercel 会给你一个 `*.vercel.app` 域名
5. **重要**：在 Vercel 项目的 Settings → General → **Output Settings** 中：
   - 确保 Serverless Functions 区域已启用
   - 因为首页使用了 `force-dynamic`，需要 Serverless Function 支持

### 方式三：Docker

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

构建并运行：

```bash
docker build -t market-watch .
docker run -d -p 3000:3000 market-watch
```

## 每日自动更新

网站本身是动态的——每次页面请求都会读取 `data/latest-snapshot.json` 的最新内容。  
所以只需要确保**数据快照每天都在更新**即可。

### 方案 A：服务器 cron（推荐）

在部署服务器上设置定时任务，让它每天在指定时间运行：

```bash
crontab -e
```

添加一行（每天 8:00 更新）：

```cron
0 8 * * * cd /path/to/market-watch && npm run update-data
```

### 方案 B：Vercel Cron Jobs

Vercel 支持 [Cron Jobs](https://vercel.com/docs/cron-jobs)，你可以编写一个定时触发的 API 路由来更新数据。

### 方案 C：用 SOLO 创建自动任务

如果你正在用 SOLO，可以直接要求：

> 帮我为 market-watch 创建一个每日自动任务，每天北京时间 9:00 执行 `npm run update-data`

## 如何添加追踪对象

编辑 `data/tracking-config.json` 即可。修改后运行 `npm run update-data` 更新快照，刷新页面就能看到变化。

### 金融标的

```json
{
  "id": "my-stock",
  "name": "My Stock",
  "symbol": "AAPL",
  "market": "美股",
  "category": "个股",
  "thesis": "关注理由"
}
```

`symbol` 使用 Yahoo Finance 的行情代码。

### 内容源

```json
{
  "id": "my-feed",
  "name": "我的内容源",
  "kind": "rss",
  "feedUrl": "https://example.com/feed.xml",
  "homepage": "https://example.com"
}
```

目前支持 RSS 2.0 和 Atom 格式。

## 配置 AI 分析

设置以下环境变量，分析模块会自动切到 AI 摘要：

```bash
OPENAI_API_KEY=你的密钥
OPENAI_MODEL=你要用的模型名
OPENAI_BASE_URL=https://api.openai.com/v1
```

`OPENAI_BASE_URL` 支持任何兼容 OpenAI Chat Completions 协议的服务。  
如果未配置，系统自动使用本地规则摘要。

## .env 文件示例

复制 `.env.example` 为 `.env` 并填写：

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 项目结构

```
market-watch/
├── data/
│   ├── tracking-config.json   ← 你编辑：追踪配置
│   └── latest-snapshot.json   ← 自动生成：最新数据快照
├── scripts/
│   └── update-data.mjs        ← 自动运行：抓取数据+生成分析
├── src/
│   ├── app/
│   │   ├── page.tsx           ← 首页 UI（动态渲染）
│   │   ├── layout.tsx         ← 布局与 SEO
│   │   └── globals.css        ← 全局样式
│   └── lib/
│       └── dashboard.ts       ← 数据读取与格式化
├── .env.example               ← 环境变量模板
├── next.config.ts
└── package.json
```

## 技术栈

- **框架**: Next.js 16 + TypeScript
- **样式**: Tailwind CSS 4
- **数据源**: Yahoo Finance API、RSS/Atom feeds
- **分析**: 本地规则摘要 / 可选 AI 摘要 (OpenAI 兼容接口)
- **部署**: 支持 VPS / Vercel / Docker
