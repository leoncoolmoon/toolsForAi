// Shared LLM logic

const SERVERS = {
  ollama:          { group: '本地服务', label: 'Ollama',              defaultUrl: 'http://localhost:11434',               needsKey: false,      hint: '本地服务 · 默认端口 <code>11434</code>', modelsPath: '/api/tags',        modelsExtract: d => (d.models||[]).map(m=>m.name||m.model).filter(Boolean), completionPath: '/api/chat',            buildBody: (model,messages,stream) => ({model,messages,stream}), parseChunk: chunk => { try{const o=JSON.parse(chunk);return o.message?.content||'';}catch{return '';} }, isDone: chunk => { try{return JSON.parse(chunk).done===true;}catch{return false;} }, streamFormat: 'ndjson' },
  lmstudio:        { group: '本地服务', label: 'LM Studio',           defaultUrl: 'http://localhost:1234',                needsKey: false,      hint: '本地服务 · 默认端口 <code>1234</code>', modelsPath: '/v1/models',       modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,temperature:0.7,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  llamacpp:        { group: '本地服务', label: 'llama.cpp',            defaultUrl: 'http://localhost:8080',                needsKey: false,      hint: '本地服务 · 默认端口 <code>8080</code>', modelsPath: '/v1/models',       modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,temperature:0.7,max_predict:2048}), parseChunk: null, streamFormat: 'sse' },
  jan:             { group: '本地服务', label: 'Jan',                  defaultUrl: 'http://localhost:1337',                needsKey: false,      hint: '本地服务 · 默认端口 <code>1337</code>', modelsPath: '/v1/models',       modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,temperature:0.7,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  litellm:         { group: '本地服务', label: 'LiteLLM',              defaultUrl: 'http://localhost:4000',                needsKey: 'optional', hint: '本地/自托管 · 默认端口 <code>4000</code> · 统一代理 OpenAI、Claude、Gemini 等 100+ 模型', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  lmstudio_legacy: { group: '本地服务', label: 'LM Studio (旧版 <0.2.17)',     defaultUrl: 'http://localhost:1234',                needsKey: false,      hint: '旧版 API（&lt;0.2.17）', modelsPath: '/v1/models', modelsExtract: d => (Array.isArray(d)?d.map(m=>m.id||m):(d.data||[]).map(m=>m.id)).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,temperature:0.7,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  openai:          { group: '在线服务', label: 'OpenAI',               defaultUrl: 'https://api.openai.com',               needsKey: true,       hint: '在线服务 · <a href="https://platform.openai.com/api-keys" target="_blank">获取 API Key</a> · 视觉模型支持图片', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  nvidia:          { group: '在线服务', label: 'NVIDIA NIM',           defaultUrl: 'https://integrate.api.nvidia.com',     needsKey: true,       hint: '在线服务 · <a href="https://build.nvidia.com" target="_blank">获取 API Key</a> · 前缀 <code>nvapi-</code>', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  anthropic:       { group: '在线服务', label: 'Anthropic',            defaultUrl: 'https://api.anthropic.com',            needsKey: true,       hint: '在线服务 · <a href="https://console.anthropic.com/" target="_blank">获取 API Key</a>', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/messages', buildBody: (model,messages,stream) => {
    const system = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system').map(m => {
      if (Array.isArray(m.content)) {
        return {
          role: m.role,
          content: m.content.map(c => {
            if (c.type === 'image_url') {
              const base64 = c.image_url.url.split(',')[1];
              const media_type = c.image_url.url.split(';')[0].split(':')[1];
              return { type: 'image', source: { type: 'base64', media_type, data: base64 } };
            }
            return c;
          })
        };
      }
      return m;
    });
    return { model, system, messages: userMessages, max_tokens: 4096, stream };
  }, parseChunk: chunk => {
    try {
      const o = JSON.parse(chunk);
      if (o.type === 'content_block_delta') return o.delta?.text || '';
      return '';
    } catch { return ''; }
  }, isDone: chunk => {
    try { return JSON.parse(chunk).type === 'message_stop'; } catch { return false; }
  }, streamFormat: 'sse', customHeaders: (key) => ({
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  }) },
  anthropic_compat:{ group: '在线服务', label: 'Anthropic (via proxy)',defaultUrl: 'https://your-proxy.example.com',       needsKey: 'optional', hint: '需通过 OpenAI 兼容代理访问，直接请求官方端点会有 CORS 限制', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  google_compat:   { group: '在线服务', label: 'Google Gemini (via proxy)',defaultUrl: 'https://your-proxy.example.com',       needsKey: 'optional', hint: '需通过 OpenAI 兼容代理访问 Google Gemini', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  groq:            { group: '在线服务', label: 'Groq',                 defaultUrl: 'https://api.groq.com',                 needsKey: true,       hint: '在线服务 · <a href="https://console.groq.com/keys" target="_blank">获取 API Key</a>', modelsPath: '/openai/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/openai/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  mistral:         { group: '在线服务', label: 'Mistral',              defaultUrl: 'https://api.mistral.ai',               needsKey: true,       hint: '在线服务 · <a href="https://console.mistral.ai/api-keys" target="_blank">获取 API Key</a>', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  together:        { group: '在线服务', label: 'Together AI',          defaultUrl: 'https://api.together.xyz',             needsKey: true,       hint: '在线服务 · <a href="https://api.together.ai/settings/api-keys" target="_blank">获取 API Key</a>', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  openrouter:      { group: '在线服务', label: 'OpenRouter',           defaultUrl: 'https://openrouter.ai',                needsKey: true,       hint: '在线服务 · <a href="https://openrouter.ai/keys" target="_blank">获取 API Key</a> · 支持多模态模型', modelsPath: '/api/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/api/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  deepseek:        { group: '在线服务', label: 'DeepSeek',             defaultUrl: 'https://api.deepseek.com',             needsKey: true,       hint: '在线服务 · <a href="https://platform.deepseek.com/api_keys" target="_blank">获取 API Key</a>', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  siliconflow:     { group: '在线服务', label: 'SiliconFlow',          defaultUrl: 'https://api.siliconflow.cn',           needsKey: true,       hint: '在线服务 · <a href="https://cloud.siliconflow.cn/account/ak" target="_blank">获取 API Key</a> · 国内可直连', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  zhipu:           { group: '在线服务', label: '智谱 GLM',             defaultUrl: 'https://open.bigmodel.cn/api/paas/v4', needsKey: true,       hint: '在线服务 · <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank">获取 API Key</a>', modelsPath: '/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
  custom:          { group: '自定义',               label: '自定义 OpenAI 兼容端点',                defaultUrl: 'http://localhost:8000',                needsKey: 'optional', hint: '自定义 OpenAI 兼容端点 · API Key 可留空', modelsPath: '/v1/models', modelsExtract: d => (d.data||[]).map(m=>m.id).filter(Boolean), completionPath: '/v1/chat/completions', buildBody: (model,messages,stream) => ({model,messages,stream,max_tokens:2048}), parseChunk: null, streamFormat: 'sse' },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getThemeColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#888';
}

function getHeaders(serverType, apiKey) {
  const profile = SERVERS[serverType];
  let h = { 'Content-Type': 'application/json' };
  if (profile && profile.customHeaders) {
    Object.assign(h, profile.customHeaders(apiKey));
  } else if (apiKey) {
    h['Authorization'] = `Bearer ${apiKey}`;
  }
  return h;
}

function applyServerProfile(type, urlInput, hintEl, apiKeyRow, apiKeyLabel) {
  const p = SERVERS[type]; if (!p) return;
  if (urlInput) urlInput.value = p.defaultUrl;
  if (hintEl) hintEl.innerHTML = p.hint;
  if (apiKeyRow) {
    if (p.needsKey === true) {
      apiKeyRow.style.display = 'flex';
      if (apiKeyLabel) apiKeyLabel.textContent = 'API Key';
    } else if (p.needsKey === 'optional') {
      apiKeyRow.style.display = 'flex';
      if (apiKeyLabel) apiKeyLabel.textContent = 'API Key（可选）';
    } else {
      apiKeyRow.style.display = 'none';
    }
  }
}

function renderServerSelect(selectEl, defaultValue) {
  if (!selectEl) return;
  const groups = {};
  for (const [key, config] of Object.entries(SERVERS)) {
    const groupName = config.group || '其他';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push({ key, label: config.label });
  }

  selectEl.innerHTML = '';
  // Defined order to match original HTML
  const order = ['本地服务', '在线服务', '自定义'];
  const allGroups = Object.keys(groups);

  // Combine ordered groups with any others found in SERVERS
  const finalOrder = [...order];
  allGroups.forEach(g => {
    if (!finalOrder.includes(g)) finalOrder.push(g);
  });

  for (const groupName of finalOrder) {
    if (!groups[groupName]) continue;
    const group = groups[groupName];
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName;
    for (const server of group) {
      const option = document.createElement('option');
      option.value = server.key;
      option.textContent = server.label;
      if (server.key === defaultValue) option.selected = true;
      optgroup.appendChild(option);
    }
    selectEl.appendChild(optgroup);
  }
}

async function fetchModels(serverType, serverUrl, apiKey, onModelsFetched, onError) {
  const profile = SERVERS[serverType];
  const base = serverUrl.trim().replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${profile.modelsPath}`, { headers: getHeaders(serverType, apiKey) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const models = profile.modelsExtract(data);
    if (!models.length) throw new Error('无可用模型');
    onModelsFetched(models);
  } catch (e) {
    if (onError) onError(e);
  }
}

function renderModelsGrid(grid, models, selectedModels, onSelectionChange) {
  grid.innerHTML = '';
  models.forEach(m => {
    const label = document.createElement('label');
    label.className = 'model-item' + (selectedModels.has(m) ? ' selected' : '');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = selectedModels.has(m);
    const span = document.createElement('span');
    span.className = 'model-name';
    span.textContent = m;
    label.appendChild(cb);
    label.appendChild(span);
    cb.onchange = () => {
      if (cb.checked) selectedModels.add(m);
      else selectedModels.delete(m);
      label.className = 'model-item' + (selectedModels.has(m) ? ' selected' : '');
      if (onSelectionChange) onSelectionChange();
    };
    label.onclick = e => {
      if (e.target !== cb) {
        e.preventDefault();
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      }
    };
    grid.appendChild(label);
  });
}

async function* readSSE(reader) {
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t || t === 'data: [DONE]') continue;
      if (t.startsWith('data: ')) yield t.slice(6);
    }
  }
}

async function* readNDJSON(reader) {
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) if (line.trim()) yield line.trim();
  }
}

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('llm-bench-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme-btn') === saved);
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-btn');
      root.setAttribute('data-theme', theme);
      localStorage.setItem('llm-bench-theme', theme);
      document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.toggle('active', b === btn));
    });
  });
}
