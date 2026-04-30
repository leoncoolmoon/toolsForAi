## LM Studio Performance Monitor

一个仿 Windows Task Manager Performance 风格的 LM Studio 远程工作状态监控面板，单文件 HTML，无需安装，打开即用。

---

### 功能特性

- **实时连接** — 输入目标机器 IP 和端口，一键连接 LM Studio REST API
- **性能图表** — Tokens/sec 与 TTFT 历史折线，滚动记录最近 60 次数据
- **迷你火花图** — 顶部摘要卡片内置趋势迷你图
- **模型侧边栏** — 左侧列出所有模型，已加载/未加载分组，点击查看详情
- **请求历史表** — 记录每次请求的完整统计数据，支持最多 200 条
- **自动刷新** — 可选 3s / 5s / 10s 间隔自动轮询模型列表
- **主题切换** — 支持浅色、暗色、跟随系统三种模式，偏好持久化
- **JSON 粘贴导入** — 将 LM Studio 返回的完整 JSON 粘贴到页面，自动提取统计数据

---

### 快速开始

1. 下载 `lmstudio-performance.html`
2. 用任意浏览器打开（直接双击即可）
3. 在顶栏输入 LM Studio 所在机器的 IP 地址和端口（默认 `localhost:1234`）
4. 点击「连接」

> **本地使用**：直接 `localhost:1234` 即可，无需额外配置。

---

### 界面说明

#### LMS Monitor 仪表板

| 控件区域 | 状态指示 |
| :--- | :--- |
| ● LMS Monitor  `[IP]:[Port]` [连接] | ◉ ONLINE   AUTO ▼   ☀◑⊙ 时钟 |

##### 性能指标

| 模型侧边栏 | 实时指标 | 延迟指标 |
| :--- | :--- | :--- |
| **模型** | Tok/s | TTFT |
| **侧边栏** | Gen Time | Tokens |
| **Requests** | | |
| **已加载** | **Tokens/s 折线图** | **TTFT 折线图** |
| **未加载** | **模型详细信息** (架构/量化/格式…) | **请求历史表格** (时间/TPS/TTFT/Gen/Tokens…) |

#### 顶部摘要卡片

| 指标 | 说明 |
|------|------|
| **Tokens / sec** | 推理吞吐量，越高越好 |
| **TTFT** | 首字延迟（Time to First Token），单位 ms，越低越好 |
| **Gen Time** | 总生成耗时，单位秒 |
| **Tokens Used** | 本次请求的 prompt / completion token 数 |
| **Requests** | 本次会话已采集的请求总数 |

#### 性能图表

左上 — **Tokens/sec 历史**，蓝色折线，对应 CPU 使用率曲线。  
右上 — **TTFT 历史**，绿色折线，反映响应延迟变化趋势。

#### 模型信息格

选中左侧模型后展示：

- Model ID、State（已加载 / 未加载）
- Architecture（架构）、Quantization（量化）
- Format（格式）、Context（最大上下文）
- Publisher（发布者）、Type（类型）

---

### 主题切换

顶栏右侧三个按钮：

| 按钮 | 模式 |
|------|------|
| ☀ | 浅色模式（白底深字） |
| ◑ | 暗色模式（黑底亮字，默认） |
| ⊙ | 跟随系统（自动响应系统深色/浅色设置） |

主题偏好会保存在 `localStorage`，下次打开自动恢复。

---

### 数据来源说明

面板从以下 LM Studio API 端点获取数据：

| 端点 | 用途 |
|------|------|
| `GET /api/v0/models` | 获取模型列表与状态 |
| `POST /api/v0/chat/completions` | 发送探测请求，采集 stats |

响应中的增强统计字段：

```json
{
  "stats": {
    "tokens_per_second": 51.4,
    "time_to_first_token": 0.111,
    "generation_time": 0.954,
    "stop_reason": "eosFound"
  },
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 53,
    "total_tokens": 77
  },
  "model_info": {
    "arch": "llama",
    "quant": "Q4_K_M",
    "format": "gguf",
    "context_length": 4096
  },
  "runtime": {
    "name": "llama.cpp-win-x86_64-nvidia-cuda-avx2",
    "version": "1.26.0"
  }
}
```

---

### JSON 粘贴导入

如果因 CORS 限制无法直接连接远程机器，可以手动导入数据：

1. 在 LM Studio 或其他客户端向 `/api/v0/chat/completions` 发送请求
2. 复制完整的 JSON 响应
3. 在面板页面按 `Ctrl+V` 粘贴
4. 面板自动提取 stats 并更新图表和历史记录

---

### CORS 注意事项

浏览器的同源策略可能阻止跨域请求。解决方法：

**方法一（推荐）**：在 LM Studio 的 `Developer → Server Settings` 中开启 **Allow CORS**。

**方法二**：将 HTML 文件放在与 LM Studio 同一台机器上，用 `localhost` 访问。

**方法三**：使用 JSON 粘贴导入功能（见上文），完全绕过跨域限制。

---

### 系统要求

- LM Studio `0.3.x` 及以上（需开启本地 API Server）
- 任意现代浏览器（Chrome / Edge / Firefox / Safari）
- 无需 Node.js、Python 或任何其他依赖

---

### 文件结构

```
lmstudio-performance.html   # 全部功能，单文件，无外部依赖（CDN 加载 Chart.js 和字体）
README.md                   # 本文档
```

---

## License

MIT — 自由使用、修改和分发。
