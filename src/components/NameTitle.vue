<template>
    <IonTitle class="nameTitle">
        <OtipiName :is-show-slogen="isShowSlogen"></OtipiName>
    </IonTitle>
</template>
<script>
import { IonTitle } from "@ionic/vue";
import OtipiName from "./OtipiName.vue";

export default {
    name: "NameTitle",
    props: {
        isShowSlogen: false,
    },
    components: { IonTitle, OtipiName },
};
</script>
<style scoped>
.nameTitle {
    padding: 0;
    font-weight: bolder;
    font-size: 1.5rem;
}

@media (min-width: 768px) {
    .nameTitle {
        font-size: 2.5rem;
    }
}
</style>
