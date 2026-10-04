import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Same port Live Server used, so existing Supabase redirect URLs keep working.
    port: 5501,
  },
  optimizeDeps: {
    // Don't scan the legacy/ reference HTML files.
    entries: ["index.html"],
  },
  build: {
    rolldownOptions: {
      output: {
        // Libraries in their own chunks (all still load up front, so behavior
        // is unchanged); keeps every chunk under the 500 kB warning.
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: "supabase", test: /node_modules[\\/]@supabase[\\/]/ },
          ],
        },
      },
    },
  },
});
