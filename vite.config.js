import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

const DEFAULT_SUPERSET_URL = 'http://48.216.218.52:8088';

function trimTrailingSlash(url) {
  return (url || '').replace(/\/+$/, '');
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonSafely(response) {
  const raw = await response.text();

  try {
    return { raw, json: JSON.parse(raw) };
  } catch {
    return { raw, json: null };
  }
}

function supersetGuestTokenPlugin(env) {
  const supersetBaseUrl = trimTrailingSlash(env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL);
  const sessionCookie = env.SUPERSET_SESSION_COOKIE || '';
  const defaultEmbedId = env.VITE_SUPERSET_EMBED_ID || '';
  const defaultResourceId = env.VITE_SUPERSET_DASHBOARD_ID || '';

  return {
    name: 'superset-guest-token-dev-endpoint',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/internal/superset/guest-token', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
          return;
        }

        if (!sessionCookie) {
          sendJson(res, 500, {
            error: 'Missing SUPERSET_SESSION_COOKIE in environment. Add it to .env.dev and restart Vite.',
          });
          return;
        }

        const requestUrl = new URL(req.url || '', 'http://localhost');
        const dashboardId = requestUrl.searchParams.get('embedId') || defaultEmbedId;
        const resourceId = requestUrl.searchParams.get('resourceId') || defaultResourceId || dashboardId;

        if (!dashboardId) {
          sendJson(res, 400, {
            error: 'Missing embed id. Provide ?embedId=<uuid> or set VITE_SUPERSET_EMBED_ID.',
          });
          return;
        }

        if (!resourceId) {
          sendJson(res, 400, {
            error: 'Missing resource id. Provide ?resourceId=<id> or set VITE_SUPERSET_DASHBOARD_ID.',
          });
          return;
        }

        try {
          const csrfRes = await fetch(`${supersetBaseUrl}/api/v1/security/csrf_token/`, {
            headers: {
              Cookie: `session=${sessionCookie}`,
            },
          });
          const csrfBody = await readJsonSafely(csrfRes);

          if (!csrfRes.ok || !csrfBody.json?.result) {
            sendJson(res, csrfRes.status || 500, {
              error: 'Unable to fetch Superset CSRF token.',
              details: csrfBody.json || csrfBody.raw,
            });
            return;
          }

          const guestRes = await fetch(`${supersetBaseUrl}/api/v1/security/guest_token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfBody.json.result,
              Cookie: `session=${sessionCookie}`,
            },
            body: JSON.stringify({
              resources: [{ type: 'dashboard', id: String(resourceId) }],
              rls: [],
              user: {
                username: 'embed_user',
                first_name: 'Embed',
                last_name: 'User',
              },
            }),
          });
          const guestBody = await readJsonSafely(guestRes);

          if (!guestRes.ok || !guestBody.json?.token) {
            sendJson(res, guestRes.status || 500, {
              error: 'Unable to fetch Superset guest token.',
              details: guestBody.json || guestBody.raw,
            });
            return;
          }

          sendJson(res, 200, { token: guestBody.json.token });
        } catch (error) {
          sendJson(res, 500, {
            error: 'Unexpected error while generating Superset guest token.',
            details: error?.message || String(error),
          });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), supersetGuestTokenPlugin(env)],
    css: {
      modules: {
        // Keep class names human-readable in DOM: JobOpenings__page
        generateScopedName: '[name]__[local]',
      },
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT || 5173),
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
        '/api/v1': {
          target: env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL,
          changeOrigin: true,
          autoRewrite: true,
          hostRewrite: 'localhost:5173',
          protocolRewrite: 'http',
        },
        '/static': {
          target: env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL,
          changeOrigin: true,
          autoRewrite: true,
          hostRewrite: 'localhost:5173',
          protocolRewrite: 'http',
        },
        '/superset': {
          target: env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL,
          changeOrigin: true,
          autoRewrite: true,
          hostRewrite: 'localhost:5173',
          protocolRewrite: 'http',
        },
        '/embedded': {
          target: env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL,
          changeOrigin: true,
          autoRewrite: true,
          hostRewrite: 'localhost:5173',
          protocolRewrite: 'http',
        },
        '/login': {
          target: env.VITE_SUPERSET_URL || DEFAULT_SUPERSET_URL,
          changeOrigin: true,
          autoRewrite: true,
          hostRewrite: 'localhost:5173',
          protocolRewrite: 'http',
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: Number(env.VITE_PREVIEW_PORT || 4173),
      strictPort: true,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'utils': ['axios'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      minify: 'esbuild',
      sourcemap: false,
    },
  };
});
