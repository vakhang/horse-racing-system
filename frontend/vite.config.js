import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' /* <--- Sửa lại dòng này nha sếp */
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
})