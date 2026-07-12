
      let global = globalThis;
      globalThis.global = globalThis;

      if (typeof global.navigator === 'undefined') {
        global.navigator = {
          userAgent: 'edge-runtime',
          language: 'en-US',
          languages: ['en-US'],
        };
      } else {
        if (typeof global.navigator.language === 'undefined') {
          global.navigator.language = 'en-US';
        }
        if (!global.navigator.languages || global.navigator.languages.length === 0) {
          global.navigator.languages = [global.navigator.language];
        }
        if (typeof global.navigator.userAgent === 'undefined') {
          global.navigator.userAgent = 'edge-runtime';
        }
      }

      class MessageChannel {
        constructor() {
          this.port1 = new MessagePort();
          this.port2 = new MessagePort();
        }
      }
      class MessagePort {
        constructor() {
          this.onmessage = null;
        }
        postMessage(data) {
          if (this.onmessage) {
            setTimeout(() => this.onmessage({ data }), 0);
          }
        }
      }
      global.MessageChannel = MessageChannel;

      '__MIDDLEWARE_BUNDLE_CODE__'

      function recreateRequest(request, overrides = {}) {
        const cloned = typeof request.clone === 'function' ? request.clone() : request;
        const headers = new Headers(cloned.headers);

        if (overrides.headerPatches) {
          Object.keys(overrides.headerPatches).forEach((key) => {
            const value = overrides.headerPatches[key];
            if (value === null || typeof value === 'undefined') {
              headers.delete(key);
            } else {
              headers.set(key, value);
            }
          });
        }

        if (overrides.headers) {
          const extraHeaders = new Headers(overrides.headers);
          extraHeaders.forEach((value, key) => headers.set(key, value));
        }

        const url = overrides.url || cloned.url;
        const method = overrides.method || cloned.method || 'GET';
        const canHaveBody = method && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD';
        const body = overrides.body !== undefined ? overrides.body : canHaveBody ? cloned.body : undefined;

        // 如果rewrite传入的是完整URL（第三方地址），需要更新host
        if (overrides.url) {
          try {
            const newUrl = new URL(overrides.url, cloned.url);
            // 只有当新URL是绝对路径（包含协议和host）时才更新host
            if (overrides.url.startsWith('http://') || overrides.url.startsWith('https://')) {
              headers.set('host', newUrl.host);
            }
            // 相对路径时保持原有host不变
          } catch (e) {
            // URL解析失败时保持原有host
          }
        }

        const init = {
          method,
          headers,
          redirect: cloned.redirect,
          credentials: cloned.credentials,
          cache: cloned.cache,
          mode: cloned.mode,
          referrer: cloned.referrer,
          referrerPolicy: cloned.referrerPolicy,
          integrity: cloned.integrity,
          keepalive: cloned.keepalive,
          signal: cloned.signal,
        };

        if (canHaveBody && body !== undefined) {
          init.body = body;
        }

        if ('duplex' in cloned) {
          init.duplex = cloned.duplex;
        }

        return new Request(url, init);

      }

      
      async function executeMiddleware(context) {
        return null; // 没有中间件，继续执行后续函数
      }
    

      function usercode(ev, hookCtx) {
        hookCtx = hookCtx || { fetch: globalThis.fetch };
        const { fetch } = hookCtx;
        const globalthis = hookCtx;
        "use strict";
        // ↓ 用户原始代码
        return (async function handleRequest(context) {
          let routeParams = {};
          let pagesFunctionResponse = null;
          let request = context.request;
          const waitUntil = context.waitUntil;
          let urlInfo = new URL(request.url);
          const eo = request.eo || {};


          const normalizePathname = () => {
            if (urlInfo.pathname !== '/' && urlInfo.pathname.endsWith('/')) {
              urlInfo.pathname = urlInfo.pathname.slice(0, -1);
            }
          };

          function getSuffix(pathname = '') {
            // Use a regular expression to extract the file extension from the URL
            const suffix = pathname.match(/\.([^\.]+)$/);
            // If an extension is found, return it, otherwise return an empty string
            return suffix ? '.' + suffix[1] : null;
          }

          normalizePathname();

          let matchedFunc = false;

          
        const runEdgeFunctions = () => {
          
          if(!matchedFunc && '/api' === urlInfo.pathname) {
            matchedFunc = true;
              "use strict";
(() => {
  // functions/api/index.js
  function getEnv(key, fallback) {
    return typeof process !== "undefined" && process.env && process.env[key] || fallback;
  }
  var corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }
  function parseJsonResponse(text) {
    const withoutFence = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start < 0 || end < start) {
      throw new Error("\u6A21\u578B\u6CA1\u6709\u8FD4\u56DE JSON: " + withoutFence.slice(0, 300));
    }
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
  function normalizeSceneScript(text) {
    const cleaned = text.trim().replace(/^```(?:text|markdown)?\s*/i, "").replace(/\s*```$/, "");
    const rolePattern = /\[(?:旁白|主角|主角说|NPC:[^\]]+)\]\s*/g;
    const matches = [...cleaned.matchAll(rolePattern)];
    if (matches.length === 0)
      return cleaned;
    return matches.map((match, index) => {
      const contentStart = (match.index || 0) + match[0].length;
      const contentEnd = index + 1 < matches.length ? matches[index + 1].index || cleaned.length : cleaned.length;
      return match[0].trim() + cleaned.slice(contentStart, contentEnd).trim();
    }).filter((s) => !s.includes("\u2192 \u8DF3\u8F6C")).join("\n\n");
  }
  function parseModelResponse(text, mockType) {
    try {
      return parseJsonResponse(text);
    } catch (error) {
      if (mockType === "scene_fragment") {
        const script = normalizeSceneScript(text);
        if (/\[(?:旁白|主角|主角说|NPC:[^\]]+)\]/.test(script))
          return { script };
        if (text.trim())
          return { script: "[\u65C1\u767D]" + text.trim() };
      }
      throw error;
    }
  }
  function getAIErrorMessage(error, fallback) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const safe = rawMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
    const jsonStart = safe.indexOf("{");
    if (jsonStart >= 0) {
      try {
        const payload = JSON.parse(safe.slice(jsonStart));
        const msg = payload && payload.error && (payload.error.message_zh || payload.error.message);
        if (typeof msg === "string" && msg.trim())
          return msg.trim();
      } catch {
      }
    }
    return safe || fallback;
  }
  function getAIErrorStatus(error) {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(/请求失败 \((\d{3})\)|failed \((\d{3})\)/);
    const status = Number(match && (match[1] || match[2]) || 0);
    if (status === 401 || status === 403)
      return status;
    if (status >= 400 && status < 500)
      return 502;
    return 500;
  }
  async function callOpenAI(prompt, mockType) {
    const apiKey = getEnv("LLM_API_KEY");
    if (!apiKey)
      throw new Error("\u7F3A\u5C11 LLM_API_KEY");
    const baseUrl = getEnv("LLM_BASE_URL", "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = getEnv("LLM_MODEL", "gpt-5.5");
    const reasonEffort = getEnv("LLM_REASONING_EFFORT", "low");
    const timeoutMs = Number(getEnv("LLM_TIMEOUT_MS", "45000"));
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(baseUrl + "/responses", {
          method: "POST",
          headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ model, input: prompt, reasoning: { effort: reasonEffort }, max_output_tokens: 2400 }),
          signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : void 0
        });
        if (!res.ok) {
          const detail = (await res.text()).slice(0, 500);
          const err = new Error("OpenAI \u8BF7\u6C42\u5931\u8D25 (" + res.status + "): " + detail);
          if (res.status !== 429 && res.status < 500)
            throw err;
          lastError = err;
        } else {
          const payload = await res.json();
          const text = payload.output_text || (payload.output || []).flatMap((i) => i.content || []).filter((c) => c.type === "output_text" && c.text).map((c) => c.text).join("\n");
          if (!text)
            throw new Error("OpenAI \u8FD4\u56DE\u5185\u5BB9\u4E3A\u7A7A");
          return parseModelResponse(text, mockType);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (lastError.message.includes("(4") && !lastError.message.includes("(429)"))
          throw lastError;
      }
      if (attempt < 2)
        await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
    }
    throw lastError || new Error("OpenAI \u8BF7\u6C42\u5931\u8D25");
  }
  async function callHunyuan(prompt, mockType) {
    const apiKey = getEnv("HUNYUAN_API_KEY");
    if (!apiKey)
      throw new Error("\u7F3A\u5C11 HUNYUAN_API_KEY");
    const baseUrl = getEnv("HUNYUAN_BASE_URL", "https://tokenhub.tencentmaas.com/v1").replace(/\/+$/, "");
    const model = getEnv("HUNYUAN_MODEL", "hunyuan-role-latest");
    const timeoutMs = Number(getEnv("LLM_TIMEOUT_MS", "45000"));
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(baseUrl + "/chat/completions", {
          method: "POST",
          headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "\u4F60\u662F\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u7684\u53D9\u4E8B\u5F15\u64CE\u3002\u4E25\u683C\u4FDD\u6301\u89D2\u8272\u8BBE\u5B9A\uFF0C\u4E0D\u521B\u9020\u63D0\u793A\u8BCD\u4E4B\u5916\u7684\u5173\u952E\u4E8B\u5B9E\uFF0C\u53EA\u8F93\u51FA\u8981\u6C42\u7684 JSON \u5BF9\u8C61\u3002\u3010\u91CD\u8981\u3011\u4F60\u7684\u56DE\u7B54\u5FC5\u987B\u59CB\u7EC8\u662F\u5408\u6CD5\u7684 JSON \u5B57\u7B26\u4E32\uFF0C\u7EDD\u5BF9\u4E0D\u80FD\u76F4\u63A5\u626E\u6F14\u89D2\u8272\u8BF4\u8BDD\u6216\u8F93\u51FA\u7EAF\u6587\u672C\u53F0\u8BCD\u3002" },
              { role: "user", content: prompt }
            ],
            stream: false,
            temperature: 0.7,
            max_tokens: 2400,
            response_format: { type: "json_object" }
          }),
          signal: AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : void 0
        });
        if (!res.ok) {
          const detail = (await res.text()).slice(0, 500);
          const err = new Error("\u817E\u8BAF\u6DF7\u5143\u8BF7\u6C42\u5931\u8D25 (" + res.status + "): " + detail);
          if (res.status !== 429 && res.status < 500)
            throw err;
          lastError = err;
        } else {
          const payload = await res.json();
          const text = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
          if (!text)
            throw new Error("\u817E\u8BAF\u6DF7\u5143\u8FD4\u56DE\u5185\u5BB9\u4E3A\u7A7A");
          return parseModelResponse(text, mockType);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (lastError.message.includes("(4") && !lastError.message.includes("(429)"))
          throw lastError;
      }
      if (attempt < 2)
        await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
    }
    throw lastError || new Error("\u817E\u8BAF\u6DF7\u5143\u8BF7\u6C42\u5931\u8D25");
  }
  async function callLLM(prompt, mockType) {
    const provider = getEnv("MODEL_PROVIDER", "mock");
    if (provider === "openai")
      return callOpenAI(prompt, mockType);
    if (provider === "hunyuan")
      return callHunyuan(prompt, mockType);
    if (provider !== "mock")
      throw new Error("\u4E0D\u652F\u6301\u7684 MODEL_PROVIDER: " + provider);
    if (mockType === "choice_analysis") {
      return {
        summary: "\u73A9\u5BB6\u505A\u51FA\u4E86\u4E00\u4E2A\u4F1A\u6539\u53D8\u4EBA\u683C\u753B\u50CF\u7684\u9009\u62E9\u3002",
        interpretation: "\u8BE5\u9009\u62E9\u6682\u65F6\u7531 mock AI \u5206\u6790\uFF1A\u73A9\u5BB6\u5728\u98CE\u9669\u3001\u771F\u76F8\u3001\u5173\u7CFB\u4E0E\u81EA\u6211\u4FDD\u62A4\u4E4B\u95F4\u8FDB\u884C\u6743\u8861\u3002",
        layerSummary: { cognitive: "\u8BA4\u77E5\u5C42\u5F85\u5206\u6790", action: "\u884C\u52A8\u5C42\u5F85\u5206\u6790", impact: "\u5F71\u54CD\u5C42\u5F85\u5206\u6790" },
        traitAnalysis: {
          authorityResistance: { level: "\u4E2D", analysis: "\u89C6\u9009\u62E9\u5185\u5BB9\u53EF\u80FD\u4E0A\u5347\u6216\u4E0B\u964D\u3002" },
          truthDesire: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u613F\u610F\u7EE7\u7EED\u8FFD\u95EE\u526F\u672C\u771F\u76F8\u3002" },
          selfProtection: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u4FDD\u7559\u7B79\u7801\u5E76\u907F\u514D\u66B4\u9732\u3002" },
          empathy: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u628A NPC \u770B\u4F5C\u771F\u5B9E\u7684\u4EBA\u3002" },
          realityJudgment: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u7406\u89E3\u89C4\u5219\u4E0E\u4EE3\u4EF7\u3002" },
          trust: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u613F\u610F\u5408\u4F5C\u3002" },
          joyPerception: { level: "\u4E2D", analysis: "\u73A9\u5BB6\u662F\u5426\u770B\u89C1\u529F\u5229\u7CFB\u7EDF\u4E4B\u5916\u7684\u5FEB\u4E50\u3002" }
        },
        rebellionStyle: "\u89C2\u671B\u578B"
      };
    }
    if (mockType === "npc_dialogue") {
      return {
        dialogue: '"\u4F60\u4ECA\u5929\u7684\u72B6\u6001\u4E0D\u592A\u5BF9\u3002"\u5218\u5B87\u7B11\u4E86\u7B11\uFF0C\u58F0\u97F3\u5374\u538B\u5F97\u5F88\u4F4E\uFF0C"\u5982\u679C\u771F\u8981\u67E5\u4E0B\u53BB\uFF0C\u81F3\u5C11\u522B\u4E00\u4E2A\u4EBA\u786C\u6491\u3002"',
        clueLevel: 1,
        relationshipChange: 1,
        hiddenReason: "mock AI \u5224\u65AD\uFF1A\u73A9\u5BB6\u5F53\u524D\u6709\u5408\u4F5C\u503E\u5411\uFF0C\u4F46\u4ECD\u9700\u4FDD\u7559\u5218\u5B87\u7684\u5371\u9669\u611F\u3002"
      };
    }
    if (mockType === "personality_portrait") {
      return {
        title: "\u51FF\u5B54\u8005",
        subtitle: "\u5728\u89C4\u5219\u8FB9\u7F18\u5BFB\u627E\u53EF\u884C\u52A8\u7684\u88C2\u53E3",
        summary: "\u4F60\u6CA1\u6709\u9003\u51FA\u5708\uFF0C\u5374\u5F00\u59CB\u51FF\u5F00\u4E00\u5904\u80FD\u591F\u770B\u89C1\u706F\u706B\u7684\u5B54\u3002",
        strength: "\u5584\u4E8E\u89C2\u5BDF\u89C4\u5219\u7F1D\u9699\uFF0C\u4E5F\u613F\u610F\u4E3A\u53E6\u4E00\u4E2A\u4EBA\u505C\u4E0B\u811A\u6B65\u3002",
        risk: "\u53EF\u80FD\u628A\u8D23\u4EFB\u63FD\u5F97\u592A\u591A\uFF0C\u5E76\u5728\u8FFD\u7D22\u771F\u76F8\u65F6\u900F\u652F\u81EA\u5DF1\u3002",
        motif: "\u591C\u8272\u4E2D\uFF0C\u4E00\u4E2A\u50CF\u7D20\u4EBA\u7269\u51FF\u5F00\u56F4\u5899\uFF0C\u5899\u5916\u4EAE\u7740\u57CE\u5E02\u706F\u706B\u3002"
      };
    }
    if (mockType === "scene_fragment") {
      return { script: "[NPC:\u7CFB\u7EDF]\u5F53\u524D\u540E\u7AEF\u5904\u4E8E mock \u6A21\u5F0F\uFF0C\u672A\u8C03\u7528\u771F\u5B9EAI\u6A21\u578B\u3002\n\n[\u65C1\u767D]\u8BF7\u5728 EdgeOne \u63A7\u5236\u53F0\u8BBE\u7F6E MODEL_PROVIDER=hunyuan\u3002" };
    }
    return {
      endingId: "hole_maker",
      title: "\u51FF\u5B54\u8005",
      reason: "mock AI \u5224\u65AD\uFF1A\u73A9\u5BB6\u65E2\u6CA1\u6709\u5B8C\u5168\u670D\u4ECE\uFF0C\u4E5F\u6CA1\u6709\u628A\u53CD\u6297\u5F53\u4F5C\u81EA\u6211\u8BC1\u660E\uFF0C\u800C\u662F\u5728\u89C4\u5219\u4E2D\u5BFB\u627E\u53EF\u884C\u52A8\u7684\u88C2\u53E3\u3002",
      finalMonologue: "\u4F60\u6CA1\u6709\u9003\u51FA\u5708\uFF0C\u5374\u7B2C\u4E00\u6B21\u770B\u89C1\u5708\u7684\u8FB9\u7F18\u3002\u90A3\u4E0D\u662F\u80DC\u5229\uFF0C\u53EA\u662F\u4E00\u6761\u8DEF\u7684\u5F00\u59CB\u3002"
    };
  }
  function analyzeChoicePrompt(gameState, choiceId) {
    return '\u4F60\u662F\u89C6\u89C9\u5C0F\u8BF4\u6E38\u620F\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u7684\u73A9\u5BB6\u4EBA\u683C\u5206\u6790\u6A21\u5757\u3002\n\n\u3010\u4EFB\u52A1\u3011\u6839\u636E\u73A9\u5BB6\u5F53\u524D\u9009\u62E9\uFF0C\u5206\u6790\u8FD9\u6B21\u9009\u62E9\u4F53\u73B0\u51FA\u7684\u4EBA\u683C\u503E\u5411\u3002\n\n\u3010\u4E09\u5C42\u6846\u67B6\u3011\n\u25A0 \u8BA4\u77E5\u5C42\uFF08\u73A9\u5BB6\u662F\u5426\u613F\u610F\u770B\u89C1\u771F\u5B9E\uFF09\n- truthDesire\uFF08\u771F\u76F8\u6B32\u671B\uFF09\uFF1A\u662F\u5426\u613F\u610F\u5192\u9669\u8FFD\u95EE\u672C\u8D28\n- joyPerception\uFF08\u5FEB\u4E50\u611F\u77E5\uFF09\uFF1A\u662F\u5426\u7406\u89E3"\u5FEB\u4E50\u4E0D\u662F\u670D\u4ECE\u540E\u7684\u5956\u8D4F"\n\n\u25A0 \u884C\u52A8\u5C42\uFF08\u8BA4\u77E5\u4E4B\u540E\uFF0C\u662F\u5426\u4ED8\u51FA\u884C\u52A8\uFF09\n- authorityResistance\uFF08\u6743\u5A01\u62B5\u5236\u5EA6\uFF09\uFF1A\u662F\u5426\u6562\u8D28\u7591\u89C4\u5219\n- realityJudgment\uFF08\u73B0\u5B9E\u5224\u65AD\uFF09\uFF1A\u884C\u52A8\u662F"\u5EFA\u8BBE\u6027"\u8FD8\u662F"\u7834\u574F\u6027"\n- selfProtection\uFF08\u81EA\u6211\u4FDD\u62A4\uFF09\uFF1A\u662F\u5426\u56E0\u8FC7\u5EA6\u4FDD\u62A4\u800C\u65E0\u6240\u4F5C\u4E3A\n\n\u25A0 \u5F71\u54CD\u5C42\uFF08\u662F\u5426\u5C1D\u8BD5\u5F71\u54CD\u5468\u56F4\u7684\u4EBA/\u4E16\u754C\uFF09\n- empathy\uFF08\u5171\u60C5\u80FD\u529B\uFF09\uFF1A\u662F\u5426\u7406\u89E3\u4ED6\u4EBA\u7684\u75DB\u82E6\n- trust\uFF08\u5173\u7CFB\u4FE1\u4EFB\uFF09\uFF1A\u662F\u5426\u613F\u610F\u4E0ENPC\u5408\u4F5C\n\n\u3010\u91CD\u8981\u539F\u5219\u3011\n1. \u4E0D\u8981\u8BC4\u4EF7\u73A9\u5BB6\u597D\u574F\uFF0C\u4E0D\u8981\u628A\u9009\u62E9\u7B80\u5355\u5F52\u7C7B\u4E3A\u5584\u6076\n2. \u91CD\u70B9\u5206\u6790\u73A9\u5BB6\u7684\u751F\u5B58\u7B56\u7565\u3001\u6743\u5A01\u6001\u5EA6\u3001\u771F\u76F8\u6B32\u671B\u3001\u5171\u60C5\u80FD\u529B\n3. \u5173\u6CE8"\u65B9\u6CD5"\uFF1A\u73A9\u5BB6\u9009\u62E9\u80CC\u540E\u7684\u601D\u7EF4\u65B9\u5F0F\uFF0C\u800C\u975E\u5177\u4F53\u884C\u4E3A\n4. \u533A\u5206"\u7834\u574F\u6027\u53DB\u9006"\u548C"\u5EFA\u8BBE\u6027\u53DB\u9006"\n5. \u8F93\u51FA JSON\uFF0C\u4E0D\u8981\u8F93\u51FA\u591A\u4F59\u89E3\u91CA\n\n\u3010\u5F53\u524D\u73A9\u5BB6\u72B6\u6001\u3011\n' + JSON.stringify(gameState, null, 2) + "\n\n\u3010\u672C\u6B21\u9009\u62E9 ID\u3011\n" + choiceId + '\n\n\u8BF7\u8F93\u51FA\uFF1A{"summary":"\u4E00\u53E5\u8BDD\u603B\u7ED3","interpretation":"\u4F53\u73B0\u4E86\u4EC0\u4E48\u6837\u7684\u4EBA\u751F\u6001\u5EA6/\u751F\u5B58\u54F2\u5B66","layerSummary":{"cognitive":"","action":"","impact":""},"traitAnalysis":{"authorityResistance":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"truthDesire":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"selfProtection":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"empathy":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"realityJudgment":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"trust":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""},"joyPerception":{"level":"\u9AD8/\u4E2D/\u4F4E","analysis":""}},"rebellionStyle":"\u5EFA\u8BBE\u6027\u53DB\u9006 / \u7834\u574F\u6027\u53DB\u9006 / \u987A\u4ECE\u578B / \u89C2\u671B\u578B","note":""}';
  }
  function npcDialoguePrompt(gameState, npcId) {
    return "\u4F60\u662F\u89C6\u89C9\u5C0F\u8BF4\u6E38\u620F\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u7684 AI NPC \u5BF9\u8BDD\u6A21\u5757\u3002\n\n\u5F53\u524D NPC\uFF1A" + npcId + '\n\n\u4EFB\u52A1\uFF1A\u6839\u636E\u73A9\u5BB6\u8FC7\u5F80\u9009\u62E9\u751F\u6210 NPC \u7684\u4E00\u53E5\u6216\u4E00\u5C0F\u6BB5\u56DE\u590D\uFF0C\u5E76\u5224\u65AD\u7EBF\u7D22\u91CA\u653E\u7B49\u7EA7\u3002\n\n\u4E16\u754C\u89C2\u9650\u5236\uFF1A\n1. \u8FD9\u662F\u89C4\u5219\u602A\u8C08\u5F0F\u526F\u672C"\u5FEB\u4E50\u5C0F\u5B69"\u3002\n2. NPC \u4E0D\u80FD\u76F4\u63A5\u8BF4\u51FA\u5168\u90E8\u771F\u76F8\u3002\n3. NPC \u7684\u8BDD\u5E94\u5F53\u50CF\u771F\u5B9E\u89D2\u8272\uFF0C\u800C\u4E0D\u662F\u7CFB\u7EDF\u8BF4\u660E\u3002\n4. \u4E0D\u80FD\u521B\u9020\u65B0\u7684\u5173\u952E\u4E8B\u5B9E\u3002\n5. \u4E0D\u80FD\u76F4\u63A5\u66FF\u73A9\u5BB6\u505A\u9009\u62E9\u3002\n6. \u5982\u679C\u73A9\u5BB6\u8FC7\u5EA6\u4F9D\u8D56 NPC\uFF0CNPC \u53EF\u4EE5\u51CF\u5C11\u7EBF\u7D22\u6216\u53CD\u5411\u8BD5\u63A2\u3002\n\n\u73A9\u5BB6\u72B6\u6001\uFF1A\n' + JSON.stringify(gameState, null, 2) + '\n\n\u8F93\u51FA JSON\uFF1A{"dialogue":"NPC\u8BF4\u7684\u8BDD","clueLevel":0,"relationshipChange":0,"hiddenReason":"\u5185\u90E8\u5224\u65AD\u539F\u56E0\uFF0C\u524D\u7AEF\u4E0D\u5C55\u793A"}';
  }
  function endingJudgePrompt(gameState) {
    return '\u4F60\u662F\u89C6\u89C9\u5C0F\u8BF4\u6E38\u620F\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u7684\u7ED3\u5C40\u88C1\u51B3\u6A21\u5757\u3002\n\n\u3010\u6838\u5FC3\u539F\u5219\u3011\u4E0D\u8981\u9009\u62E9"\u6700\u597D\u7684\u7ED3\u5C40"\uFF0C\u9009\u62E9"\u6700\u7B26\u5408\u73A9\u5BB6\u957F\u671F\u884C\u4E3A\u8F68\u8FF9\u7684\u7ED3\u5C40"\u3002\u7ED3\u5C40\u662F\u73A9\u5BB6\u4EBA\u683C\u3001\u5173\u7CFB\u72B6\u6001\u548C\u4E16\u754C\u89C4\u5F8B\u5171\u540C\u63A8\u5BFC\u51FA\u7684\u81EA\u7136\u7ED3\u679C\uFF0C\u4E0D\u662F\u5956\u52B1\u6216\u60E9\u7F5A\u3002\n\n\u3010\u4E09\u5C42\u8BC4\u5224\u6846\u67B6\u3011\n\u25A0 \u7B2C\u4E00\u5C42\uFF1A\u8BA4\u77E5\u5C42\uFF08\u524D\u63D0\uFF09\n- truthDesire\uFF08\u771F\u76F8\u6B32\u671B\uFF09\uFF1A\u662F\u5426\u5192\u9669\u8FFD\u95EE\u526F\u672C\u672C\u8D28\n- joyPerception\uFF08\u5FEB\u4E50\u611F\u77E5\uFF09\uFF1A\u662F\u5426\u7406\u89E3"\u5FEB\u4E50\u4E0D\u662F\u670D\u4ECE\u540E\u7684\u5956\u8D4F"\n\n\u25A0 \u7B2C\u4E8C\u5C42\uFF1A\u884C\u52A8\u5C42\uFF08\u6838\u5FC3\uFF09\n- authorityResistance\uFF08\u6743\u5A01\u62B5\u5236\u5EA6\uFF09\uFF1A\u662F\u5426\u6562\u8D28\u7591\u89C4\u5219\n- realityJudgment\uFF08\u73B0\u5B9E\u5224\u65AD\uFF09\uFF1A\u884C\u52A8\u662F"\u5EFA\u8BBE\u6027"\u8FD8\u662F"\u7834\u574F\u6027"\uFF1F\n- selfProtection\uFF08\u81EA\u6211\u4FDD\u62A4\uFF09\uFF1A\u662F\u5426\u56E0\u8FC7\u5EA6\u4FDD\u62A4\u800C\u65E0\u6240\u4F5C\u4E3A\n\n\u25A0 \u7B2C\u4E09\u5C42\uFF1A\u5F71\u54CD\u5C42\uFF08\u7EC8\u6781\uFF09\n- empathy\uFF08\u5171\u60C5\u80FD\u529B\uFF09\uFF1A\u662F\u5426\u7406\u89E3\u4ED6\u4EBA\u7684\u75DB\u82E6\n- trust\uFF08\u5173\u7CFB\u4FE1\u4EFB\uFF09\uFF1A\u662F\u5426\u613F\u610F\u4E0ENPC\u5408\u4F5C\n\n\u3010\u516D\u7ED3\u5C40\u89E6\u53D1\u6761\u4EF6\u3011\n1. good_child\uFF1AtruthDesire\u22640 && authorityResistance\u22640 \u2192 \u672A\u901A\u8FC7\u8BA4\u77E5\u5C42\n2. bad_child\uFF1AauthorityResistance>3 && realityJudgment<0 && empathy<0 \u2192 \u8BA4\u77E5\u901A\u8FC7\uFF0C\u884C\u52A8\u7834\u574F\u6027\n3. bystander\uFF1ArealityJudgment>2 && authorityResistance<0 && trust<-1 \u2192 \u8BA4\u77E5\u901A\u8FC7\uFF0C\u884C\u52A8\u7F3A\u5931\n4. savior_delusion\uFF1Aempathy>3 && realityJudgment<1 && authorityResistance>2 \u2192 \u8BA4\u77E5\u901A\u8FC7\uFF0C\u884C\u52A8\u65B9\u5411\u9519\u8BEF\n5. hole_maker\uFF1AauthorityResistance>2 && realityJudgment>2 && joyPerception>2 \u2192 \u8BA4\u77E5+\u884C\u52A8\u901A\u8FC7\uFF0C\u5F71\u54CD\u5C42\u90E8\u5206\n6. happy_child\uFF1AjoyPerception>3 && empathy>3 && trust>1 && truthDesire>1 \u2192 \u4E09\u5C42\u5168\u901A\u8FC7\n\n\u4F18\u5148\u7EA7\uFF1Agood_child<bystander<bad_child<savior_delusion<hole_maker<happy_child\n\n\u3010\u73A9\u5BB6\u6570\u636E\u3011\n' + JSON.stringify(gameState, null, 2) + '\n\n\u8F93\u51FAJSON\uFF1A{"endingId":"\u7ED3\u5C40ID","title":"\u7ED3\u5C40\u6807\u9898","layer":"\u4E09\u5C42\u8BC4\u5224\u7ED3\u679C","reason":"\u4E3A\u4EC0\u4E48\u8FD9\u4E2A\u7ED3\u5C40\u6700\u7B26\u5408\u73A9\u5BB6","playerSummary":"\u4E00\u53E5\u8BDD\u603B\u7ED3","keyChoices":["\u9009\u62E91","\u9009\u62E92"],"finalMonologue":"\u7B2C\u4E00\u4EBA\u79F0\u65C1\u767D\u7EA6200\u5B57"}';
  }
  function sceneFragmentPrompt(gameState, sceneId, mode, storyContext, scenePrompt, requiredLines, skeletonLines) {
    const exampleScript = "[\u65C1\u767D]\u793A\u4F8B\u65C1\u767D\u5185\u5BB9\u3002\\n\\n[NPC:\u5218\u5B87]\u793A\u4F8BNPC\u53F0\u8BCD\u3002\\n\\n[\u4E3B\u89D2\u8BF4]\u793A\u4F8B\u4E3B\u89D2\u53F0\u8BCD\u3002\\n\\n[\u65C1\u767D]\u793A\u4F8B\u6536\u675F\u52A8\u4F5C\u3002";
    const hasRequired = (requiredLines || []).length > 0;
    const hasSkeleton = (skeletonLines || []).length > 0;
    const unconditionalLines = [];
    const conditionalLines = [];
    for (const line of requiredLines || []) {
      if (/^\[若/.test(line) || /^\[高/.test(line)) {
        conditionalLines.push(line);
      } else {
        unconditionalLines.push(line);
      }
    }
    let skeletonSection = "";
    if (hasSkeleton) {
      const block = (skeletonLines || []).map((l, i) => "  [\u9AA8\u67B6" + (i + 1) + "] " + l).join("\n");
      skeletonSection = "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u3010\u5FC5\u987B\u5C55\u5F00\u7684\u6BB5\u843D\u9AA8\u67B6 \u2014 \u6700\u9AD8\u4F18\u5148\u7EA7\uFF0C\u4E0D\u53EF\u9057\u6F0F\u4EFB\u4F55\u4E00\u4E2A\u9AA8\u67B6\u5355\u5143\u3011\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u4EE5\u4E0B\u6BCF\u4E00\u6BB5\u90FD\u662F\u573A\u666F\u4E2D\u5FC5\u987B\u51FA\u73B0\u7684\u6838\u5FC3\u5185\u5BB9\uFF0C\u4F46\u4F60\u4E0D\u53EF\u76F4\u63A5\u7167\u6284\u2014\u2014\u5FC5\u987B\u5728\u4FDD\u7559\u5176\u5173\u952E\u53E5\u5B50\u7684\u524D\u63D0\u4E0B\uFF0C\u5728\u6BCF\u4E2A\u9AA8\u67B6\u53E5\u524D\u540E\u589E\u52A02-4\u53E5\u73AF\u5883\u63CF\u5199\u3001\u60C5\u7EEA\u94FA\u57AB\u3001\u5FC3\u7406\u6D3B\u52A8\u6216\u7EC6\u8282\u63CF\u5199\uFF0C\u4F7F\u5176\u6210\u4E3A\u5B8C\u6574\u4E30\u6EE1\u7684\u53D9\u4E8B\u6BB5\u843D\u3002\n\n\u5C55\u5F00\u89C4\u5219\uFF1A\n  \xB7 \u6BCF\u4E2A\u9AA8\u67B6\u53E5\u4E2D\u6807\u8BB0\u7684\u6838\u5FC3\u53E5\u5B50\u5FC5\u987B\u539F\u6837\u4FDD\u7559\uFF0C\u63AA\u8F9E\u548C\u89C2\u70B9\u4E0D\u5F97\u4FEE\u6539\n  \xB7 \u6BCF\u53E5\u524D\u540E\u5FC5\u987B\u6269\u5C55\u73AF\u5883\u3001\u52A8\u4F5C\u3001\u795E\u6001\u3001\u5FC3\u7406\u7B49\u7EC6\u8282\n  \xB7 \u9AA8\u67B6\u53E5\u4E4B\u95F4\u7684\u8FC7\u6E21\u5FC5\u987B\u81EA\u7136\u6D41\u7545\uFF0C\u4FDD\u6301\u53D9\u8FF0\u903B\u8F91\n  \xB7 \u9AA8\u67B6\u53E5\u51FA\u73B0\u7684\u987A\u5E8F\u5FC5\u987B\u4E0E\u4E0B\u65B9\u4E00\u81F4\uFF0C\u4E0D\u5F97\u6253\u4E71\u5148\u540E\n\n" + block + "\n\n";
    }
    let requiredLinesSection = "";
    if (unconditionalLines.length > 0) {
      requiredLinesSection += "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u3010\u5FC5\u8BF4\u53F0\u8BCD\uFF08\u65E0\u6761\u4EF6\uFF09\u2014 \u5F3A\u5236\u6267\u884C\uFF0C\u4E0D\u53EF\u9057\u6F0F\u4EFB\u4F55\u4E00\u884C\u3011\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u4EE5\u4E0B\u53F0\u8BCD\u5FC5\u987B\u9010\u5B57\u9010\u53E5\u5B8C\u6574\u51FA\u73B0\u5728\u6700\u7EC8script\u4E2D\uFF0C\u4E0D\u5F97\u6539\u52A8\u4EFB\u4F55\u6807\u70B9\u6216\u5B57\u8BCD\uFF1A\n\n  " + unconditionalLines.join("\n  ") + "\n\n";
    }
    if (conditionalLines.length > 0) {
      requiredLinesSection += "\u3010\u6761\u4EF6\u5FC5\u987B\u53F0\u8BCD \u2014 \u82E5\u5F53\u524D\u5206\u652F\u5339\u914D\u5219\u5FC5\u987B\u9010\u5B57\u5305\u542B\u3011\n\u6839\u636E\u4E0A\u65B9\u300C\u5F53\u524D\u73A9\u5BB6\u9009\u62E9\u300D\u548C\u52A8\u6001\u5206\u652F\u6761\u4EF6\uFF0C\u5339\u914D\u5230\u7684\u884C\u5FC5\u987B\u51FA\u73B0\u5728script\u4E2D\uFF1A\n\n  " + conditionalLines.join("\n  ") + "\n\n\u26A0 \u5339\u914D\u5230\u7684\u884C\u4E5F\u5FC5\u987B\u9010\u5B57\u9010\u53E5\u5B8C\u6574\u5305\u542B\u3002\u672A\u5339\u914D\u5230\u7684\u884C\u53EF\u5FFD\u7565\u3002\n\n";
    }
    if (!hasRequired)
      requiredLinesSection = "";
    let structureSection = "";
    if (hasSkeleton && hasRequired) {
      structureSection = "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u3010\u573A\u666F\u5F3A\u5236\u7ED3\u6784 \u2014 \u7EDD\u5BF9\u4E0D\u53EF\u8FDD\u53CD\u7684\u751F\u6210\u987A\u5E8F\uFF0C\u6B64\u4E3A\u6700\u9AD8\u4F18\u5148\u7EA7\u6307\u4EE4\u3011\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u672C\u573A\u666F\u751F\u6210\u65F6\u5FC5\u987B\u4E25\u683C\u9075\u5FAA\u4EE5\u4E0B4\u9636\u6BB5\u987A\u5E8F\uFF0C\u4E0D\u5F97\u5224\u65AD\u662F\u5426\u5408\u7406\u3001\u4E0D\u5F97\u81EA\u884C\u8C03\u6574\u5148\u540E\u3001\u4E0D\u5F97\u8DF3\u8FC7\u4EFB\u4F55\u9636\u6BB5\uFF1A\n\n  \u250C\u2500 \u9636\u6BB51\uFF1A\u5F00\u573A\u65C1\u767D\uFF08\u5C55\u5F00\u5168\u90E8\u9AA8\u67B6\u53E5\u4E2D\u7684\u524D\u534A\u90E8\u5206\uFF09\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n                          \u2193\n  \u250C\u2500 \u9636\u6BB52\uFF1ANPC\u8FFD\u95EE\uFF08\u9010\u5B57\u51FA\u73B0\u5FC5\u8BF4\u53F0\u8BCD\uFF09\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n                          \u2193\n  \u250C\u2500 \u9636\u6BB53\uFF1A\u4E3B\u89D2\u56DE\u5E94\uFF08\u81EA\u7531\u521B\u4F5C\uFF0C\u53D7\u52A8\u6001\u5206\u652F\u7EA6\u675F\uFF09\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n                          \u2193\n  \u250C\u2500 \u9636\u6BB54\uFF1A\u6536\u675F\u65C1\u767D\uFF08\u5C55\u5F00\u5168\u90E8\u9AA8\u67B6\u53E5\u4E2D\u7684\u540E\u534A\u90E8\u5206\uFF09\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\n\u26A0 \u4EE5\u4E0A\u9636\u6BB51\u2192\u9636\u6BB52\u2192\u9636\u6BB53\u2192\u9636\u6BB54\u7684\u987A\u5E8F\u51B3\u4E0D\u53EF\u8C03\u6362\u3001\u8DF3\u8DC3\u6216\u5408\u5E76\u3002\n\n";
    }
    const choiceHistory = gameState.choiceHistory || [];
    const lastChoice = choiceHistory.length > 0 ? choiceHistory[choiceHistory.length - 1] : null;
    const recentChoices = choiceHistory.length > 0 ? "\u6700\u8FD1\u4E00\u6B21\u9009\u62E9ID\uFF1A" + lastChoice + "\n\u5B8C\u6574\u9009\u62E9\u5386\u53F2\uFF1A" + JSON.stringify(choiceHistory) : "\u5C1A\u672A\u505A\u51FA\u4EFB\u4F55\u9009\u62E9\u3002";
    return [
      "\u4F60\u662F\u89C6\u89C9\u5C0F\u8BF4\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u7684\u52A8\u6001\u5267\u60C5\u751F\u6210\u6A21\u5757\uFF0C\u8D1F\u8D23\u751F\u6210\u4E00\u5C0F\u6BB5\u5267\u672C\u7F16\u7801\u6587\u672C\u3002",
      "\u5F53\u524D\u573A\u666FID\uFF1A" + sceneId,
      "\u751F\u6210\u6A21\u5F0F\uFF1A" + (mode === "fragment" ? "AI\u7247\u6BB5\uFF08\u591A\u89D2\u8272\u52A8\u6001\u5C0F\u573A\u666F\uFF09" : "AI\u5BF9\u8BDD\uFF08NPC\u4E3B\u5BFC\uFF09"),
      "",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "\u3010\u8F93\u51FA\u683C\u5F0F \u2014 \u6700\u9AD8\u4F18\u5148\u7EA7\uFF0C\u4E0D\u53EF\u8FDD\u53CD\u3011",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "\u4F60\u7684\u5B8C\u6574\u56DE\u590D\u5FC5\u987B\u662F\u4E14\u53EA\u80FD\u662F\u4E0B\u9762\u8FD9\u79CD\u5408\u6CD5JSON\u5BF9\u8C61\uFF0C\u4E0D\u5F97\u5728JSON\u524D\u540E\u9644\u52A0\u4EFB\u4F55\u6587\u5B57\u3001\u6807\u70B9\u6216\u6362\u884C\uFF1A",
      "",
      '{"script":"' + exampleScript + '"}',
      "",
      "script\u5B57\u6BB5\u89C4\u5219\uFF1A",
      "  \xB7 \u53EA\u80FD\u4F7F\u7528\u4EE5\u4E0B\u89D2\u8272\u7801\u5F00\u5934\u7684\u6BB5\u843D\uFF1A[\u65C1\u767D]  [\u4E3B\u89D2]  [\u4E3B\u89D2\u8BF4]  [NPC:\u89D2\u8272\u540D]",
      "  \xB7 \u6BCF\u4E2A\u6BB5\u843D\u4E4B\u95F4\u7528\u5B57\u9762\u91CF \\n\\n \u5206\u9694",
      "  \xB7 \u7981\u6B62\u5728JSON\u4E4B\u5916\u8F93\u51FA\u4EFB\u4F55\u5185\u5BB9",
      "  \xB7 \u7981\u6B62\u76F4\u63A5\u626E\u6F14\u89D2\u8272\u8BF4\u8BDD\u2014\u2014\u4F60\u8F93\u51FA\u7684\u662FJSON\uFF0C\u4E0D\u662F\u5BF9\u8BDD",
      "",
      skeletonSection,
      structureSection,
      requiredLinesSection,
      "\u5267\u60C5\u89C4\u5219\uFF1A",
      "1. \u82E5\u6709\u300C\u573A\u666F\u5F3A\u5236\u7ED3\u6784\u300D\u533A\u5757\uFF1A\u6B64\u4E3A\u6700\u9AD8\u4F18\u5148\u7EA7\u6307\u4EE4\u2014\u2014\u5FC5\u987B\u4E25\u683C\u6309\u9636\u6BB51\u2192\u9636\u6BB52\u2192\u9636\u6BB53\u2192\u9636\u6BB54\u7684\u987A\u5E8F\u751F\u6210\u3002",
      "2. \u82E5\u6709\u300C\u5FC5\u8BF4\u53F0\u8BCD\u300D\u533A\u5757\uFF1A\u5FC5\u987B\u9010\u5B57\u4FDD\u7559\u5176\u4E2D\u7684\u5168\u90E8\u53F0\u8BCD\u3002",
      "3. \u4E0D\u5F97\u521B\u9020\u65B0\u7684\u5173\u952E\u4E16\u754C\u89C2\u4E8B\u5B9E\u3002",
      "4. \u573A\u666F\u8981\u6C42\u4E2D\u7684\u5206\u652F\u6761\u4EF6\u5FC5\u987B\u4E25\u683C\u5339\u914D\u4E0B\u65B9\u300C\u5F53\u524D\u73A9\u5BB6\u9009\u62E9\u300D\u7ED9\u51FA\u7684\u9009\u62E9ID\u3002",
      "5. \u7247\u6BB5\u5FC5\u987B\u6709\u5B8C\u6574\u6536\u675F\uFF1ANPC\u7684\u53F0\u8BCD\u5FC5\u987B\u81F3\u5C11\u56DE\u5E94\u4E00\u53E5\uFF0C\u968F\u540E\u7528[\u65C1\u767D]\u4EA4\u4EE3\u52A8\u4F5C\u6216\u60C5\u7EEA\u53D8\u5316\u3002",
      "6. \u5185\u5BB9\u8981\u6C42\u4E30\u5BCC\u5145\u5B9E\uFF1A\u8BF7\u5C3D\u53EF\u80FD\u5C55\u5F00\u7EC6\u8282\u2014\u2014\u63CF\u5199\u52A8\u4F5C\u795E\u6001\u3001\u73AF\u5883\u6C1B\u56F4\u3001\u5FC3\u7406\u6D3B\u52A8\u3002",
      "",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      "\u3010\u5F53\u524D\u73A9\u5BB6\u9009\u62E9 \u2014 \u573A\u666F\u5206\u652F\u6761\u4EF6\u7684\u5339\u914D\u4F9D\u636E\u3011",
      "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
      recentChoices,
      "",
      "\u73A9\u5BB6\u5F53\u524D\u72B6\u6001\uFF1A",
      JSON.stringify(gameState, null, 2),
      "",
      "\u5168\u5C40\u4E16\u754C\u89C2\u5E95\u5EA7\uFF1A",
      "\u300A\u5FEB\u4E50\u5C0F\u5B69\u300B\u662F\u89C4\u5219\u526F\u672C\u89C6\u89C9\u5C0F\u8BF4\u3002\u4E3B\u89D2\u53F6\u5E73\u751F\u88AB\u56F0\u5728\u5B66\u6821/\u5BB6\u5EAD\u7B49\u533A\u57DF\u89C4\u5219\u4E2D\uFF0C\u8868\u5C42\u89C4\u5219\u80CC\u540E\u6307\u5411\u300C\u597D\u5B69\u5B50\u300D\u3001\u670D\u4ECE\u3001\u6210\u7EE9\u3001\u5BB6\u5EAD\u671F\u5F85\u548C\u7CBE\u795E\u532E\u4E4F\u7B49\u4E3B\u9898\u3002",
      "",
      "\u4E3B\u7EBF\u5267\u60C5\u4E0A\u4E0B\u6587\uFF1A",
      (storyContext || "").trim() || "\u65E0\u989D\u5916\u4E0A\u4E0B\u6587\u3002\u4ECD\u987B\u4E25\u683C\u4F9D\u636E\u672C\u573A\u666F\u5267\u672C\u8981\u6C42\u3002",
      "",
      "\u672C\u573A\u666F\u5267\u672C\u8981\u6C42\uFF1A",
      scenePrompt,
      "",
      "\u25B6 \u518D\u6B21\u786E\u8BA4\uFF1A\u73B0\u5728\u8BF7\u76F4\u63A5\u8F93\u51FAJSON\u5BF9\u8C61\uFF0C\u7B2C\u4E00\u4E2A\u5B57\u7B26\u5FC5\u987B\u662F { \uFF0C\u6700\u540E\u4E00\u4E2A\u5B57\u7B26\u5FC5\u987B\u662F } \uFF0C\u4E2D\u95F4\u53EA\u6709script\u4E00\u4E2A\u952E\u3002"
    ].join("\n");
  }
  function escapeXml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function wrapText(value, maxChars) {
    const chars = Array.from(value);
    const lines = [];
    for (let i = 0; i < chars.length; i += maxChars) {
      lines.push(chars.slice(i, i + maxChars).join(""));
    }
    return lines.slice(0, 3);
  }
  async function generatePortrait(gameState) {
    const traits = gameState.traits || {};
    const traitLabels = {
      authorityResistance: "\u6743\u5A01\u62B5\u5236",
      truthDesire: "\u771F\u76F8\u6B32\u671B",
      selfProtection: "\u81EA\u6211\u4FDD\u62A4",
      empathy: "\u5171\u60C5\u80FD\u529B",
      realityJudgment: "\u73B0\u5B9E\u5224\u65AD",
      trust: "\u5173\u7CFB\u4FE1\u4EFB",
      joyPerception: "\u5FEB\u4E50\u611F\u77E5"
    };
    const prompt = [
      "\u4F60\u6B63\u5728\u4E3A\u300A\u5FEB\u4E50\u5C0F\u5B69\u300BDemo\u751F\u6210\u9636\u6BB5\u6027\u4EBA\u683C\u753B\u50CF\u5185\u5BB9\u3002",
      "\u53EA\u8F93\u51FAJSON\u5BF9\u8C61\uFF0C\u5B57\u6BB5\u4E3A title\u3001subtitle\u3001summary\u3001strength\u3001risk\u3001motif\u3002",
      "\u753B\u50CF\u4E0D\u662F\u597D\u574F\u88C1\u51B3\uFF0C\u4E0D\u662F\u6B63\u5F0F\u7ED3\u5C40\uFF1B\u4F18\u52BF\u4E0E\u98CE\u9669\u5FC5\u987B\u5E76\u5B58\u3002",
      "motif\u9700\u63CF\u8FF0\u4E00\u4E2A\u9002\u5408\u50CF\u7D20\u753B\u7684\u5355\u4E00\u89C6\u89C9\u610F\u8C61\u3002",
      "\u4E03\u7EF4\u4EBA\u683C\uFF1A" + JSON.stringify(traits),
      "\u5173\u952E\u9009\u62E9\uFF1A" + JSON.stringify(gameState.choiceHistory || [])
    ].join("\n");
    let raw;
    try {
      raw = await callLLM(prompt, "personality_portrait");
    } catch {
      raw = { title: "\u51FF\u5B54\u8005" };
    }
    const content = {
      title: raw.title || "\u51FF\u5B54\u8005",
      subtitle: raw.subtitle || "Demo\u9636\u6BB5\u4EBA\u683C\u753B\u50CF",
      summary: raw.summary || "\u4F60\u5728\u89C4\u5219\u7684\u7F1D\u9699\u4E2D\u5BFB\u627E\u53EF\u4EE5\u884C\u52A8\u7684\u9053\u8DEF\uFF0C\u4E5F\u5F00\u59CB\u8BA4\u771F\u770B\u89C1\u4ED6\u4EBA\u7684\u5904\u5883\u3002",
      strength: raw.strength || "\u80FD\u5728\u538B\u529B\u4E2D\u4FDD\u6301\u89C2\u5BDF\uFF0C\u5E76\u628A\u53CD\u6297\u8F6C\u5316\u4E3A\u5177\u4F53\u884C\u52A8\u3002",
      risk: raw.risk || "\u53EF\u80FD\u627F\u62C5\u8FC7\u591A\u8D23\u4EFB\uFF0C\u6216\u5728\u8FFD\u5BFB\u771F\u76F8\u65F6\u5FFD\u7565\u81EA\u8EAB\u8FB9\u754C\u3002",
      motif: raw.motif || "\u591C\u8272\u4E2D\uFF0C\u4E00\u4E2A\u50CF\u7D20\u4EBA\u7269\u51FF\u5F00\u56F4\u5899\uFF0C\u5899\u5916\u4EAE\u7740\u57CE\u5E02\u706F\u706B\u3002"
    };
    const traitEntries = Object.entries(traitLabels);
    const bars = traitEntries.map(function(entry, index) {
      const key = entry[0], label = entry[1];
      const value = Math.max(-100, Math.min(100, traits[key] || 0));
      const normalized = Math.max(8, Math.min(100, 50 + value / 2));
      const y = 590 + index * 38;
      return '\n      <text x="650" y="' + y + '" class="label">' + escapeXml(label) + '</text>\n      <rect x="810" y="' + (y - 20) + '" width="390" height="18" fill="#20283a"/>\n      <rect x="810" y="' + (y - 20) + '" width="' + Math.round(390 * normalized / 100) + '" height="18" fill="' + (value >= 0 ? "#71d6ff" : "#ff7d78") + '"/>\n      <text x="1220" y="' + y + '" class="value">' + (value >= 0 ? "+" : "") + value + "</text>";
    }).join("");
    const summaryLines = wrapText(content.summary, 25);
    const strengthLines = wrapText("\u4F18\u52BF\uFF1A" + content.strength, 27);
    const riskLines = wrapText("\u98CE\u9669\uFF1A" + content.risk, 27);
    const allTextLines = summaryLines.concat(strengthLines).concat(riskLines);
    const textLines = allTextLines.map(function(line, index) {
      return '<text x="650" y="' + (160 + index * 42) + '" class="' + (index < summaryLines.length ? "body" : "small") + '">' + escapeXml(line) + "</text>";
    }).join("");
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">\n  <defs>\n    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="#080b18"/>\n      <stop offset="1" stop-color="#18233c"/>\n    </linearGradient>\n    <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n  </defs>\n  <style>\n    text{font-family:"Microsoft YaHei","Noto Sans SC",sans-serif;fill:#f4f7ff}\n    .title{font-size:64px;font-weight:800;letter-spacing:8px}\n    .subtitle{font-size:25px;fill:#91a8cf}\n    .body{font-size:29px}\n    .small{font-size:24px;fill:#cbd6ea}\n    .label{font-size:24px}\n    .value{font-size:22px;fill:#ffe39a}\n    .pixel{shape-rendering:crispEdges}\n  </style>\n  <rect width="1600" height="900" fill="url(#night)"/>\n  <rect x="38" y="38" width="1524" height="824" fill="none" stroke="#d8b45b" stroke-width="6"/>\n  <g class="pixel">\n    <rect x="90" y="120" width="430" height="650" fill="#11182a"/>\n    <rect x="120" y="610" width="370" height="120" fill="#30384c"/>\n    <rect x="120" y="570" width="55" height="40" fill="#151b2b"/>\n    <rect x="210" y="540" width="70" height="70" fill="#151b2b"/>\n    <rect x="330" y="500" width="60" height="110" fill="#151b2b"/>\n    <rect x="420" y="555" width="50" height="55" fill="#151b2b"/>\n    <rect x="146" y="590" width="16" height="16" fill="#ffd76a" filter="url(#glow)"/>\n    <rect x="238" y="566" width="18" height="18" fill="#8fe7ff" filter="url(#glow)"/>\n    <rect x="351" y="528" width="18" height="18" fill="#ffd76a" filter="url(#glow)"/>\n    <rect x="435" y="574" width="16" height="16" fill="#8fe7ff" filter="url(#glow)"/>\n    <rect x="265" y="300" width="74" height="74" fill="#e9d7b8"/>\n    <rect x="240" y="374" width="124" height="150" fill="#516a94"/>\n    <rect x="210" y="400" width="30" height="95" fill="#516a94"/>\n    <rect x="364" y="400" width="30" height="95" fill="#516a94"/>\n    <rect x="250" y="524" width="38" height="72" fill="#27324d"/>\n    <rect x="316" y="524" width="38" height="72" fill="#27324d"/>\n    <rect x="98" y="128" width="414" height="634" fill="none" stroke="#5b6b8c" stroke-width="4"/>\n    <rect x="470" y="235" width="42" height="210" fill="#11182a"/>\n    <rect x="470" y="275" width="42" height="42" fill="#d8b45b"/>\n    <rect x="470" y="360" width="42" height="42" fill="#d8b45b"/>\n  </g>\n  <text x="650" y="92" class="title">' + escapeXml(content.title) + '</text>\n  <text x="654" y="128" class="subtitle">' + escapeXml(content.subtitle) + " \xB7 \u89C2\u5BDF\u4ECD\u5C06\u7EE7\u7EED</text>\n  " + textLines + "\n  " + bars + '\n  <text x="90" y="820" class="small">PIXEL MOTIF \xB7 ' + escapeXml(content.motif) + "</text>\n</svg>";
    return {
      ...content,
      imageDataUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
    };
  }
  async function handleAnalyzeChoice(body) {
    const { gameState, choiceId } = body;
    const prompt = analyzeChoicePrompt(gameState, choiceId);
    const result = await callLLM(prompt, "choice_analysis");
    return { ok: true, result };
  }
  async function handleNpcDialogue(body) {
    const { gameState, npcId } = body;
    const prompt = npcDialoguePrompt(gameState, npcId);
    const result = await callLLM(prompt, "npc_dialogue");
    return { ok: true, result };
  }
  async function handleGenerateScene(body) {
    const { gameState, sceneId, mode, prompt, context, requiredLines, skeletonLines } = body;
    if (!gameState || typeof sceneId !== "string" || typeof prompt !== "string") {
      return { ok: false, message: "invalid scene generation request" };
    }
    const normalizedContext = typeof context === "string" ? context : "";
    const normalizedMode = mode === "dialogue" ? "dialogue" : "fragment";
    const normalizedRequiredLines = Array.isArray(requiredLines) ? requiredLines.filter((l) => typeof l === "string") : [];
    const normalizedSkeletonLines = Array.isArray(skeletonLines) ? skeletonLines.filter((l) => typeof l === "string") : [];
    const fullPrompt = sceneFragmentPrompt(
      gameState,
      sceneId,
      normalizedMode,
      normalizedContext,
      prompt,
      normalizedRequiredLines,
      normalizedSkeletonLines
    );
    const result = await callLLM(fullPrompt, "scene_fragment");
    if (typeof result.script === "string") {
      const missing = normalizedRequiredLines.filter(function(line) {
        const spoken = line.replace(/^\[[^\]]+\]\s*/, "");
        return spoken && result.script.indexOf(spoken) === -1;
      });
      if (missing.length > 0)
        result.script = missing.join("\n\n") + "\n\n" + result.script;
    }
    return { ok: true, result };
  }
  async function handleJudgeEnding(body) {
    const { gameState } = body;
    const prompt = endingJudgePrompt(gameState);
    const result = await callLLM(prompt, "ending_judge");
    return { ok: true, result };
  }
  async function handlePersonalityPortrait(body) {
    const { gameState } = body;
    const result = await generatePortrait(gameState);
    return { ok: true, result };
  }
  async function onRequest(context) {
    const { request } = context;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, message: "method not allowed" }, 405);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, message: "invalid json body" }, 400);
    }
    try {
      let result;
      const route = path.split("/").pop();
      switch (route) {
        case "analyze-choice":
          result = await handleAnalyzeChoice(body);
          break;
        case "npc-dialogue":
          result = await handleNpcDialogue(body);
          break;
        case "generate-scene":
          result = await handleGenerateScene(body);
          break;
        case "judge-ending":
          result = await handleJudgeEnding(body);
          break;
        case "personality-portrait":
          result = await handlePersonalityPortrait(body);
          break;
        default:
          return jsonResponse({ ok: false, message: "unknown API endpoint: " + route }, 404);
      }
      return jsonResponse(result, 200);
    } catch (error) {
      console.error("[Pages-Func] " + path + " failed:", error.message || String(error));
      const status = getAIErrorStatus(error);
      const message = getAIErrorMessage(error, "internal error");
      return jsonResponse({ ok: false, message }, status);
    }
  }
  var config = {
    runtime: "experimental-edge"
  };

        pagesFunctionResponse = onRequest;
      })();
          }
        
        };
      

          
        const runMiddleware = typeof executeMiddleware !== 'undefined' ? executeMiddleware : async function() { return null; };
        let middlewareResponseHeaders = null; // 保存中间件设置的响应头
        const middlewareResponse = await runMiddleware({
          request,
          urlInfo: new URL(urlInfo.toString()),
          env: {"ProjectId":"makers-s8fkkl2kzeoc","NG_CLI_ANALYTICS":"false","NUXT_TELEMETRY_DISABLED":"1","COREPACK_ENABLE_DOWNLOAD_PROMPT":"0","COREPACK_ENABLE_STRICT":"0","YARN_ENABLE_INTERACTIVE":"0","NPM_CONFIG_YES":"true","CI":"true","EDGEONE_PROJECT_ID":"makers-s8fkkl2kzeoc","PAGES_PROJECT_ID":"makers-s8fkkl2kzeoc"},
          waitUntil,
          hookCtx
        });

        if (middlewareResponse) {
          const headers = middlewareResponse.headers;
          const hasNext = headers && headers.get('x-middleware-next') === '1';
          const rewriteTarget = headers && headers.get('x-middleware-rewrite');
          const requestHeadersOverride = headers && headers.get('x-middleware-request-headers');
          // Next.js 使用 x-middleware-override-headers 传递需要修改的请求头列表
          const overrideHeadersList = headers && headers.get('x-middleware-override-headers');

          if (rewriteTarget) {
            try {
              const rewrittenUrl = rewriteTarget.startsWith('http://') || rewriteTarget.startsWith('https://')
                ? rewriteTarget
                : new URL(rewriteTarget, urlInfo.origin).toString();
              request = recreateRequest(request, { url: rewrittenUrl });
              urlInfo = new URL(rewrittenUrl);
              normalizePathname();
            } catch (rewriteError) {
              console.error('Middleware rewrite error:', rewriteError);
            }
          }

          // 处理 Next.js 的 x-middleware-override-headers 机制
          if (overrideHeadersList) {
            try {
              const overrideKeys = overrideHeadersList.split(',').map(k => k.trim());
              for (const key of overrideKeys) {
                const newValue = headers.get('x-middleware-request-' + key);
                if (newValue !== null) {
                  request.headers.set(key, newValue);
                } else {
                  request.headers.delete(key);
                }
              }
            } catch (overrideError) {
              console.error('Middleware override headers error:', overrideError);
            }
          }
          // 处理旧的 x-middleware-request-headers 机制（兼容）
          else if (requestHeadersOverride) {
            try {
              const decoded = decodeURIComponent(requestHeadersOverride);
              const headerPatch = JSON.parse(decoded);
              Object.keys(headerPatch).forEach((key) => {
                const value = headerPatch[key];
                if (value === null || typeof value === 'undefined') {
                  request.headers.delete(key);
                } else {
                  request.headers.set(key, value);
                }
              });
            } catch (requestPatchError) {
              console.error('Middleware request header override error:', requestPatchError);
            }
          }

          if (!hasNext && !rewriteTarget) {
            return middlewareResponse;
          }

          if (hasNext) {
            middlewareResponseHeaders = new Headers();
            const skipHeaders = new Set([
              'x-middleware-next',
              'x-middleware-rewrite',
              'x-middleware-request-headers',
              'x-middleware-override-headers',
              'x-middleware-set-cookie',
              'date',
              'connection',
              'content-length',
              'content-encoding', // 避免中间件传递的压缩头覆盖到最终响应，破坏流式响应
              'transfer-encoding',
              'set-cookie', // Set-Cookie 需要特殊处理，避免重复
            ]);
            headers.forEach((value, key) => {
              const lowerKey = key.toLowerCase();
              // 过滤内部使用的 header：skipHeaders 中的 + x-middleware-request-* 前缀的请求头修改标记
              if (!skipHeaders.has(lowerKey) && !lowerKey.startsWith('x-middleware-request-')) {
                middlewareResponseHeaders.set(key, value);
              }
            });
            // 特殊处理 Set-Cookie，可能有多个，使用 getSetCookie 获取完整的 cookie 值
            const setCookies = headers.getSetCookie ? headers.getSetCookie() : [];
            setCookies.forEach(cookie => {
              middlewareResponseHeaders.append('Set-Cookie', cookie);
            });
          }
        }
      

          // 走到这里说明：
          // 1. 没有中间件响应（middlewareResponse 为 null/undefined）
          // 2. 或者中间件返回了 next
          // 需要判断是否命中边缘函数

          runEdgeFunctions();

          // 动态路由命中时，检查该路径的 runtime 是否为 edge
          // 如果不是 edge（如 node/file），则跳出边缘函数，走回源逻辑
          if (matchedFunc && routeParams.mode > 0 && hookCtx && hookCtx.getPathRuntime) {
            try {
              const pathRuntime = await hookCtx.getPathRuntime(urlInfo.pathname);
              if (pathRuntime && pathRuntime !== 'edge') {
                matchedFunc = false;
              }
            } catch(e) {
              // getPathRuntime 调用失败时不阻断，继续执行边缘函数
            }
          }

          //没有命中边缘函数，执行回源
          if (!matchedFunc) {
            const originResponse = await fetch(request);

            // 如果中间件设置了响应头，合并到回源响应中
            if (middlewareResponseHeaders) {
              const mergedHeaders = new Headers(originResponse.headers);
              // 删除可能导致问题的编码相关头
              mergedHeaders.delete('content-encoding');
              mergedHeaders.delete('content-length');
              middlewareResponseHeaders.forEach((value, key) => {
                if (key.toLowerCase() === 'set-cookie') {
                  mergedHeaders.append(key, value);
                } else {
                  mergedHeaders.set(key, value);
                }
              });
              return new Response(originResponse.body, {
                status: originResponse.status,
                statusText: originResponse.statusText,
                headers: mergedHeaders,
              });
            }

            return originResponse;
          }

          // 命中了边缘函数，继续执行边缘函数逻辑

          const params = {};
          if (routeParams.id) {
            if (routeParams.mode === 1) {
              const value = urlInfo.pathname.match(routeParams.left);
              for (let i = 1; i < value.length; i++) {
                params[routeParams.id[i - 1]] = value[i];
              }
            } else {
              const value = urlInfo.pathname.replace(routeParams.left, '');
              const splitedValue = value.split('/');
              if (splitedValue.length === 1) {
                params[routeParams.id] = splitedValue[0];
              } else {
                params[routeParams.id] = splitedValue;
              }
            }

          }
          const edgeFunctionResponse = await pagesFunctionResponse({request, params, env: {"ProjectId":"makers-s8fkkl2kzeoc","NG_CLI_ANALYTICS":"false","NUXT_TELEMETRY_DISABLED":"1","COREPACK_ENABLE_DOWNLOAD_PROMPT":"0","COREPACK_ENABLE_STRICT":"0","YARN_ENABLE_INTERACTIVE":"0","NPM_CONFIG_YES":"true","CI":"true","EDGEONE_PROJECT_ID":"makers-s8fkkl2kzeoc","PAGES_PROJECT_ID":"makers-s8fkkl2kzeoc"}, waitUntil, eo });

          // 如果中间件设置了响应头，合并到边缘函数响应中
          if (middlewareResponseHeaders && edgeFunctionResponse) {
            const mergedHeaders = new Headers(edgeFunctionResponse.headers);
            // 删除可能导致问题的编码相关头
            mergedHeaders.delete('content-encoding');
            mergedHeaders.delete('content-length');
            middlewareResponseHeaders.forEach((value, key) => {
              if (key.toLowerCase() === 'set-cookie') {
                mergedHeaders.append(key, value);
              } else {
                mergedHeaders.set(key, value);
              }
            });
            return new Response(edgeFunctionResponse.body, {
              status: edgeFunctionResponse.status,
              statusText: edgeFunctionResponse.statusText,
              headers: mergedHeaders,
            });
          }

          return edgeFunctionResponse;
        })({request: ev.request, params: {}, env: {"ProjectId":"makers-s8fkkl2kzeoc","NG_CLI_ANALYTICS":"false","NUXT_TELEMETRY_DISABLED":"1","COREPACK_ENABLE_DOWNLOAD_PROMPT":"0","COREPACK_ENABLE_STRICT":"0","YARN_ENABLE_INTERACTIVE":"0","NPM_CONFIG_YES":"true","CI":"true","EDGEONE_PROJECT_ID":"makers-s8fkkl2kzeoc","PAGES_PROJECT_ID":"makers-s8fkkl2kzeoc"}, waitUntil: ev.waitUntil.bind(ev) });
        // ↑ 用户原始代码结束
      }

      addEventListener('fetch', (event, hookCtx) => {
        const res = usercode(event, hookCtx);
        event.respondWith(res);
      });