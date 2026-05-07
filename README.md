# LLM 测试工具集 · 双引擎评测工作台

> 一套强大的本地 Web 工具集，专为 LLM 网关监控与模型批量评测设计。  
> 无需复杂后端，开箱即用，支持 OpenAI 兼容接口、LiteLLM、Ollama、LM Studio 等主流推理引擎。

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![WebApp](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-important)]()
![Version](https://img.shields.io/badge/version-1.0-blue.svg)
---

## 📦 项目概览

本项目包含两个核心页面，形成完整的 LLM 工程闭环：

| 工具 | 文件名 | 核心职责 |
|------|--------|-----------|
| **LiteLLM 观测站** | `litellm-performance.html` | 实时监控 LiteLLM 网关指标（请求速率、并发、Token 消耗、模型用量），并提供交互式测试能力。 |
| **LLM 批量测试台** | `LLMtester.html` | 支持多模型对比测试，灵活管理测试队列，自定义上下文策略，流式输出评测结果。 |

> 📁 目录结构建议  
> ```
> /your-project-folder/
>   ├── index.html                  (本项目导航首页)
>   ├── litellm-performance.html    (观测站)
>   ├── LLMtester.html              (批量评测)
>   └── README.md
> ```

---

## 🚀 快速开始

### 1️⃣ 环境要求
- 现代浏览器（Chrome / Edge / Firefox，支持 ES2020）
- 本地或远程可访问的 LLM API 服务（例如 LiteLLM、Ollama、LM Studio、OpenAI 等）

### 2️⃣ 启动方式
直接将项目文件夹放置于任意 Web 服务下（或双击 `index.html` 使用 `file://` 协议，但部分跨域限制需注意——推荐使用本地静态服务器）。

#### 使用 Python 快速启动（推荐）
```bash
# 进入项目目录
cd llm-toolkit
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

#### 使用 VS Code Live Server 或任意 HTTP Server 均可

### 3️⃣ 配置与连接
- **LiteLLM 观测站**：在页面顶部输入 LiteLLM 地址（默认 `http://localhost:4000`）及可选 Master Key，点击「连接」即可。
- **LLM 批量测试台**：选择服务器类型（Ollama / LM Studio / llama.cpp / OpenAI 等），填写 API 地址与密钥，点击「获取模型」加载待测模型列表。

---

## 🧭 工具详解

### 🔎 LiteLLM 观测站 (`litellm-performance.html`)

> 专业级 LiteLLM 网关可观测性面板，基于 Prometheus 指标动态渲染

**特性**
- **实时指标卡片**：展示 In-Flight 并发、总请求数、失败数、总 Token、错误率等关键信息。
- **双走势图**：并发请求历史曲线 + 请求速率增量图。
- **模型用量表格**：按模型聚合请求量、失败次数、Input/Output Token、Token 占比进度条。
- **主动测试抽屉 (Test & Measure)**：选择模型、自定义 Prompt、实时计算 TTFT (Time To First Token)、生成吞吐 (tok/s) 和耗时详情，流式输出答案。
- **自动轮询**：可配置轮询间隔（3s / 5s / 10s / 30s），日志面板记录每次轮询状态。
- **明暗主题**：支持 light / dark / system 跟随。

**适用场景**：  
- 监控 LiteLLM 生产网关的健康度  
- 分析不同模型的 Token 成本与请求失败率  
- 快速试探模型响应速度（TTFT / tok/s）

> 💡 要求 LiteLLM 启动时启用 `/metrics` 端点（默认 Prometheus 已开启），并开放 `/health/backlog` 以获取并发数。

---

### 🧪 LLM 批量测试台 (`LLMtester.html`)

> 支持多后端、动态队列、上下文记忆的模型基准测试工具

**核心亮点**
- **多服务支持**：内置 Ollama / LM Studio / llama.cpp / Jan / LiteLLM / OpenAI / Groq / Together / DeepSeek / OpenRouter 等配置模板。
- **灵活模型选择**：从 API 自动拉取模型列表，多选加入待测队列。
- **考题自定义**：文本域每行一道题，支持任意数量问题。
- **三种上下文模式**：
  - 无上下文：每题独立
  - 滑动窗口：保留最近 N 轮对话（默认 3 轮）
  - 完整上下文（谨慎用于长对话）
- **动态测试队列**：测试过程中可「加入测试列表」增加新模型，也可跳过当前模型或删除排队中的模型，无需重新开始。
- **模型间延时**：可配置延时（默认 60 秒），避免请求过密。
- **结果查看与导出**：每个模型折叠/展开详情，显示每道题的回答、耗时，支持一键下载 TXT 报告。

**适用场景**：  
- 对比本地多个模型的回答质量与响应速度  
- 测试模型在多轮对话下的上下文记忆能力  
- 批量回归评测，验证模型更新后的效果

---

## 🛠️ 常见配置示例

### LiteLLM 观测站连接参数
| 字段 | 示例值 | 说明 |
|------|--------|------|
| IP / Host | `localhost` 或 `127.0.0.1` | LiteLLM 服务地址 |
| Port | `4000` | 默认端口，可自定义 |
| Master Key | `sk-xxxx` | 若 LiteLLM 设置了代理密钥则填写，否则留空 |

### LLM 批量测试台配置示例

| 后端 | 默认地址 | 是否需要 API Key | 模型路径 |
|------|----------|----------------|----------|
| LM Studio | `http://localhost:1234` | ❌ | `/v1/models` |
| Ollama | `http://localhost:11434` | ❌ | `/api/tags` |
| llama.cpp | `http://localhost:8080` | ❌ | `/v1/models` |
| OpenAI | `https://api.openai.com` | ✅ | `/v1/models` |
| DeepSeek | `https://api.deepseek.com` | ✅ | `/v1/models` |

---

## 📸 界面预览

> 由于纯 Markdown 无法展示动态图像，建议直接运行项目体验。

- **观测站**：顶部仪表板 → 多卡片指标 → 模型排行表格 → 右侧测试面板。
- **批量测试台**：服务器配置卡 → 模型网格 → 题库区域 → 上下文控件 → 实时结果卡片。

---

## ❓ 常见问题 (FAQ)

### 1. LiteLLM 观测站无法获取指标？
- 确认 LiteLLM 服务正常运行，并且 `/metrics` 端点可访问（默认 `http://localhost:4000/metrics`）。
- 若配置了 API 密钥，请填写 Master Key。
- 检查浏览器控制台是否有 CORS 错误（若跨域可配置 LiteLLM `--allowed_origins` 或使用代理）。

### 2. 批量测试台点击「获取模型」无反应？
- 检查服务器地址是否正确（例如 LM Studio 默认端口 1234， Ollama 默认 11434）。
- 对于 OpenAI 类服务，确保 API Key 有效且在「API Key」行已填写。
- 部分服务（如 llama.cpp）需启用 API 服务器模式。

### 3. 流式回答不显示？
- 确保您选择的服务支持 Stream 模式 (OpenAI 兼容接口通常默认支持)。
- 部分旧版 LM Studio (<0.2.17) 请在「服务器类型」中选择 **LM Studio (旧版 &lt;0.2.17)**。

### 4. 能否同时测试多个模型？
- 可以。在 LLM 批量测试台中通过复选框选择多个模型，开始测试后会自动串行执行（按选定模型顺序），并且测试过程中可动态追加新模型。

---

## 📄 许可证

本项目基于 **MIT License** 开源，可自由修改、分发及用于商业用途。请保留原始版权声明。

---

## 🤝 贡献与反馈

欢迎提交 Issue 或 Pull Request 改进工具。  
若您有更好的监控指标展示方式或评测功能建议，期待交流！

**项目维护**: 开源爱好者  
**交流话题**: LiteLLM 监控、LLM 评测自动化、推理性能优化

---

## 🌟 致谢

- [LiteLLM](https://github.com/BerriAI/litellm) — 统一的 LLM 网关
- [Chart.js](https://www.chartjs.org/) — 轻量级图表渲染
- 所有本地推理引擎开发者 (Ollama / LM Studio / llama.cpp)

> 让模型测试更透明，让性能调优更简单。
