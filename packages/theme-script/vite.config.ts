import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: '> 0%'
        })
      ]
    }
  },
  build: {
    emptyOutDir: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  server: {
    proxy: {
      '/a/geolocationtools-api/': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: (url: string) =>
          url.replace('/a/geolocationtools-api/', '/api/')
      }
    }
  }
})
