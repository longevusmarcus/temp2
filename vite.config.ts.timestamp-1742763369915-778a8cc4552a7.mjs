// vite.config.ts
import { defineConfig } from "file:///app/node_modules/vite/dist/node/index.js";
import react from "file:///app/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { tempo } from "file:///app/node_modules/tempo-devtools/dist/vite/index.js";
import path from "path";
var __vite_injected_original_dirname = "/app";
var conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}
var vite_config_default = defineConfig({
  plugins: [
    react({
      plugins: [...conditionalPlugins]
    }),
    tempo()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : void 0
  },
  optimizeDeps: {
    include: ["react/jsx-dev-runtime", "react-dom/client", "react-router-dom"]
  },
  base: "/"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCB7IHRlbXBvIH0gZnJvbSBcInRlbXBvLWRldnRvb2xzL2Rpc3Qvdml0ZVwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuY29uc3QgY29uZGl0aW9uYWxQbHVnaW5zID0gW107XG5pZiAocHJvY2Vzcy5lbnYuVEVNUE8gPT09IFwidHJ1ZVwiKSB7XG4gIGNvbmRpdGlvbmFsUGx1Z2lucy5wdXNoKFtcInRlbXBvLWRldnRvb2xzL3N3Y1wiLCB7fV0pO1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIHBsdWdpbnM6IFsuLi5jb25kaXRpb25hbFBsdWdpbnNdLFxuICAgIH0pLFxuICAgIHRlbXBvKCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGFsbG93ZWRIb3N0czogcHJvY2Vzcy5lbnYuVEVNUE8gPT09IFwidHJ1ZVwiID8gdHJ1ZSA6IHVuZGVmaW5lZCxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1wicmVhY3QvanN4LWRldi1ydW50aW1lXCIsIFwicmVhY3QtZG9tL2NsaWVudFwiLCBcInJlYWN0LXJvdXRlci1kb21cIl0sXG4gIH0sXG4gIGJhc2U6IFwiL1wiLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThMLFNBQVMsb0JBQW9CO0FBQzNOLE9BQU8sV0FBVztBQUNsQixTQUFTLGFBQWE7QUFDdEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU0scUJBQXFCLENBQUM7QUFDNUIsSUFBSSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQ2hDLHFCQUFtQixLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0FBQ3BEO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osU0FBUyxDQUFDLEdBQUcsa0JBQWtCO0FBQUEsSUFDakMsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQTtBQUFBLElBRU4sY0FBYyxRQUFRLElBQUksVUFBVSxTQUFTLE9BQU87QUFBQSxFQUN0RDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHlCQUF5QixvQkFBb0Isa0JBQWtCO0FBQUEsRUFDM0U7QUFBQSxFQUNBLE1BQU07QUFDUixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
