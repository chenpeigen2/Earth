import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    // 贴图（最大 4.8MB）全部内联为 base64，不打成独立文件
    assetsInlineLimit: 104857600,
    chunkSizeWarningLimit: 20480,
  },
})
