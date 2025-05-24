import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `
  //         @import "./src/styles/variables/_colors";
  //       `
  //     }
  //   }
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
