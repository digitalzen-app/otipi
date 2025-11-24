import { createRouter, createWebHashHistory, createWebHistory } from "@ionic/vue-router";
import { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from "vue-router";

import { jsLogger } from "@/libs/jsLogger";
import { OtpDbLocalSingleton } from "@/libs/OtpDbLocalSingleton";

const DEFAULT_HOME_ROUTE = "/otp/codes";
const staticPagesRoutes: Array<RouteRecordRaw> = [
    {
        path: "terms",
        name: "terms",
        component: () => import("@/views/TermsPage.vue"),
    },
    {
        path: "privacy",
        name: "privacy",
        component: () => import("@/views/PrivacyPage.vue"),
    },
    {
        path: "about",
        name: "about",
        component: () => import("@/views/AboutPage.vue"),
    },
];

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: DEFAULT_HOME_ROUTE,
    },
    {
        path: "/otp",
        // Use DefaultLayout as a component
        component: () => import("@/views/DefaultLayout.vue"),
        children: [
            // Define child routes
            {
                path: "",
                redirect: DEFAULT_HOME_ROUTE,
            },
            {
                path: "home",
                name: "home",
                redirect: DEFAULT_HOME_ROUTE,
            },
            {
                path: "codes",
                name: "codes",
                component: () => import("@/views/CodesPage.vue"),
            },
            {
                path: "archive",
                name: "archive",
                component: () => import("@/components/ListArchive.vue"),
            },
            
            {
                path: "settings",
                name: "settings",
                component: () => import("@/views/SettingsPage.vue"),
            },
            ...staticPagesRoutes,
        ],
    },
    {
        path: "/setup",
        component: () => import("@/views/BlankLayout.vue"),
        children: [
            {
                path: "newVault",
                component: () => import("@/views/SetupPage.vue"),
                name: "newVault",
            },
            {
                path: "openVault",
                component: () => import("@/views/OpenVaultPage.vue"),
                name: "openVault",
            },
        ],
    },
    {
        path: "/pages",
        beforeEnter: (to, from, next) => {
            console.log("beforeEnter setup", to, from);
            next();
        },
        component: () => import("@/views/BlankLayout.vue"),
        children: staticPagesRoutes,
    },
    {
        path: "/404",
        name: "PageNotFound404",
        component: () => import("@/views/NotFound404Page.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/404" },
];

const router = createRouter({
    routes,
    // @ts-ignore
    history: createWebHashHistory(import.meta.env.BASE_URL),
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // we want to prevent access to /setup and /otp routes if the local db is not open
    if (!to.path.startsWith("/setup") && !to.path.startsWith("/otp")) {
        return next();
    }

    const isExists = OtpDbLocalSingleton.isLocalDbExist();
    console.log("isExists", isExists);
    if (!isExists) {
        if (to.name !== "newVault") {
            jsLogger.debug("router.beforeEach", "redirecting to newVault");
            return next({ name: "newVault" });
        } else {
            return next();
        }
    }

    const isOpen = OtpDbLocalSingleton.isLocalDbOpen();
    console.log("isOpen", isOpen);
    if (!isOpen) {
        if (to.name !== "openVault") {
            jsLogger.debug("router.beforeEach", "redirecting to openVault");
            return next({ name: "openVault" });
        } else {
            return next();
        }
    }
    return next();
});

export default router;
