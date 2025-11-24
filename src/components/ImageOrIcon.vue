<template>
    <img v-if="src" :src="src" :alt="alt" class="wd32" />
    <ion-icon v-else :icon="key" class="wd32"></ion-icon>
</template>
<script>
import { IonIcon } from "@ionic/vue";
import { defineComponent } from "vue";
import { key } from "ionicons/icons";
import { useImageCacheStore } from "@/stores/imagesCacheStore";
import isValidDomain from "is-valid-domain";
export default defineComponent({
    components: {
        IonIcon,
    },
    data() {
        return {
            src: false,
        };
    },
    props: {
        logoDomain: {
            type: String,
            default: "",
        },
        alt: {
            type: String,
            default: "",
        },
    },
    async mounted() {
        const store = useImageCacheStore();
        this.src = await store.checkAndCacheImage(this.logoDomain);
    },
    methods: {},
    setup() {
        return { key };
    },
    watch: {
        async logoDomain() {
            if (isValidDomain(this.logoDomain)) {
                const store = useImageCacheStore();
                this.src = await store.checkAndCacheImage(this.logoDomain, false);
            }
        },
    },

});
</script>
<style scoped>
.wd32 {
    width: 32px;
}
</style>
