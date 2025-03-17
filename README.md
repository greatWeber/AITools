# Local Chat AI 应用

这是一个基于现代 Web 技术栈构建的本地聊天 AI 应用，支持实时流式对话，提供流畅的聊天体验。使用 Trae 生成代码

## 技术栈

### 后端

fork [LLM-Red-Team/qwen-free-api](https://github.com/LLM-Red-Team/qwen-free-api),在本地运行阿里通义千问 2.5 大模型逆向 API

> 下面的已经弃用

- Node.js
- Express.js
- @huggingface/inference - HuggingFace 推理 API 客户端
- CORS 支持

### 前端

- React
- Vite
- Modern CSS

## 功能特点

- 实时流式对话响应
- 基于 通义千问 2.5 模型的智能对话
- 现代化的用户界面
- 支持 Docker 容器化部署

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 本地开发

1. 克隆项目后，分别在根目录和 client 目录安装依赖：

```bash
# 在根目录安装服务端依赖
npm install

# 进入client目录安装前端依赖
cd client
npm install
```

2. 配置环境变量

在项目根目录创建`.env`文件，添加以下配置：

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

3. 启动开发服务器

```bash
# 启动后端服务
npm start

# 新开一个终端，进入client目录启动前端开发服务器
cd client
npm run dev
```

### Docker 部署

项目支持使用 Docker Compose 进行容器化部署：

1. 确保已安装 Docker 和 Docker Compose

2. 在项目根目录执行：

```bash
docker-compose up -d
```

服务将在以下地址启动：

- 前端：http://localhost:8888
- 后端 API：http://127.0.0.1:8000

## API 接口

### POST /chat

发送聊天消息并获取 AI 响应

请求体：

```json
{
  "message": "你的问题"
}
```

响应：Server-Sent Events (SSE) 格式的实时响应流

## 注意事项

- 本地开发时需要同时启动前端和后端服务
- Docker 部署时会自动处理所有依赖和服务启动

## License

MIT
