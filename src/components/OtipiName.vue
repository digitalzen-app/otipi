<template>
    <span>
        <span class="OtipiRed">O</span><span>tipi</span>
        <span v-if="isShowSlogen"> - 2fa anywhere</span>
    </span>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "OtipiName",
    props: {
        isShowSlogen: false,
    },
});
</script>
