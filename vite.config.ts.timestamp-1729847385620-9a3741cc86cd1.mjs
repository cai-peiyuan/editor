// vite.config.ts
import replace from "file:///D:/GitHome/msp/editor/node_modules/@rollup/plugin-replace/dist/es/index.js";
import react from "file:///D:/GitHome/msp/editor/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///D:/GitHome/msp/editor/node_modules/vite/dist/node/index.js";
import istanbul from "file:///D:/GitHome/msp/editor/node_modules/vite-plugin-istanbul/dist/index.mjs";
var vite_config_default = defineConfig({
  server: {
    port: 8888
  },
  build: {
    sourcemap: true
  },
  plugins: [
    replace({
      preventAssignment: true,
      include: /\/jsonlint-lines-primitives\/lib\/jsonlint.js/,
      delimiters: ["", ""],
      values: {
        "_token_stack:": ""
      }
    }),
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
      nycrcPath: "./.nycrc.json",
      forceBuildInstrument: true
      //Instrument the source code for cypress runs
    })
  ],
  define: {
    global: "window"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRIb21lXFxcXG1zcFxcXFxlZGl0b3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdEhvbWVcXFxcbXNwXFxcXGVkaXRvclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0SG9tZS9tc3AvZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlcGxhY2UgZnJvbSBcIkByb2xsdXAvcGx1Z2luLXJlcGxhY2VcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgaXN0YW5idWwgZnJvbSBcInZpdGUtcGx1Z2luLWlzdGFuYnVsXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogODg4OCxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBzb3VyY2VtYXA6IHRydWVcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlcGxhY2Uoe1xyXG4gICAgICBwcmV2ZW50QXNzaWdubWVudDogdHJ1ZSxcclxuICAgICAgaW5jbHVkZTogL1xcL2pzb25saW50LWxpbmVzLXByaW1pdGl2ZXNcXC9saWJcXC9qc29ubGludC5qcy8sXHJcbiAgICAgIGRlbGltaXRlcnM6IFtcIlwiLCBcIlwiXSxcclxuICAgICAgdmFsdWVzOiB7XHJcbiAgICAgICAgXCJfdG9rZW5fc3RhY2s6XCI6IFwiXCIsXHJcbiAgICAgIH0sXHJcbiAgICB9KSBhcyBhbnksXHJcbiAgICByZWFjdCgpLFxyXG4gICAgaXN0YW5idWwoe1xyXG4gICAgICBjeXByZXNzOiB0cnVlLFxyXG4gICAgICByZXF1aXJlRW52OiBmYWxzZSxcclxuICAgICAgbnljcmNQYXRoOiBcIi4vLm55Y3JjLmpzb25cIixcclxuICAgICAgZm9yY2VCdWlsZEluc3RydW1lbnQ6IHRydWUsIC8vSW5zdHJ1bWVudCB0aGUgc291cmNlIGNvZGUgZm9yIGN5cHJlc3MgcnVuc1xyXG4gICAgfSksXHJcbiAgXSxcclxuICBkZWZpbmU6IHtcclxuICAgIGdsb2JhbDogXCJ3aW5kb3dcIixcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5UCxPQUFPLGFBQWE7QUFDN1EsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sY0FBYztBQUVyQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFFBQVE7QUFBQSxNQUNOLG1CQUFtQjtBQUFBLE1BQ25CLFNBQVM7QUFBQSxNQUNULFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFBQSxNQUNuQixRQUFRO0FBQUEsUUFDTixpQkFBaUI7QUFBQSxNQUNuQjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLE1BQ1osV0FBVztBQUFBLE1BQ1gsc0JBQXNCO0FBQUE7QUFBQSxJQUN4QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
