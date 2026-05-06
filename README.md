## 1. LITELLM Performance Monitor

一个仿 Windows Task Manager Performance 风格的 LM Studio 远程工作状态监控面板，单文件 HTML，无需安装，打开即用。

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
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

1. 下载 `litellm-performance.html`
2. 用任意浏览器打开（直接双击即可）
3. 在顶栏输入服务所在机器的 IP 地址，端口和api key（默认 `localhost:4000`）
4. 点击「连接」

> **本地使用**：直接 `localhost:4000` 输入api key 即可，无需额外配置。

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


## License

MIT — 自由使用、修改和分发。



## 2.LLM Benchmark 工具

一个强大的大语言模型性能测试工具，支持多种本地和在线服务，提供灵活的测试队列管理功能。

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

### 📋 功能特性

#### 核心功能
- **多服务支持**：支持 Ollama、LM Studio、llama.cpp、 litellm、Jan 等本地服务，以及 OpenAI、Groq、Together AI、OpenRouter、DeepSeek 等在线服务
- **自定义端点**：支持任何 OpenAI 兼容的自定义端点
- **批量模型测试**：同时测试多个模型，对比性能和质量
- **上下文模式**：
  - 无上下文：每题独立测试
  - 滑动窗口：保留最近 N 轮对话历史
  - 完整上下文：保留全部历史对话

#### 🆕 增强功能（v2.0）
- **动态队列管理**：测试开始后可以动态添加或删除待测模型
- **停止测试按钮**：支持随时中断测试过程
- **智能队列操作**：
  - 为每个排队模型提供删除按钮（仅对未开始的模型有效）
  - 防止重复添加已测试或排队中的模型
- **实时进度追踪**：清晰显示当前测试进度和队列状态

### 🚀 快速开始

#### 环境要求
- 现代浏览器（Chrome、Firefox、Edge、Safari 等）
- 本地服务需要相应的后端服务运行

#### 使用步骤

1. **打开工具**
   ```bash
   # 直接在浏览器中打开 HTML 文件
   open llm-benchmark.html
   ```

2. **配置服务**
   - 选择服务类型（Ollama、LM Studio、OpenAI 等）
   - 填写服务地址和 API Key（如果需要）
   - 点击「获取模型」按钮

3. **选择模型**
   - 从列表中勾选要测试的模型
   - 支持多选

4. **编写测试题目**
   - 在文本框中输入测试题目，每行一道
   - 示例：
     ```
     解释一下什么是量子纠缠
     用 Python 写一个二分查找函数
     地球距离太阳多远？
     ```

5. **设置上下文模式**
   - 选择适合的上下文模式
   - 如选滑动窗口，可设置保留轮数

6. **开始测试**
   - 点击「开始测试」按钮
   - 测试过程中可以：
     - 点击「停止测试」中断运行
     - 点击「加入测试列表」添加更多模型
     - 点击排队模型右侧的「✖ 移除」按钮删除未开始的模型

7. **查看结果**
   - 测试完成后自动生成结果面板
   - 可以展开/折叠各个模型的详细回答
   - 点击「下载结果」导出测试报告

### 📖 服务配置说明

#### 本地服务

| 服务 | 默认地址 | 说明 |
|------|---------|------|
| Ollama | http://localhost:11434 | 需运行 `ollama serve` |
| LM Studio | http://localhost:1234 | 需在 LM Studio 中启动 Local Server |
| llama.cpp | http://localhost:8080 | 需添加 `--api` 参数启动 |
| Jan | http://localhost:1337 | 需在 Jan 中开启 Local API Server |

#### 在线服务

| 服务 | 默认地址 | 需要 API Key | 常用模型示例 |
|------|---------|-------------|-------------|
| OpenAI | https://api.openai.com | ✅ | gpt-4o, gpt-4o-mini |
| Groq | https://api.groq.com | ✅ | 超快推理模型 |
| Together AI | https://api.together.xyz | ✅ | 众多开源模型 |
| OpenRouter | https://openrouter.ai | ✅ | 几乎所有主流模型 |
| DeepSeek | https://api.deepseek.com | ✅ | deepseek-chat |

### 🔧 高级功能

#### 动态队列管理

测试开始后，您可以通过以下方式管理待测模型队列：

1. **添加模型**：
   - 勾选上方面板中的其他模型
   - 点击「加入测试列表」按钮
   - 新模型会追加到队列末尾，等待当前模型测试完成后自动开始

2. **删除模型**：
   - 在 resultsArea 中，每个排队中的模型右侧都有「✖ 移除」按钮
   - 仅对尚未开始测试的模型有效
   - 已经开始或完成的模型无法删除（防止数据错乱）

#### 测试报告格式

下载的报告包含：
- 测试时间、服务类型、地址
- 测试模型列表
- 每道题的完整题目和回答
- 每个回答的耗时统计
- 评估建议模板（准确性、完整性、表达清晰度等评分维度）

### 💡 使用建议

1. **题目设计**：
   - 建议设计 3-10 道具有代表性的题目
   - 涵盖不同难度和类型（知识问答、代码生成、推理等）

2. **上下文窗口**：
   - 独立题目测试：选择「无上下文」
   - 对话连贯性测试：选择「滑动窗口」，保留 3-5 轮
   - 长对话压力测试：选择「完整上下文」（注意模型上下文限制）

3. **性能优化**：
   - 本地服务测试速度更快，适合快速迭代
   - 在线服务需要稳定的网络连接
   - 同时测试多个模型时，注意 API 速率限制

4. **队列管理技巧**：
   - 测试开始前勾选所有需要测试的模型
   - 测试过程中发现需要补充对比的模型，可以随时添加
   - 不需要等待的模型可以立即从队列中删除

### 🛠️ 故障排除

#### 常见问题

**Q: 点击「获取模型」失败？**
- 检查服务是否正常运行
- 确认地址和端口号正确
- 检查防火墙/代理设置

**Q: 测试过程中报错怎么办？**
- 查看具体错误信息
- 检查 API Key 是否有效（在线服务）
- 确认模型已正确加载

**Q: 添加模型后没有出现在队列中？**
- 检查该模型是否已经在队列中或已完成测试
- 确认已勾选该模型
- 刷新页面重试

**Q: 删除按钮不可用？**
- 只能删除排队中尚未开始的模型
- 已经开始或已完成的模型不可删除（按钮会禁用或消失）

### 📄 技术细节

#### API 兼容性
- 使用标准的 OpenAI Chat Completion API 格式
- 支持 SSE（Server-Sent Events）和 NDJSON 流式响应
- 自动适配不同服务的响应格式

#### 数据安全
- API Key 仅存储于浏览器内存，不会上传到任何服务器
- 测试数据完全在本地处理
- 下载的报告文件保存在本地

### 🔮 未来计划

- [ ] 支持更多上下文模式
- [ ] 结果对比视图（图表形式）
- [ ] 测试结果持久化存储
- [ ] 批量导入测试题目
- [ ] 支持自定义评分模型
- [ ] 导出 CSV/Excel 格式报告

### 📝 更新日志

#### v2.0 (2026-05-01)
- ✨ 新增动态队列管理功能
- ✨ 新增停止测试按钮
- ✨ 新增实时添加/删除待测模型
- 🐛 修复上下文模式切换时的历史记录问题
- 🎨 优化 UI 布局和交互体验

#### v1.0
- 🎉 初始版本发布
- 基础的多模型对比测试功能

### 📧 反馈与贡献

如有问题或建议，欢迎提交 Issue 或 Pull Request。

### 📄 许可证

MIT License - 自由使用、修改和分发。

