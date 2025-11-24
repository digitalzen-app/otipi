<template>
    <ListTotp />
</template>
<script>
import ListTotp from "@/components/ListTotp.vue";
import { defineComponent } from "vue";
export default defineComponent({
    name: "CodesPage",
    mounted() {
        console.log("CodesPage mounted");
    },
    components: {
        ListTotp
    },
});
</script>
