import { URL, fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

const DEV_SERVER_PORT = 5173

/**
 * Cloudflare tunnels (and other public hosts) forward Origin/Referer as the
 * tunnel URL. Some backends reject or crash on unknown origins. Rewrite those
 * headers to the local Vite origin so proxied API calls look like localhost.
 */
function rewriteProxyOriginHeaders(
  proxyReq: { setHeader: (name: string, value: string) => void },
  trustedOrigin: string,
) {
  proxyReq.setHeader('Origin', trustedOrigin)
  proxyReq.setHeader('Referer', `${trustedOrigin}/`)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.VITE_API_URL
  const backendBase = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : ''
  const devProxyOrigin = env.VITE_DEV_PROXY_ORIGIN
  const trustedProxyOrigin =
    (devProxyOrigin ? devProxyOrigin.replace(/\/+$/, '') : '') ||
    `http://localhost:${DEV_SERVER_PORT}`

  if (mode === 'development' && !backendBase) {
    console.warn(
      '[vite] VITE_API_URL is not set. Add it to .env.development (backend origin, no /api path) so the dev server can proxy /api to your API.',
    )
  }

  const configureTrustedOrigin = (proxy: {
    on: (
      event: 'proxyReq',
      listener: (proxyReq: {
        setHeader: (name: string, value: string) => void
      }) => void,
    ) => void
  }) => {
    proxy.on('proxyReq', (proxyReq) => {
      rewriteProxyOriginHeaders(proxyReq, trustedProxyOrigin)
    })
  }

  return {
    server: {
      host: true,
      port: DEV_SERVER_PORT,
      allowedHosts: ['.trycloudflare.com'],
      ...(backendBase
        ? {
            proxy: {
              '/api': {
                target: backendBase,
                changeOrigin: true,
                configure: configureTrustedOrigin,
              },
            },
          }
        : {}),
    },
    plugins: [
      devtools(),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      viteReact(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
