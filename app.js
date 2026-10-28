/**
 * OmniRouter AI - Next-Gen General Purpose AI Chatbot Studio
 * Client-Side OpenRouter Integration & State Management
 */

(function () {
  'use strict';

  // ==========================================================================
  // Default Curated Models & Catalog
  // ==========================================================================
  const CURATED_MODELS = [
    {
      id: 'deepseek/deepseek-r1:free',
      name: 'DeepSeek R1 (Free)',
      provider: 'DeepSeek',
      context: '64k',
      pricing: 'FREE',
      tags: ['free', 'reasoning'],
      description: 'Open-weights reasoning frontier model with chain-of-thought capabilities.'
    },
    {
      id: 'deepseek/deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'DeepSeek',
      context: '64k',
      pricing: '$0.55 / $2.19',
      tags: ['reasoning', 'flagship'],
      description: 'Full unmetered DeepSeek R1 reasoning model with incredible math & code skills.'
    },
    {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek V3',
      provider: 'DeepSeek',
      context: '64k',
      pricing: '$0.14 / $0.28',
      tags: ['fast', 'flagship'],
      description: 'Extremely fast 671B MoE model rivaling top proprietary models.'
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (Free)',
      provider: 'Google',
      context: '1M',
      pricing: 'FREE',
      tags: ['free', 'fast'],
      description: 'Next-gen multimodal speed & reasoning from Google with 1M context.'
    },
    {
      id: 'google/gemini-2.0-flash-001',
      name: 'Gemini 2.0 Flash',
      provider: 'Google',
      context: '1M',
      pricing: '$0.10 / $0.40',
      tags: ['fast', 'flagship'],
      description: 'High-speed production Gemini 2.0 model with massive context window.'
    },
    {
      id: 'anthropic/claude-3.7-sonnet',
      name: 'Claude 3.7 Sonnet',
      provider: 'Anthropic',
      context: '200k',
      pricing: '$3.00 / $15.00',
      tags: ['flagship', 'reasoning'],
      description: 'Anthropic flagship model featuring hybrid fast-thinking and deep reasoning.'
    },
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      context: '200k',
      pricing: '$3.00 / $15.00',
      tags: ['flagship'],
      description: 'Exceptional coding, nuanced reasoning, and articulate writing.'
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      context: '128k',
      pricing: '$2.50 / $10.00',
      tags: ['flagship'],
      description: 'Flagship versatile intelligence for complex instructions, analysis, and creative tasks.'
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      context: '128k',
      pricing: '$0.15 / $0.60',
      tags: ['fast'],
      description: 'Fast, lightweight and cost-effective general assistant.'
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      name: 'Llama 3.3 70B (Free)',
      provider: 'Meta',
      context: '128k',
      pricing: 'FREE',
      tags: ['free', 'fast'],
      description: 'Meta open flagship 70B model with GPT-4-class performance.'
    },
    {
      id: 'mistralai/mistral-small-24b-instruct-2501:free',
      name: 'Mistral Small 24B (Free)',
      provider: 'Mistral',
      context: '32k',
      pricing: 'FREE',
      tags: ['free', 'fast'],
      description: 'Efficient, high-speed conversational model by Mistral AI.'
    },
    {
      id: 'qwen/qwen-2.5-72b-instruct',
      name: 'Qwen 2.5 72B',
      provider: 'Alibaba',
      context: '128k',
      pricing: '$0.35 / $0.40',
      tags: ['fast', 'flagship'],
      description: 'Powerful open-weight multilingual and coding powerhouse.'
    }
  ];

  // System Prompt Presets
  const SYSTEM_PRESETS = {
    default: "You are OmniRouter AI, a knowledgeable, helpful, and versatile AI assistant. Answer queries thoroughly, provide structured insights, and write clean, formatted code when requested.",
    architect: "You are a Senior Principal Software Architect. Focus on robust, scalable system architecture, clean modular code, design patterns, security best practices, and edge-case handling. Provide concrete code and explain trade-offs clearly.",
    concise: "You are a direct, concise executive assistant. Provide bullet points and actionable summaries. Omit unnecessary pleasantries, disclaimers, and filler. Be brief, punchy, and direct.",
    writer: "You are a master creative writer and editor. Craft vivid, evocative prose with impeccable rhythm, rich metaphors, and engaging storytelling while maintaining clarity.",
    researcher: "You are an analytical academic researcher and scientist. Approach questions with scientific rigor, cite principles, evaluate evidence critically, and explain nuanced concepts step-by-step."
  };

  // ==========================================================================
  // Application State
  // ==========================================================================
  const State = {
    apiKey: localStorage.getItem('omnirouter_api_key') || '',
    selectedModel: localStorage.getItem('omnirouter_selected_model') || 'deepseek/deepseek-r1:free',
    systemPrompt: localStorage.getItem('omnirouter_system_prompt') || SYSTEM_PRESETS.default,
    temperature: parseFloat(localStorage.getItem('omnirouter_temperature') || '0.7'),
    maxTokens: parseInt(localStorage.getItem('omnirouter_max_tokens') || '4096', 10),
    chats: [],
    activeChatId: null,
    customModels: JSON.parse(localStorage.getItem('omnirouter_custom_models') || '[]'),
    allModels: [],
    activeFilter: 'all',
    searchQuery: '',
    isStreaming: false,
    abortController: null
  };

  // Combine curated and custom models initially
  State.allModels = [...State.customModels, ...CURATED_MODELS];

  // ==========================================================================
  // DOM References
  // ==========================================================================
  const DOM = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
    sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
    newChatBtn: document.getElementById('new-chat-btn'),
    searchChatsInput: document.getElementById('search-chats-input'),
    chatsList: document.getElementById('chats-list'),
    apiKeyStatusPill: document.getElementById('api-key-status-pill'),
    apiStatusDot: document.getElementById('api-status-dot'),
    apiKeyLabel: document.getElementById('api-key-label'),
    apiKeySubtext: document.getElementById('api-key-subtext'),

    // Chat Header & Main
    currentModelDisplay: document.getElementById('current-model-display'),
    currentModelTag: document.getElementById('current-model-tag'),
    openModelModalBtn: document.getElementById('open-model-modal-btn'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    systemPromptBtn: document.getElementById('system-prompt-btn'),
    exportChatBtn: document.getElementById('export-chat-btn'),
    clearChatBtn: document.getElementById('clear-chat-btn'),

    // Viewport
    messagesContainer: document.getElementById('messages-container'),
    welcomeScreen: document.getElementById('welcome-screen'),
    messagesList: document.getElementById('messages-list'),
    scrollAnchor: document.getElementById('scroll-anchor'),
    apiKeyBanner: document.getElementById('api-key-banner'),
    bannerAddKeyBtn: document.getElementById('banner-add-key-btn'),

    // Input Bar
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    stopGenerationBtn: document.getElementById('stop-generation-btn'),
    quickbarModelPill: document.getElementById('quickbar-model-pill'),
    quickbarModelName: document.getElementById('quickbar-model-name'),
    quickbarFreeBadge: document.getElementById('quickbar-free-badge'),
    quickbarTempVal: document.getElementById('quickbar-temp-val'),
    quickbarReasoningVal: document.getElementById('quickbar-reasoning-val'),

    // Model Modal
    modelModal: document.getElementById('model-modal'),
    closeModelModalBtn: document.getElementById('close-model-modal-btn'),
    modelSearchInput: document.getElementById('model-search-input'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    modelsGrid: document.getElementById('models-grid'),
    syncModelsBtn: document.getElementById('sync-models-btn'),
    modelCountText: document.getElementById('model-count-text'),
    openCustomModelBtn: document.getElementById('open-custom-model-btn'),

    // Custom Model Modal
    customModelModal: document.getElementById('custom-model-modal'),
    closeCustomModelModalBtn: document.getElementById('close-custom-model-modal-btn'),
    cancelCustomModelBtn: document.getElementById('cancel-custom-model-btn'),
    saveCustomModelBtn: document.getElementById('save-custom-model-btn'),
    customModelIdInput: document.getElementById('custom-model-id-input'),
    customModelNameInput: document.getElementById('custom-model-name-input'),
    customModelProviderInput: document.getElementById('custom-model-provider-input'),
    customModelContextInput: document.getElementById('custom-model-context-input'),
    customModelIsReasoning: document.getElementById('custom-model-is-reasoning'),
    customModelIsFree: document.getElementById('custom-model-is-free'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'),
    apiKeyInput: document.getElementById('api-key-input'),
    toggleKeyVisibilityBtn: document.getElementById('toggle-key-visibility-btn'),
    verifyKeyBtn: document.getElementById('verify-key-btn'),
    keyVerificationStatus: document.getElementById('key-verification-status'),
    temperatureSlider: document.getElementById('temperature-slider'),
    tempDisplay: document.getElementById('temp-display'),
    maxTokensInput: document.getElementById('max-tokens-input'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    clearKeyBtn: document.getElementById('clear-key-btn'),

    // System Prompt Modal
    systemModal: document.getElementById('system-modal'),
    closeSystemModalBtn: document.getElementById('close-system-modal-btn'),
    systemPromptTextarea: document.getElementById('system-prompt-textarea'),
    presetChips: document.querySelectorAll('.preset-chip'),
    resetSystemBtn: document.getElementById('reset-system-btn'),
    saveSystemBtn: document.getElementById('save-system-btn'),

    // Toast
    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================================================
  // Helper Utilities
  // ==========================================================================
  function generateId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
    `;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom(smooth = true) {
    DOM.messagesContainer.scrollTo({
      top: DOM.messagesContainer.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  // ==========================================================================
  // Storage & State Persistence
  // ==========================================================================
  function loadChatsFromStorage() {
    try {
      const stored = localStorage.getItem('omnirouter_chats');
      if (stored) {
        State.chats = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load chats from storage', e);
      State.chats = [];
    }

    if (!State.chats || State.chats.length === 0) {
      createNewChat();
    } else {
      State.activeChatId = State.chats[0].id;
    }
  }

  function saveChatsToStorage() {
    try {
      localStorage.setItem('omnirouter_chats', JSON.stringify(State.chats));
    } catch (e) {
      console.error('Failed to save chats', e);
    }
  }

  function getActiveChat() {
    return State.chats.find(c => c.id === State.activeChatId);
  }

  // ==========================================================================
  // Chat Session Management
  // ==========================================================================
  function createNewChat() {
    const newChat = {
      id: generateId(),
      title: 'New Conversation',
      createdAt: Date.now(),
      model: State.selectedModel,
      messages: []
    };
    State.chats.unshift(newChat);
    State.activeChatId = newChat.id;
    saveChatsToStorage();
    renderChatsList();
    renderActiveChat();

    // Auto-focus input
    DOM.userInput.focus();
  }

  function switchChat(chatId) {
    if (State.isStreaming) {
      showToast('Please wait for generation to finish or click stop.', 'error');
      return;
    }
    State.activeChatId = chatId;
    renderChatsList();
    renderActiveChat();

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      DOM.sidebar.classList.remove('mobile-open');
      DOM.sidebarBackdrop.classList.remove('active');
    }
  }

  function deleteChat(chatId, e) {
    if (e) e.stopPropagation();
    if (State.chats.length <= 1) {
      // Clear current chat instead of deleting only one
      const chat = getActiveChat();
      if (chat) {
        chat.messages = [];
        chat.title = 'New Conversation';
        saveChatsToStorage();
        renderActiveChat();
        renderChatsList();
        showToast('Conversation cleared', 'info');
      }
      return;
    }

    State.chats = State.chats.filter(c => c.id !== chatId);
    if (State.activeChatId === chatId) {
      State.activeChatId = State.chats[0].id;
    }
    saveChatsToStorage();
    renderChatsList();
    renderActiveChat();
    showToast('Chat deleted', 'info');
  }

  function renameChat(chatId, e) {
    if (e) e.stopPropagation();
    const chat = State.chats.find(c => c.id === chatId);
    if (!chat) return;

    const newTitle = prompt('Rename conversation:', chat.title);
    if (newTitle && newTitle.trim()) {
      chat.title = newTitle.trim();
      saveChatsToStorage();
      renderChatsList();
    }
  }

  function clearActiveChat() {
    const chat = getActiveChat();
    if (!chat || chat.messages.length === 0) return;

    if (confirm('Are you sure you want to clear all messages in this conversation?')) {
      chat.messages = [];
      chat.title = 'New Conversation';
      saveChatsToStorage();
      renderActiveChat();
      renderChatsList();
      showToast('Chat history cleared', 'info');
    }
  }

  function renderChatsList() {
    DOM.chatsList.innerHTML = '';
    const query = DOM.searchChatsInput.value.toLowerCase().trim();

    const filteredChats = State.chats.filter(chat => {
      if (!query) return true;
      if (chat.title.toLowerCase().includes(query)) return true;
      return chat.messages.some(m => m.content && m.content.toLowerCase().includes(query));
    });

    if (filteredChats.length === 0) {
      DOM.chatsList.innerHTML = `
        <li style="padding: 1rem 0.5rem; color: var(--text-muted); font-size: 0.8rem; text-align: center;">
          No conversations found
        </li>
      `;
      return;
    }

    filteredChats.forEach(chat => {
      const li = document.createElement('li');
      li.className = `chat-item ${chat.id === State.activeChatId ? 'active' : ''}`;
      li.setAttribute('role', 'button');
      li.onclick = () => switchChat(chat.id);

      li.innerHTML = `
        <span class="chat-item-title" title="${escapeHtml(chat.title)}">${escapeHtml(chat.title)}</span>
        <div class="chat-item-actions">
          <button class="chat-action-btn rename-btn" title="Rename" aria-label="Rename conversation">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="chat-action-btn delete-btn" title="Delete" aria-label="Delete conversation">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      li.querySelector('.rename-btn').onclick = (e) => renameChat(chat.id, e);
      li.querySelector('.delete-btn').onclick = (e) => deleteChat(chat.id, e);

      DOM.chatsList.appendChild(li);
    });
  }

  // ==========================================================================
  // Markdown & Code Block Setup
  // ==========================================================================
  function configureMarked() {
    if (typeof marked === 'undefined') return;

    marked.setOptions({
      highlight: function (code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {
            console.error(e);
          }
        }
        if (typeof hljs !== 'undefined') {
          try {
            return hljs.highlightAuto(code).value;
          } catch (e) {}
        }
        return escapeHtml(code);
      },
      breaks: true,
      gfm: true
    });
  }

  function renderMarkdown(rawText) {
    if (!rawText) return '';
    if (typeof marked !== 'undefined') {
      try {
        let html = marked.parse(rawText);
        // Post-process code blocks to inject copy button & language header
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        tempDiv.querySelectorAll('pre').forEach(pre => {
          const codeEl = pre.querySelector('code');
          let lang = 'code';
          if (codeEl) {
            const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
            if (langClass) lang = langClass.replace('language-', '');
          }

          const header = document.createElement('div');
          header.className = 'code-header-bar';
          header.innerHTML = `
            <span class="code-lang-tag">${escapeHtml(lang)}</span>
            <button class="copy-code-btn" title="Copy code">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy</span>
            </button>
          `;

          const copyBtn = header.querySelector('.copy-code-btn');
          copyBtn.onclick = () => {
            const codeToCopy = codeEl ? codeEl.innerText : pre.innerText;
            navigator.clipboard.writeText(codeToCopy).then(() => {
              copyBtn.querySelector('span').textContent = 'Copied!';
              setTimeout(() => {
                copyBtn.querySelector('span').textContent = 'Copy';
              }, 2000);
            });
          };

          pre.insertBefore(header, pre.firstChild);
        });

        return tempDiv.innerHTML;
      } catch (err) {
        console.error('Marked parse error', err);
      }
    }
    return escapeHtml(rawText);
  }

  // ==========================================================================
  // Render Active Conversation
  // ==========================================================================
  function renderActiveChat() {
    const chat = getActiveChat();
    if (!chat) return;

    // Toggle welcome screen
    if (!chat.messages || chat.messages.length === 0) {
      DOM.welcomeScreen.classList.remove('hidden');
      DOM.messagesList.innerHTML = '';
      updateApiKeyStatusDisplay();
      return;
    }

    DOM.welcomeScreen.classList.add('hidden');
    DOM.messagesList.innerHTML = '';

    chat.messages.forEach((msg, idx) => {
      appendMessageToDOM(msg, idx === chat.messages.length - 1 && State.isStreaming);
    });

    scrollToBottom(false);
  }

  function appendMessageToDOM(msg, isCurrentStreaming = false) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.role}`;

    const isUser = msg.role === 'user';
    const avatarContent = isUser ? 'You' : 'AI';

    // Model Tag formatting
    const modelInfo = getModelInfo(msg.model || State.selectedModel);
    const metaTag = isUser ? 'User' : (modelInfo ? modelInfo.name : 'OmniRouter AI');

    let bodyHtml = '';

    // Reasoning block handling (DeepSeek R1 / CoT)
    if (!isUser && msg.reasoning) {
      bodyHtml += `
        <div class="reasoning-block">
          <div class="reasoning-header" onclick="this.parentElement.classList.toggle('collapsed')">
            <div class="reasoning-title-group">
              <div class="reasoning-pulse"></div>
              <span>Thought Process (${escapeHtml(modelInfo?.name || 'Model')})</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="reasoning-body">${escapeHtml(msg.reasoning)}</div>
        </div>
      `;
    }

    // Main content
    const renderedContent = isUser ? escapeHtml(msg.content).replace(/\n/g, '<br>') : renderMarkdown(msg.content);

    bodyHtml += `
      <div class="message-content">
        ${renderedContent}
        ${isCurrentStreaming ? '<span class="typing-cursor"></span>' : ''}
      </div>
    `;

    // Action buttons for assistant
    if (!isUser && !isCurrentStreaming && msg.content) {
      bodyHtml += `
        <div class="message-actions">
          <button class="msg-action-btn copy-msg-btn" title="Copy response">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy</span>
          </button>
          <button class="msg-action-btn regen-msg-btn" title="Regenerate from this point">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Regenerate</span>
          </button>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="message-avatar">${avatarContent}</div>
      <div class="message-body-wrapper">
        <div class="message-meta">
          <span>${escapeHtml(metaTag)}</span>
          <span>•</span>
          <span>${formatTime(msg.timestamp || Date.now())}</span>
        </div>
        ${bodyHtml}
      </div>
    `;

    // Attach button listeners
    const copyBtn = row.querySelector('.copy-msg-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(msg.content).then(() => {
          copyBtn.querySelector('span').textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.querySelector('span').textContent = 'Copy';
          }, 2000);
        });
      };
    }

    const regenBtn = row.querySelector('.regen-msg-btn');
    if (regenBtn) {
      regenBtn.onclick = () => regenerateLastResponse();
    }

    DOM.messagesList.appendChild(row);
  }

  function formatTime(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ==========================================================================
  // OpenRouter Streaming Engine
  // ==========================================================================
  async function sendMessage() {
    const prompt = DOM.userInput.value.trim();
    if (!prompt) return;

    if (!State.apiKey) {
      showToast('Please set your OpenRouter API Key in Settings first.', 'error');
      openSettingsModal();
      return;
    }

    if (State.isStreaming) return;

    const chat = getActiveChat();
    if (!chat) return;

    // Append user message
    const userMsg = {
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };
    chat.messages.push(userMsg);

    // Auto-title conversation if this is the first message
    if (chat.messages.length === 1 || chat.title === 'New Conversation') {
      chat.title = prompt.length > 32 ? prompt.slice(0, 32) + '...' : prompt;
      renderChatsList();
    }

    // Create placeholder for assistant response
    const assistantMsg = {
      role: 'assistant',
      content: '',
      reasoning: '',
      model: State.selectedModel,
      timestamp: Date.now()
    };
    chat.messages.push(assistantMsg);

    // Clear input & update UI
    DOM.userInput.value = '';
    adjustTextareaHeight();
    saveChatsToStorage();
    renderActiveChat();

    // Prepare API call
    setStreamingState(true);
    State.abortController = new AbortController();

    // Assemble messages payload
    const payloadMessages = [];
    if (State.systemPrompt && State.systemPrompt.trim()) {
      payloadMessages.push({ role: 'system', content: State.systemPrompt.trim() });
    }

    // Send history (filter out empty messages and limit to last 20 messages for context efficiency)
    const contextHistory = chat.messages
      .slice(0, -1)
      .filter(m => m.content && m.content.trim())
      .slice(-20);

    contextHistory.forEach(m => {
      payloadMessages.push({
        role: m.role,
        content: m.content
      });
    });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${State.apiKey.trim()}`,
          'HTTP-Referer': window.location.origin || 'http://localhost',
          'X-Title': 'OmniRouter AI Studio',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: State.selectedModel,
          messages: payloadMessages,
          stream: true,
          temperature: State.temperature,
          max_tokens: State.maxTokens || undefined
        }),
        signal: State.abortController.signal
      });

      if (!response.ok) {
        let errDetails = '';
        try {
          const errJson = await response.json();
          errDetails = errJson?.error?.message || response.statusText;
        } catch (e) {
          errDetails = response.statusText;
        }
        throw new Error(`OpenRouter Error (${response.status}): ${errDetails}`);
      }

      // Stream handling via Reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let inThinkTag = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            // 1. Check for dedicated reasoning field (e.g. DeepSeek R1 API delta.reasoning)
            if (delta.reasoning) {
              assistantMsg.reasoning += delta.reasoning;
            }

            // 2. Check for content stream
            if (delta.content) {
              const chunk = delta.content;

              // Check for embedded <think> tokens
              if (chunk.includes('<think>')) {
                inThinkTag = true;
                const parts = chunk.split('<think>');
                assistantMsg.content += parts[0];
                if (parts[1]) assistantMsg.reasoning += parts[1];
              } else if (chunk.includes('</think>')) {
                inThinkTag = false;
                const parts = chunk.split('</think>');
                assistantMsg.reasoning += parts[0];
                if (parts[1]) assistantMsg.content += parts[1];
              } else if (inThinkTag) {
                assistantMsg.reasoning += chunk;
              } else {
                assistantMsg.content += chunk;
              }
            }

            // Live update the last message in DOM
            updateLiveStreamingDOM(assistantMsg);
          } catch (jsonErr) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        showToast('Generation stopped', 'info');
      } else {
        console.error('Streaming request error:', err);
        assistantMsg.content += `\n\n⚠️ **Error:** ${escapeHtml(err.message)}`;
        showToast(`Request failed: ${err.message}`, 'error');
      }
    } finally {
      setStreamingState(false);
      saveChatsToStorage();
      renderActiveChat();
    }
  }

  function updateLiveStreamingDOM(assistantMsg) {
    const rows = DOM.messagesList.querySelectorAll('.message-row.assistant');
    const lastRow = rows[rows.length - 1];
    if (!lastRow) return;

    const wrapper = lastRow.querySelector('.message-body-wrapper');
    if (!wrapper) return;

    let bodyHtml = '';

    // Reasoning block
    if (assistantMsg.reasoning) {
      bodyHtml += `
        <div class="reasoning-block">
          <div class="reasoning-header">
            <div class="reasoning-title-group">
              <div class="reasoning-pulse"></div>
              <span>Thinking Process...</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="reasoning-body">${escapeHtml(assistantMsg.reasoning)}</div>
        </div>
      `;
    }

    // Rendered content
    bodyHtml += `
      <div class="message-content">
        ${renderMarkdown(assistantMsg.content)}
        <span class="typing-cursor"></span>
      </div>
    `;

    const meta = wrapper.querySelector('.message-meta');
    wrapper.innerHTML = '';
    if (meta) wrapper.appendChild(meta);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHtml;
    while (tempDiv.firstChild) {
      wrapper.appendChild(tempDiv.firstChild);
    }

    scrollToBottom(false);
  }

  function stopStreaming() {
    if (State.abortController) {
      State.abortController.abort();
    }
  }

  function setStreamingState(isStreaming) {
    State.isStreaming = isStreaming;
    if (isStreaming) {
      DOM.sendBtn.disabled = true;
      DOM.stopGenerationBtn.classList.remove('hidden');
    } else {
      DOM.sendBtn.disabled = false;
      DOM.stopGenerationBtn.classList.add('hidden');
      State.abortController = null;
    }
  }

  function regenerateLastResponse() {
    const chat = getActiveChat();
    if (!chat || chat.messages.length === 0 || State.isStreaming) return;

    // If last message is assistant, remove it
    if (chat.messages[chat.messages.length - 1].role === 'assistant') {
      chat.messages.pop();
    }

    // If last is user, re-send
    if (chat.messages.length > 0 && chat.messages[chat.messages.length - 1].role === 'user') {
      const lastUserMsg = chat.messages.pop();
      DOM.userInput.value = lastUserMsg.content;
      sendMessage();
    }
  }

  // ==========================================================================
  // Model Explorer & Switcher
  // ==========================================================================
  function getModelInfo(modelId) {
    return State.allModels.find(m => m.id === modelId) || {
      id: modelId,
      name: modelId.split('/').pop().replace(':free', ''),
      provider: modelId.split('/')[0] || 'AI',
      context: '128k',
      pricing: modelId.includes(':free') ? 'FREE' : 'Standard',
      tags: modelId.includes(':free') ? ['free'] : []
    };
  }

  function updateActiveModelDisplay() {
    const model = getModelInfo(State.selectedModel);
    DOM.currentModelDisplay.textContent = model.name;

    // Tag badge
    if (model.id.includes(':free')) {
      DOM.currentModelTag.textContent = 'FREE';
      DOM.currentModelTag.className = 'model-tag-badge';
      DOM.quickbarFreeBadge.classList.remove('hidden');
    } else if (model.tags?.includes('reasoning')) {
      DOM.currentModelTag.textContent = 'Reasoning';
      DOM.currentModelTag.className = 'model-tag-badge badge-reasoning';
      DOM.quickbarFreeBadge.classList.add('hidden');
    } else {
      DOM.currentModelTag.textContent = model.provider || 'PRO';
      DOM.currentModelTag.className = 'model-tag-badge';
      DOM.quickbarFreeBadge.classList.add('hidden');
    }

    DOM.quickbarModelName.textContent = model.name;
    DOM.quickbarTempVal.textContent = State.temperature;
    DOM.quickbarReasoningVal.textContent = (model.tags?.includes('reasoning') || model.id.includes('r1')) ? 'Active' : 'Standard';

    localStorage.setItem('omnirouter_selected_model', State.selectedModel);
  }

  async function fetchLiveModelsFromOpenRouter() {
    DOM.syncModelsBtn.disabled = true;
    DOM.syncModelsBtn.querySelector('span').textContent = 'Fetching 300+ models...';

    try {
      const res = await fetch('https://openrouter.ai/api/v1/models');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        // Map OpenRouter models into our clean format
        const fetched = data.data.map(m => {
          const isFree = m.id.endsWith(':free');
          const isReasoning = m.id.includes('r1') || m.id.includes('reason') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('qwq');
          const tags = [];
          if (isFree) tags.push('free');
          if (isReasoning) tags.push('reasoning');
          if (m.pricing && parseFloat(m.pricing.prompt) === 0) tags.push('free');

          let pricingStr = 'Standard';
          if (isFree || (m.pricing && parseFloat(m.pricing.prompt) === 0)) {
            pricingStr = 'FREE';
          } else if (m.pricing) {
            const promptPrice = (parseFloat(m.pricing.prompt) * 1000000).toFixed(2);
            const compPrice = (parseFloat(m.pricing.completion) * 1000000).toFixed(2);
            pricingStr = `$${promptPrice} / $${compPrice}`;
          }

          let ctxStr = m.context_length ? `${Math.round(m.context_length / 1000)}k` : '128k';

          return {
            id: m.id,
            name: m.name || m.id.split('/').pop(),
            provider: m.id.split('/')[0] || 'Unknown',
            context: ctxStr,
            pricing: pricingStr,
            tags: tags,
            description: m.description || ''
          };
        });

        // Merge with custom models and curated models ensuring unique IDs
        const existingIds = new Set(fetched.map(m => m.id));
        const customIds = new Set(State.customModels.map(m => m.id));
        const merged = [
          ...State.customModels,
          ...CURATED_MODELS.filter(m => !customIds.has(m.id) && !existingIds.has(m.id)),
          ...fetched.filter(m => !customIds.has(m.id))
        ];

        State.allModels = merged;
        showToast(`Catalog refreshed: ${merged.length} models available`, 'success');
      }
    } catch (e) {
      console.warn('Could not fetch live OpenRouter models, using built-in curated models.', e);
      showToast('Could not reach OpenRouter catalog, using curated models.', 'info');
    } finally {
      DOM.syncModelsBtn.disabled = false;
      DOM.syncModelsBtn.querySelector('span').textContent = 'Refresh Catalog';
      renderModelsGrid();
    }
  }

  // ==========================================================================
  // Custom Model Management
  // ==========================================================================
  function openCustomModelModal() {
    DOM.customModelIdInput.value = '';
    DOM.customModelNameInput.value = '';
    DOM.customModelProviderInput.value = '';
    DOM.customModelContextInput.value = '128k';
    DOM.customModelIsReasoning.checked = false;
    DOM.customModelIsFree.checked = false;
    DOM.customModelModal.classList.add('open');
    DOM.customModelIdInput.focus();
  }

  function closeCustomModelModal() {
    DOM.customModelModal.classList.remove('open');
  }

  function saveCustomModel() {
    const id = DOM.customModelIdInput.value.trim();
    const name = DOM.customModelNameInput.value.trim();
    const provider = DOM.customModelProviderInput.value.trim() || 'Custom';
    const context = DOM.customModelContextInput.value.trim() || '128k';
    const isReasoning = DOM.customModelIsReasoning.checked;
    const isFree = DOM.customModelIsFree.checked;

    if (!id) {
      showToast('Model ID / Slug is required (e.g. meta-llama/llama-3.1-405b-instruct)', 'error');
      DOM.customModelIdInput.focus();
      return;
    }

    if (!name) {
      showToast('Display Name is required', 'error');
      DOM.customModelNameInput.focus();
      return;
    }

    const tags = ['custom'];
    if (isFree) tags.push('free');
    if (isReasoning) tags.push('reasoning');

    const customModel = {
      id: id,
      name: name,
      provider: provider,
      context: context,
      pricing: isFree ? 'FREE' : 'Custom',
      tags: tags,
      isCustom: true,
      description: `Custom model added by user (${provider})`
    };

    // Filter out if duplicate ID exists
    State.customModels = State.customModels.filter(m => m.id !== id);
    State.customModels.unshift(customModel);
    localStorage.setItem('omnirouter_custom_models', JSON.stringify(State.customModels));

    // Update allModels
    State.allModels = [customModel, ...State.allModels.filter(m => m.id !== id)];

    closeCustomModelModal();
    selectModel(id);
    renderModelsGrid();
    showToast(`Custom model "${name}" added and selected!`, 'success');
  }

  function deleteCustomModel(modelId, e) {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to remove this custom model?')) return;

    State.customModels = State.customModels.filter(m => m.id !== modelId);
    localStorage.setItem('omnirouter_custom_models', JSON.stringify(State.customModels));

    State.allModels = State.allModels.filter(m => m.id !== modelId);

    if (State.selectedModel === modelId) {
      State.selectedModel = 'deepseek/deepseek-r1:free';
      updateActiveModelDisplay();
    }

    renderModelsGrid();
    showToast('Custom model removed', 'info');
  }

  function renderModelsGrid() {
    DOM.modelsGrid.innerHTML = '';
    const query = DOM.modelSearchInput.value.toLowerCase().trim();
    const filter = State.activeFilter;

    let filtered = State.allModels.filter(m => {
      // Filter tab
      if (filter === 'custom' && !m.isCustom && !m.tags?.includes('custom')) return false;
      if (filter === 'free' && !m.id.endsWith(':free') && m.pricing !== 'FREE') return false;
      if (filter === 'reasoning' && !m.tags?.includes('reasoning') && !m.id.includes('r1')) return false;
      if (filter === 'flagship' && !m.tags?.includes('flagship')) return false;
      if (filter === 'fast' && !m.tags?.includes('fast')) return false;

      // Text query
      if (query) {
        const matchName = m.name.toLowerCase().includes(query);
        const matchId = m.id.toLowerCase().includes(query);
        const matchProvider = m.provider.toLowerCase().includes(query);
        const matchDesc = m.description && m.description.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchProvider && !matchDesc) return false;
      }

      return true;
    });

    DOM.modelCountText.textContent = `Showing ${filtered.length} models`;

    if (filtered.length === 0) {
      DOM.modelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; color: var(--text-muted);">
          <p>No models match your filter or search query.</p>
          ${filter === 'custom' ? '<button id="grid-add-custom-btn" class="btn btn-primary" style="margin-top: 1rem;">+ Add Your First Custom Model</button>' : ''}
        </div>
      `;
      const gridAddBtn = document.getElementById('grid-add-custom-btn');
      if (gridAddBtn) gridAddBtn.onclick = openCustomModelModal;
      return;
    }

    filtered.slice(0, 150).forEach(m => {
      const card = document.createElement('div');
      const isSelected = m.id === State.selectedModel;
      card.className = `model-card-item ${isSelected ? 'selected' : ''}`;
      card.setAttribute('role', 'button');

      let tagsHtml = '';
      if (m.isCustom || m.tags?.includes('custom')) {
        tagsHtml += `<span class="badge-tag badge-custom-tag">⭐ Custom</span>`;
      }
      if (m.id.endsWith(':free') || m.pricing === 'FREE') {
        tagsHtml += `<span class="badge-tag badge-free-tag">FREE</span>`;
      }
      if (m.tags?.includes('reasoning') || m.id.includes('r1')) {
        tagsHtml += `<span class="badge-tag badge-reason-tag">Reasoning</span>`;
      }
      if (m.tags?.includes('flagship')) {
        tagsHtml += `<span class="badge-tag badge-flag-tag">Flagship</span>`;
      }

      let actionsHtml = '';
      if (m.isCustom) {
        actionsHtml = `
          <button class="delete-custom-model-btn" title="Remove custom model" aria-label="Remove custom model">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            <span>Delete</span>
          </button>
        `;
      }

      card.innerHTML = `
        <div class="model-card-header">
          <div>
            <div class="model-card-name">${escapeHtml(m.name)}</div>
            <div class="model-card-provider">${escapeHtml(m.provider)}</div>
          </div>
          <div class="model-card-badges">${tagsHtml}</div>
        </div>
        <div class="model-card-footer">
          <span class="context-len" title="Context Window">${escapeHtml(m.context)} ctx</span>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="price-text ${m.pricing === 'FREE' ? 'free' : ''}">${escapeHtml(m.pricing)}</span>
            ${actionsHtml}
          </div>
        </div>
      `;

      card.onclick = () => {
        selectModel(m.id);
        closeModelModal();
      };

      const delBtn = card.querySelector('.delete-custom-model-btn');
      if (delBtn) {
        delBtn.onclick = (e) => deleteCustomModel(m.id, e);
      }

      DOM.modelsGrid.appendChild(card);
    });
  }

  function selectModel(modelId) {
    State.selectedModel = modelId;
    updateActiveModelDisplay();
    showToast(`Switched model to ${getModelInfo(modelId).name}`, 'info');
  }

  function openModelModal() {
    DOM.modelModal.classList.add('open');
    DOM.modelSearchInput.focus();
    renderModelsGrid();
  }

  function closeModelModal() {
    DOM.modelModal.classList.remove('open');
  }

  // ==========================================================================
  // Settings & API Key Verification
  // ==========================================================================
  function updateApiKeyStatusDisplay() {
    if (State.apiKey && State.apiKey.trim()) {
      DOM.apiStatusDot.className = 'status-indicator-dot active';
      DOM.apiKeyLabel.textContent = 'API Connected';
      DOM.apiKeySubtext.textContent = 'OpenRouter Key Active';
      DOM.apiKeyBanner.classList.add('hidden');
    } else {
      DOM.apiStatusDot.className = 'status-indicator-dot';
      DOM.apiKeyLabel.textContent = 'Key Missing';
      DOM.apiKeySubtext.textContent = 'Click to set OpenRouter Key';
      const activeChat = getActiveChat();
      if (!activeChat || activeChat.messages.length === 0) {
        DOM.apiKeyBanner.classList.remove('hidden');
      }
    }
  }

  async function verifyApiKey(keyToTest) {
    if (!keyToTest) {
      DOM.keyVerificationStatus.textContent = 'Please enter an API key first.';
      DOM.keyVerificationStatus.className = 'status-msg error';
      return;
    }

    DOM.verifyKeyBtn.disabled = true;
    DOM.verifyKeyBtn.textContent = 'Verifying...';
    DOM.keyVerificationStatus.textContent = 'Connecting to OpenRouter auth service...';
    DOM.keyVerificationStatus.className = 'status-msg';

    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${keyToTest.trim()}`
        }
      });

      if (!res.ok) {
        throw new Error(`Invalid key or authorization failed (${res.status})`);
      }

      const data = await res.json();
      const info = data.data;

      let msg = '✅ Key is valid and active!';
      if (info?.label) msg += ` (Label: ${info.label})`;
      if (info?.usage !== undefined && info?.limit !== undefined) {
        msg += ` | Used: $${info.usage.toFixed(3)} / Limit: $${info.limit || 'No Limit'}`;
      }

      DOM.keyVerificationStatus.textContent = msg;
      DOM.keyVerificationStatus.className = 'status-msg success';
      showToast('OpenRouter API Key verified successfully!', 'success');
    } catch (err) {
      DOM.keyVerificationStatus.textContent = `❌ ${err.message}`;
      DOM.keyVerificationStatus.className = 'status-msg error';
      showToast(err.message, 'error');
    } finally {
      DOM.verifyKeyBtn.disabled = false;
      DOM.verifyKeyBtn.textContent = 'Verify Key';
    }
  }

  function openSettingsModal() {
    DOM.apiKeyInput.value = State.apiKey;
    DOM.temperatureSlider.value = State.temperature;
    DOM.tempDisplay.textContent = State.temperature;
    DOM.maxTokensInput.value = State.maxTokens || '';
    DOM.keyVerificationStatus.textContent = '';
    DOM.settingsModal.classList.add('open');
  }

  function closeSettingsModal() {
    DOM.settingsModal.classList.remove('open');
  }

  function saveSettings() {
    const key = DOM.apiKeyInput.value.trim();
    const temp = parseFloat(DOM.temperatureSlider.value);
    const maxTok = parseInt(DOM.maxTokensInput.value, 10);

    State.apiKey = key;
    State.temperature = isNaN(temp) ? 0.7 : temp;
    State.maxTokens = isNaN(maxTok) ? 4096 : maxTok;

    localStorage.setItem('omnirouter_api_key', State.apiKey);
    localStorage.setItem('omnirouter_temperature', State.temperature.toString());
    localStorage.setItem('omnirouter_max_tokens', State.maxTokens.toString());

    updateApiKeyStatusDisplay();
    updateActiveModelDisplay();
    closeSettingsModal();
    showToast('Settings saved successfully', 'success');
  }

  function clearApiKey() {
    if (confirm('Are you sure you want to remove your saved OpenRouter API key?')) {
      State.apiKey = '';
      DOM.apiKeyInput.value = '';
      localStorage.removeItem('omnirouter_api_key');
      updateApiKeyStatusDisplay();
      DOM.keyVerificationStatus.textContent = 'Key removed from browser storage.';
      DOM.keyVerificationStatus.className = 'status-msg';
      showToast('API key removed', 'info');
    }
  }

  // ==========================================================================
  // System Prompt & Personas
  // ==========================================================================
  function openSystemModal() {
    DOM.systemPromptTextarea.value = State.systemPrompt;
    DOM.systemModal.classList.add('open');
  }

  function closeSystemModal() {
    DOM.systemModal.classList.remove('open');
  }

  function applySystemPreset(presetKey) {
    if (SYSTEM_PRESETS[presetKey]) {
      DOM.systemPromptTextarea.value = SYSTEM_PRESETS[presetKey];
    }
  }

  function saveSystemPrompt() {
    State.systemPrompt = DOM.systemPromptTextarea.value.trim();
    localStorage.setItem('omnirouter_system_prompt', State.systemPrompt);
    closeSystemModal();
    showToast('System prompt updated', 'success');
  }

  // ==========================================================================
  // Export Chat
  // ==========================================================================
  function exportConversation() {
    const chat = getActiveChat();
    if (!chat || chat.messages.length === 0) {
      showToast('No messages in this chat to export', 'error');
      return;
    }

    let markdown = `# ${chat.title}\n*Exported from OmniRouter AI on ${new Date().toLocaleString()}*\n\n---\n\n`;

    chat.messages.forEach(msg => {
      const sender = msg.role === 'user' ? 'User' : `OmniRouter AI (${msg.model || State.selectedModel})`;
      markdown += `### ${sender}\n\n`;
      if (msg.reasoning) {
        markdown += `> **Thought Process:**\n> ${msg.reasoning.replace(/\n/g, '\n> ')}\n\n`;
      }
      markdown += `${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9_-]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(a);
    showToast('Conversation exported as Markdown', 'success');
  }

  // ==========================================================================
  // Input Auto-Resize & Event Listeners
  // ==========================================================================
  function adjustTextareaHeight() {
    DOM.userInput.style.height = 'auto';
    const newHeight = Math.min(DOM.userInput.scrollHeight, 180);
    DOM.userInput.style.height = (newHeight > 24 ? newHeight : 24) + 'px';
  }

  function setupEventListeners() {
    // Input Bar
    DOM.userInput?.addEventListener('input', adjustTextareaHeight);
    DOM.userInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    DOM.sendBtn?.addEventListener('click', sendMessage);
    DOM.stopGenerationBtn?.addEventListener('click', stopStreaming);

    // Sidebar
    DOM.newChatBtn?.addEventListener('click', createNewChat);
    DOM.searchChatsInput?.addEventListener('input', renderChatsList);
    DOM.apiKeyStatusPill?.addEventListener('click', openSettingsModal);

    DOM.sidebarToggleBtn?.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        DOM.sidebar?.classList.toggle('mobile-open');
        DOM.sidebarBackdrop?.classList.toggle('active');
      } else {
        DOM.sidebar?.classList.toggle('collapsed');
      }
    });

    DOM.sidebarCloseBtn?.addEventListener('click', () => {
      DOM.sidebar?.classList.remove('mobile-open');
      DOM.sidebarBackdrop?.classList.remove('active');
    });

    DOM.sidebarBackdrop?.addEventListener('click', () => {
      DOM.sidebar?.classList.remove('mobile-open');
      DOM.sidebarBackdrop?.classList.remove('active');
    });

    // Header buttons
    DOM.openModelModalBtn?.addEventListener('click', openModelModal);
    DOM.quickbarModelPill?.addEventListener('click', openModelModal);
    DOM.openSettingsBtn?.addEventListener('click', openSettingsModal);
    DOM.systemPromptBtn?.addEventListener('click', openSystemModal);
    DOM.exportChatBtn?.addEventListener('click', exportConversation);
    DOM.clearChatBtn?.addEventListener('click', clearActiveChat);

    // Banner & prompt cards
    DOM.bannerAddKeyBtn?.addEventListener('click', openSettingsModal);

    document.querySelectorAll('.prompt-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        if (prompt) {
          DOM.userInput.value = prompt;
          adjustTextareaHeight();
          sendMessage();
        }
      });
    });

    // Model Modal Controls
    DOM.closeModelModalBtn?.addEventListener('click', closeModelModal);
    DOM.modelSearchInput?.addEventListener('input', renderModelsGrid);
    DOM.syncModelsBtn?.addEventListener('click', fetchLiveModelsFromOpenRouter);

    DOM.filterTabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        DOM.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        State.activeFilter = tab.getAttribute('data-filter') || 'all';
        renderModelsGrid();
      });
    });

    // Settings Modal
    DOM.closeSettingsModalBtn?.addEventListener('click', closeSettingsModal);
    DOM.saveSettingsBtn?.addEventListener('click', saveSettings);
    DOM.clearKeyBtn?.addEventListener('click', clearApiKey);
    DOM.verifyKeyBtn?.addEventListener('click', () => verifyApiKey(DOM.apiKeyInput?.value.trim()));

    DOM.temperatureSlider?.addEventListener('input', (e) => {
      if (DOM.tempDisplay) DOM.tempDisplay.textContent = e.target.value;
    });

    DOM.toggleKeyVisibilityBtn?.addEventListener('click', () => {
      if (DOM.apiKeyInput) {
        if (DOM.apiKeyInput.type === 'password') {
          DOM.apiKeyInput.type = 'text';
        } else {
          DOM.apiKeyInput.type = 'password';
        }
      }
    });

    // System Modal
    DOM.closeSystemModalBtn?.addEventListener('click', closeSystemModal);
    DOM.saveSystemBtn?.addEventListener('click', saveSystemPrompt);
    DOM.resetSystemBtn?.addEventListener('click', () => {
      if (DOM.systemPromptTextarea) DOM.systemPromptTextarea.value = SYSTEM_PRESETS.default;
    });

    DOM.presetChips?.forEach(chip => {
      chip.addEventListener('click', () => {
        applySystemPreset(chip.getAttribute('data-preset'));
      });
    });

    // Custom Model Modal Controls
    if (DOM.openCustomModelBtn) {
      DOM.openCustomModelBtn.addEventListener('click', openCustomModelModal);
    }
    if (DOM.closeCustomModelModalBtn) {
      DOM.closeCustomModelModalBtn.addEventListener('click', closeCustomModelModal);
    }
    if (DOM.cancelCustomModelBtn) {
      DOM.cancelCustomModelBtn.addEventListener('click', closeCustomModelModal);
    }
    if (DOM.saveCustomModelBtn) {
      DOM.saveCustomModelBtn.addEventListener('click', saveCustomModel);
    }

    // Close modals on overlay backdrop click
    [DOM.modelModal, DOM.settingsModal, DOM.systemModal, DOM.customModelModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('open');
          }
        });
      }
    });

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModelModal();
        closeSettingsModal();
        closeSystemModal();
        closeCustomModelModal();
      }
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    configureMarked();
    loadChatsFromStorage();
    setupEventListeners();
    updateApiKeyStatusDisplay();
    updateActiveModelDisplay();
    renderChatsList();
    renderActiveChat();

    // Fetch live models silently in background
    setTimeout(() => {
      fetchLiveModelsFromOpenRouter();
    }, 800);
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
