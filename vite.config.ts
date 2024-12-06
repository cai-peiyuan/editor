import replace from "@rollup/plugin-replace";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";

export default defineConfig({
  server: {
    port: 8888,
  },
  publicPath: './',
	outputDir: "dist",
	assetsDir: './static',
	indexPath: "index.html",
	transpileDependencies: true,
	lintOnSave: false,
	productionSourceMap:false,
	configureWebpack: {
		externals: {
			mapabcgl: 'mapabcgl',

		},
		
	},
	base:'./',
	chainWebpack: config => {
	// 添加一个规则来处理 .geojson 文件
	config.module.rule('geojson')
		.test(/\.geojson$/)
		.use('raw-loader')
		.loader('raw-loader')
	},
  optimizeDeps: {
    // 假设 fonts 是一个包含字体文件的目录
    include: ['fonts/my-font.woff2'],
    // 为字体文件添加时间戳作为版本号
  },
  build: {
    //sourcemap: true
    publicPath: './',
		outputDir: "dist",
		assetsDir: './static',
		indexPath: "index.html",
		transpileDependencies: true,
		lintOnSave: false,
		productionSourceMap:false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      include: /\/jsonlint-lines-primitives\/lib\/jsonlint.js/,
      delimiters: ["", ""],
      values: {
        "_token_stack:": "",
      },
    }) as any,
    react(),
    istanbul({
      cypress: true,
      requireEnv: false,
      nycrcPath: "./.nycrc.json",
      forceBuildInstrument: true, //Instrument the source code for cypress runs
    }),
  ],
  define: {
    global: "window",
  },
  
});
