import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "@/router/router";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./App.css";

import VueGtag from "vue-gtag";

import { jsLogger } from "@/libs/jsLogger";
import { OtpDbLocalSingleton } from "@/libs/OtpDbLocalSingleton";
import { initServiceWorkerInstance } from "@/libs/sessionServiceClient";

// this will force reload on new version
// @ts-ignore
// import { registerSW } from "virtual:pwa-register";

// I don't give a FUCK about service workers
// using it just for the application install message
// so invalidating the cache every time is fine
// if (window.caches) {
//     caches.keys().then(function (names) {
//         for (let name of names) caches.delete(name);
//     });
// }
// self.addEventListener("activate", function (event: any) {
//     event.waitUntil(
//         caches.keys().then(function (cacheNames) {
//             return Promise.all(
//                 cacheNames
//                     .filter(function (cacheName) {
//                         // Return true if you want to remove this cache,
//                         // but remember that caches are shared across
//                         // the whole origin
//                     })
//                     .map(function (cacheName) {
//                         return caches.delete(cacheName);
//                     })
//             );
//         })
//     );
// });
// registerSW({
//     immediate: true,
// });

async function initApp() {
    try {
        await initServiceWorkerInstance();
        const autoOpenLocalDbRes = await OtpDbLocalSingleton.tryAutoOpenLocalDb();
        jsLogger.info("local db open result", autoOpenLocalDbRes, "router will sent to manual open");
    } catch (e) {}

    const pinia = createPinia();
    const app = createApp(App);
    app.use(IonicVue).use(router).use(pinia);
    app.use(
        VueGtag,
        {
            config: { id: "G-Y5GFHGDCVC" },
        },
        router
    );

    await router.isReady();
    app.mount("#app");
}
initApp();
