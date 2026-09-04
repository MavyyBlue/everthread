import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    // Relative asset URLs keep the same production build deployable under
    // GitHub Pages (/everthread/), a custom domain, or any other subpath.
    base: './',
    plugins: [react()],
    build: {
        target: 'es2022',
        sourcemap: true,
        chunkSizeWarningLimit: 700,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                },
            },
        },
    },
});
