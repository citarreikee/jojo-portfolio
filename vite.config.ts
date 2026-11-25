import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const galleryDir = path.resolve(process.cwd(), 'public/assets/gallery')
const virtualGalleryId = 'virtual:gallery-items'
const resolvedGalleryId = `\0${virtualGalleryId}`

function galleryManifestPlugin() {
  const readGallery = () => {
    if (!fs.existsSync(galleryDir)) return []
    return fs.readdirSync(galleryDir)
      .filter((file) => /\.(png|jpe?g|webp|avif|gif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => {
        const title = file
          .replace(/\.[^.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
        const optimized = path.join('webp', `${file}.webp`)
        const imagePath = fs.existsSync(path.join(galleryDir, optimized))
          ? `/assets/gallery/webp/${encodeURIComponent(file)}.webp`
          : `/assets/gallery/${encodeURIComponent(file)}`
        return `{ image: ${JSON.stringify(imagePath)}, title: ${JSON.stringify(title)} }`
      })
      .join(',\n')
  }

  return {
    name: 'gallery-manifest',
    resolveId(id: string) {
      return id === virtualGalleryId ? resolvedGalleryId : undefined
    },
    load(id: string) {
      return id === resolvedGalleryId ? `export default [${readGallery()}]` : undefined
    },
    configureServer(server: { watcher: { on: (event: string, callback: (file: string) => void) => void }; moduleGraph: { getModuleById: (id: string) => unknown; invalidateModule: (module: unknown) => void }; ws: { send: (payload: { type: string; path: string }) => void } }) {
      const refresh = (file: string) => {
        if (!file.startsWith(galleryDir)) return
        const module = server.moduleGraph.getModuleById(resolvedGalleryId)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload', path: '*' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}

export default defineConfig({
  plugins: [react(), galleryManifestPlugin()],
  assetsInclude: ['**/*.glb'],
  // The site is served from https://entropyfield.com/jojo/.
  base: '/jojo/',
})
