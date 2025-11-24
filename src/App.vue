<template>
    <ion-app>
        <RouterView></RouterView>
    </ion-app>
</template>

<script>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
export default defineComponent({
    name: "App",
    components: {
        IonApp,
        IonRouterOutlet,
        RouterView,
    },
});
</script>
