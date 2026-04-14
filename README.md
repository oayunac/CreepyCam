# CreepyCam

*I see what you did there...*

CreepyCam is a browser-based habitual behavior tracker. It uses your webcam and a local vision model to catch your unconscious habits in real time — biting your nails, picking your face, sneaking snacks, and more.

**[Live Demo (GitHub Pages)](https://oayunac.github.io/CreepyCam/)** | [中文说明](#中文说明)

---

## Privacy First

**Your camera feed and images never leave your machine.**

- Your webcam is accessed directly by your browser — no server ever receives your video stream.
- Your images are analyzed by a vision model running **on your own computer** (e.g., Ollama, LM Studio).
- None of your data is uploaded, stored remotely, or shared with any third party.
- Your detection history lives only in your browser's memory and is lost when you refresh the page.
- Your settings are saved in `localStorage` — nothing is sent over the network.

You should use a **local model** (Ollama + Gemma 4, LLaVA, etc.) to keep everything completely offline. If you use a remote OpenAI-compatible API instead, be aware that your images will be sent to that provider's servers.

## Features

- Periodically captures your webcam at a configurable interval
- Pluggable model providers: **Ollama**, **LM Studio**, **OpenAI-compatible**
- Built-in behavior watchlist: eating, biting hand, picking face, scratching head, pen spinning, sneaking snacks, staring at camera
- You can add your own custom behaviors to watch for
- Sends you browser notifications when a behavior is detected
- Evidence photo viewer so you can see the full-resolution image
- Separates the detection image (small, sent to the model) from the display image (full-res, kept as evidence)
- Focused / All toggle lets you filter your detection history
- Shows you a pending indicator with a live thumbnail while the model is thinking

## Deploy

### Run Locally (Recommended)

This is the recommended way — you avoid mixed-content browser restrictions and keep everything on `localhost`.

```bash
git clone https://github.com/oayunac/CreepyCam.git
cd CreepyCam
npm install
npm run dev
# Open http://localhost:5173
```

### GitHub Pages

The repo includes a GitHub Actions workflow that auto-deploys to Pages when you push to `main`.

To set it up on your own fork:

1. Go to **Settings > Pages**
2. Set Source to **GitHub Actions**
3. Push to `main` — your site will be deployed automatically

**Limitation:** GitHub Pages serves over HTTPS, which blocks your requests to `http://localhost` (mixed content). This works if you use **Chrome** (which exempts localhost), but **Safari will block it**. If you're on Safari or want full compatibility, run locally.

### Model Server Setup

Start your local model with CORS enabled:

**Ollama:**
```bash
OLLAMA_ORIGINS=* ollama serve
# Make sure you have a vision model:
ollama pull gemma4
```

**LM Studio:**
Enable CORS in your server settings panel.

## Limitations

- You need a local vision model that supports image input — the app does not include any model.
- If you're on HTTPS (GitHub Pages), your browser will block requests to HTTP localhost. Use Chrome or run locally.
- Your detection accuracy depends entirely on the model you choose. Larger models give you better results but are slower.
- Your detection history is in-memory only — you lose it when you refresh the page.
- Custom behaviors are described by a short label you write; the model interprets them on a best-effort basis.

## Tech Stack

React + TypeScript + Vite. No backend required.

---

<a id="中文说明"></a>

# CreepyCam 中文说明

*我看到你做了什么...*

CreepyCam 是一个基于浏览器的习惯性小动作追踪器。它通过你的摄像头和本地视觉模型，实时抓住你的无意识习惯——咬指甲、抠脸、偷吃零食等等。

## 隐私保护

**你的摄像头画面和图片永远不会离开你的电脑。**

- 你的摄像头由浏览器直接访问，没有任何服务器会接收到你的视频流。
- 你的图片由运行在**你自己电脑上的视觉模型**分析（如 Ollama、LM Studio）。
- 你的数据不会被上传、远程存储或与任何第三方共享。
- 你的检测历史仅存在于浏览器内存中，刷新页面就会清除。
- 你的设置保存在 `localStorage`，不会通过网络发送。

你应该使用**本地模型**（Ollama + Gemma 4、LLaVA 等），让一切保持完全离线。如果你选择使用远程 OpenAI 兼容 API，请注意你的图片会被发送到该服务商的服务器。

## 功能

- 按你配置的间隔定时捕获摄像头画面
- 可插拔模型提供商：**Ollama**、**LM Studio**、**OpenAI 兼容接口**
- 内置行为监测清单：吃东西、咬手、抠脸、挠头、转笔、偷吃零食、盯着摄像头
- 你可以添加自定义监测行为
- 检测到行为时向你发送浏览器通知
- 证据照片查看器，让你查看完整分辨率的图片
- 检测图（小图，送给模型）与展示图（原图，留作证据）分离
- Focused / All 切换让你过滤检测历史
- 模型思考时向你展示带实时缩略图的 pending 状态

## 部署

### 本地运行（推荐）

推荐方式——你可以避免浏览器 mixed-content 限制，一切都在 `localhost` 上完成。

```bash
git clone https://github.com/oayunac/CreepyCam.git
cd CreepyCam
npm install
npm run dev
# 打开 http://localhost:5173
```

### GitHub Pages

仓库包含 GitHub Actions 工作流，当你推送到 `main` 分支时自动部署到 Pages。

在你自己的 fork 上设置：

1. 进入 **Settings > Pages**
2. 将 Source 设为 **GitHub Actions**
3. 推送到 `main`，你的网站会自动部署

**限制：** GitHub Pages 通过 HTTPS 提供服务，会阻止你对 `http://localhost` 的请求（混合内容）。如果你用 **Chrome** 则没问题（Chrome 豁免 localhost），但 **Safari 会阻止**。如果你用 Safari 或希望完全兼容，请本地运行。

### 模型服务器设置

启动你的本地模型并启用 CORS：

**Ollama：**
```bash
OLLAMA_ORIGINS=* ollama serve
# 确保你有一个视觉模型：
ollama pull gemma4
```

**LM Studio：**
在你的服务器设置面板中启用 CORS。

## 限制

- 你需要一个支持图片输入的本地视觉模型——应用本身不包含任何模型。
- 如果你在 HTTPS（GitHub Pages）上，浏览器会阻止你对 HTTP localhost 的请求。请使用 Chrome 或本地运行。
- 你的检测精度完全取决于你选择的模型。更大的模型给你更好的结果，但速度更慢。
- 你的检测历史仅在内存中——刷新页面就会丢失。
- 自定义行为通过你写的短标签描述，模型会尽最大努力理解。

## 技术栈

React + TypeScript + Vite。无需后端。
