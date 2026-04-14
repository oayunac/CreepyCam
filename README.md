# CreepyCam

*I see what you did there...*

CreepyCam is a browser-based habitual behavior tracker that uses your webcam and a local vision model to detect unconscious habits in real time — biting nails, picking your face, sneaking snacks, and more.

**[Live Demo (GitHub Pages)](https://oayunac.github.io/CreepyCam/)** | [中文说明](#中文说明)

---

## Privacy First

**Your camera feed and images never leave your machine.**

- The webcam is accessed directly by your browser — no server receives the video stream.
- Image analysis is performed by a vision model running **on your own computer** (e.g., Ollama, LM Studio).
- No data is uploaded, stored remotely, or shared with any third party.
- Detection history lives only in your browser's memory and is lost on page refresh.
- Settings are saved in `localStorage` — nothing is sent over the network.

We strongly recommend using a **local model** (Ollama + Gemma 4, LLaVA, etc.) to keep everything completely offline. While the app supports OpenAI-compatible endpoints, using a remote API means your images will be sent to that provider's servers.

## Features

- Periodic webcam capture with configurable interval
- Pluggable model providers: **Ollama**, **LM Studio**, **OpenAI-compatible**
- Built-in behavior watchlist: eating, biting hand, picking face, scratching head, pen spinning, sneaking snacks, staring at camera
- Add your own custom behaviors to watch for
- Browser notifications on detection
- Evidence photo viewer with full-resolution images
- Detection image (small, for model) and display image (full-res, for evidence) are separate
- Focused / All toggle to filter detection history
- Pending detection indicator with live thumbnail

## Deploy

### Run Locally (Recommended)

This is the recommended way — avoids mixed-content browser restrictions and keeps everything on `localhost`.

```bash
git clone https://github.com/oayunac/CreepyCam.git
cd CreepyCam
npm install
npm run dev
# Open http://localhost:5173
```

### GitHub Pages

The repo includes a GitHub Actions workflow that auto-deploys to Pages on push to `main`.

To set it up on your own fork:

1. Go to **Settings > Pages**
2. Set Source to **GitHub Actions**
3. Push to `main` — the site will be deployed automatically

**Limitation:** GitHub Pages serves over HTTPS, which blocks requests to `http://localhost` (mixed content). This works in **Chrome** (which exempts localhost), but **Safari blocks it**. For Safari or full compatibility, run locally.

### Model Server Setup

Start your local model with CORS enabled:

**Ollama:**
```bash
OLLAMA_ORIGINS=* ollama serve
# Make sure you have a vision model:
ollama pull gemma4
```

**LM Studio:**
Enable CORS in the server settings panel.

## Limitations

- Requires a local vision model that supports image input — the app does not include any model.
- HTTPS (GitHub Pages) to HTTP (localhost) is blocked by Safari and some browsers. Use Chrome or run locally.
- Detection accuracy depends entirely on the model you use. Larger models are more accurate but slower.
- Detection history is in-memory only — refreshing the page clears it.
- Custom behaviors are described by a short label; the model interprets them on a best-effort basis.

## Tech Stack

React + TypeScript + Vite. No backend required.

---

<a id="中文说明"></a>

# CreepyCam 中文说明

*我看到你做了什么...*

CreepyCam 是一个基于浏览器的习惯性小动作追踪器。它通过摄像头和本地视觉模型，实时检测你的无意识习惯——咬指甲、抠脸、偷吃零食等等。

## 隐私保护

**你的摄像头画面和图片永远不会离开你的电脑。**

- 摄像头由浏览器直接访问，没有任何服务器接收视频流。
- 图像分析由运行在**你自己电脑上的视觉模型**完成（如 Ollama、LM Studio）。
- 没有数据被上传、远程存储或与任何第三方共享。
- 检测历史仅存在于浏览器内存中，刷新页面即清除。
- 设置保存在 `localStorage`，不会通过网络发送。

我们强烈建议使用**本地模型**（Ollama + Gemma 4、LLaVA 等），保持一切完全离线。虽然应用支持 OpenAI 兼容接口，但使用远程 API 意味着你的图片将被发送到该服务商的服务器。

## 功能

- 可配置间隔的定时摄像头截图
- 可插拔模型提供商：**Ollama**、**LM Studio**、**OpenAI 兼容接口**
- 内置行为监测清单：吃东西、咬手、抠脸、挠头、转笔、偷吃零食、盯着摄像头
- 支持添加自定义监测行为
- 检测到行为时发送浏览器通知
- 证据照片查看器，保留完整分辨率
- 检测图（小图，送模型）与展示图（原图，留证据）分离
- Focused / All 切换过滤检测历史
- API 调用期间显示 pending 状态指示器

## 部署

### 本地运行（推荐）

推荐方式——避免浏览器 mixed-content 限制，一切都在 `localhost` 上完成。

```bash
git clone https://github.com/oayunac/CreepyCam.git
cd CreepyCam
npm install
npm run dev
# 打开 http://localhost:5173
```

### GitHub Pages

仓库包含 GitHub Actions 工作流，推送到 `main` 分支自动部署到 Pages。

在你自己的 fork 上设置：

1. 进入 **Settings > Pages**
2. 将 Source 设为 **GitHub Actions**
3. 推送到 `main`，网站会自动部署

**限制：** GitHub Pages 通过 HTTPS 提供服务，会阻止对 `http://localhost` 的请求（混合内容）。**Chrome** 允许 localhost 例外，但 **Safari 会阻止**。建议使用 Chrome 或本地运行。

### 模型服务器设置

启动本地模型并启用 CORS：

**Ollama：**
```bash
OLLAMA_ORIGINS=* ollama serve
# 确保你有一个视觉模型：
ollama pull gemma4
```

**LM Studio：**
在服务器设置面板中启用 CORS。

## 限制

- 需要支持图片输入的本地视觉模型——应用本身不包含任何模型。
- HTTPS（GitHub Pages）到 HTTP（localhost）的请求会被 Safari 等浏览器阻止。请使用 Chrome 或本地运行。
- 检测精度完全取决于你使用的模型。更大的模型更准确但更慢。
- 检测历史仅在内存中——刷新页面会清除。
- 自定义行为通过短标签描述，模型会尽最大努力理解。

## 技术栈

React + TypeScript + Vite。无需后端。
