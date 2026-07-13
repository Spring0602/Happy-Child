# Happy Child AI Proxy Server

This server is the fixed-IP AI proxy for Cloudflare Pages.

## Deploy On A Fixed-IP VPS

1. Install Node.js 20+ on the VPS.
2. Copy the `server/` directory to the VPS.
3. Create `server/.env` from `.env.example`:

```env
PORT=3001
AI_PROXY_TOKEN=replace-with-a-long-random-token
MODEL_PROVIDER=hunyuan
HUNYUAN_API_KEY=your-tokenhub-api-key
HUNYUAN_BASE_URL=https://tokenhub.tencentmaas.com/v1
HUNYUAN_MODEL=hunyuan-role-latest
LLM_TIMEOUT_MS=45000
```

4. Install and run:

```bash
npm install
npm run build
npm start
```

5. Check health:

```bash
curl http://YOUR_SERVER_IP:3001/health
```

6. Add the VPS public egress IP to the Hunyuan API key allowlist.
7. Set Cloudflare Pages production secrets:

```bash
wrangler pages secret put AI_PROXY_URL --project-name happy-child-game
wrangler pages secret put AI_PROXY_TOKEN --project-name happy-child-game
```

Use `http://YOUR_SERVER_IP:3001` or your HTTPS domain as `AI_PROXY_URL`.

For production, prefer putting Nginx/Caddy in front of this service and using HTTPS.
