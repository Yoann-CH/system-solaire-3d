import { defineConfig } from 'vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    open: true
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src/*.html',
          dest: 'src'
        },
        {
          src: 'src/assets/images/*',
          dest: 'assets/images'
        },
        {
          src: 'src/assets/music/*',
          dest: 'assets/music'
        }
      ]
    })
  ]
});
