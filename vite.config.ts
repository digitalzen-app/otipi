// import legacy from "@vitejs/plugin-legacy";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from "vite-plugin-pwa";
import versionIncrementOnProdBuildPlugin from "./vite-version-increment-on-prod-build.js";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import mkcert from "vite-plugin-mkcert";
import vitePluginChecker from "vite-plugin-checker";

const isProd = process.env.NODE_ENV === "production";
const buildVer = +Date.now();
const buildVerHash = buildVer.toString(16);
const plugins = [
    // we need these for it to work in android
    nodePolyfills({
        include: ["crypto","stream","buffer"],
    }),
    topLevelAwait(),
    wasm(),
    // this is done by push to prod
    // versionIncrementOnProdBuildPlugin(),
    vue(),
    // legacy(),
    getVitePwa(),
    // _handleFileNames()
];
if (!isProd) {
    // console.log("dev mode, adding mkcert, start SSL server");
    // console.log("file are at ~/.vite-plugin-mkcert, you might need to run mkcert -install for the root CA");
    // add to the beginning of the array
    // plugins.unshift(mkcert());
    plugins.push(
        vitePluginChecker({
            vueTsc: true,
        })
    );
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins,
    build: {
        emptyOutDir: true,
        // rollupOptions: {
        //   input: {
        //     main: path.resolve(__dirname, "index.html"),
        //     sessionServiceWorker: path.resolve(
        //       __dirname,
        //       "src/sessionServiceWorker.js"
        //     ),
        //   },
        // }
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
});

// Custom plugin to handle file naming
function _handleFileNames() {
    return {
        name: "handle-file-names",
        generateBundle(options, bundle) {
            for (const [key, chunk] of Object.entries(bundle)) {
                if (chunk.type === "chunk") {
                    // Check if the chunk is for sessionServiceWorker and adjust its file name
                    // We want it to be exposed as sessionServiceWorker.js
                    if (chunk.name === "sessionServiceWorker") {
                        chunk.fileName = chunk.name + ".js";
                    }
                }
            }
        },
    };
}

// make code more readable by moving this config to a function
function getVitePwa() {
    return VitePWA({
        registerType: "autoUpdate",
        devOptions: {
            enabled: false,
            type: "module",
        },
        workbox: {
            cleanupOutdatedCaches: true,
        },
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
        manifest: {
            id: buildVerHash,
            start_url: "/#/otp/home",
            // scope: "/",
            name: "Otipi.app",
            short_name: "Otipi",
            description: "Otipi - 2fa anywhere",
            theme_color: "#ffffff",
            icons: [
                {
                    src: "pwa-64x64.png",
                    sizes: "64x64",
                    type: "image/png",
                },
                {
                    src: "pwa-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
                {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                },
                {
                    src: "maskable-icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "maskable",
                },
            ],
        },
    });
}
