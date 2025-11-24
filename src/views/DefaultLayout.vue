<template>
    <IonPage>
        <MenuView />
        <ion-header :translucent="true" class="">
            <ion-toolbar>
                <NameTitle :is-show-slogen="true" />
                <ion-buttons slot="start">
                    <IonMenuButton></IonMenuButton>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <IonProgressBar :value="percentageRemaining" :reversed="false" v-if="isCodesScreen()"></IonProgressBar>
        <!-- <IonRouterOutlet name="default-layout"></IonRouterOutlet> -->
        <IonContent id="main-router-outlet">
            <IonGrid :fixed="true" class="no-side-padding-sm no-side-margin-sm mt0 pt0">
                <IonRow class="no-side-padding-sm no-side-margin-sm mt0 pt0">
                    <IonCol size="0" size-md="2" class="no-side-padding-sm no-side-margin-sm mt0 pt0"></IonCol>
                    <IonCol size="12" size-md="8" class="no-side-padding-sm no-side-margin-sm mt0 pt0">
                        <RouterView></RouterView>
                    </IonCol>
                    <IonCol size="0" size-md="2" class="no-side-padding-sm no-side-margin-sm mt0 pt0"></IonCol>
                </IonRow>
            </IonGrid>
            <IonFab slot="fixed" vertical="bottom" horizontal="end" v-if="isCodesScreen()">
                <IonFabButton @click="showModal()" class="OtipiBackground">
                    <IonIcon :icon="add" />
                </IonFabButton>
            </IonFab>
        </IonContent>
        <IonFooter class="ion-no-border" id="footer"></IonFooter>
    </IonPage>
</template>

<script>
import { EventBus } from "@/libs/EventBus";
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonPage,
    IonProgressBar,
    IonRouterOutlet,
    IonRow,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/vue";
import { add, arrowForwardOutline, homeOutline } from "ionicons/icons";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import MenuView from "./MenuView.vue";
import NameTitle from "@/components/NameTitle.vue";
import { getVersion } from "@/helpers/versionHelper";
export default defineComponent({
    name: "DefaultLayout",
    data() {
        return {
            version: "",
            percentageRemaining: 0,
        };
    },
    async mounted() {
        this.version = await this.getVersion();
        EventBus.on("percentageRemaining", (percentageRemaining) => (this.percentageRemaining = percentageRemaining));
    },
    methods: {
        getVersion: async () => {
            return await getVersion()
        },
        isCodesScreen() {
            return this.$route.name === "codes" || this.$route.name === "home";
        },
        showModal() {
            EventBus.emit("showFormModal");
        },
    },
    setup() {
        return { arrowForwardOutline, homeOutline, add };
    },
    components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonRouterOutlet,
    IonFooter,
    IonText,
    MenuView,
    IonMenuButton,
    RouterView,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonProgressBar,
    NameTitle
},
});
</script>
