import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/test_setup.js',
    include: ['test/unit_tests/**/*_test.jsx', 'test/integration_tests/**/*_test.jsx'],
  },
})
