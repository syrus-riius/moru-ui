import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function nativePreviewPages(): Plugin {
  const setup = (server: Pick<ViteDevServer, 'middlewares'>) => {
    server.middlewares.use((request, _response, next) => {
      const [pathname, query] = (request.url ?? '').split('?', 2)
      if ((pathname === '/native-preview' || pathname.startsWith('/native-preview/')) && !pathname.split('/').at(-1)?.includes('.')) {
        request.url = `/native-preview/index.html${query ? `?${query}` : ''}`
      }
      next()
    })
  }
  return { name: 'moru-native-preview-pages', configureServer: setup, configurePreviewServer: setup }
}

export default defineConfig({
  plugins: [nativePreviewPages(), react(), tailwindcss()],
})
