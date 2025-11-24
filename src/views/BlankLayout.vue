<template>
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonButton slot="start" fill="none" href="#/otp/codes"><IonIcon :icon="homeOutline"></IonIcon></IonButton>
                <NameTitle class="ion-text-center" :is-show-slogen="true" />
            </IonToolbar>
        </IonHeader>
        <IonContent class="">
            <IonGrid :fixed="true" class="ht100">
                <IonRow class="ht100">
                    <IonCol size="0" size-md="2" class="no-side-padding-sm no-side-margin-sm mt0 pt0"></IonCol>
                    <IonCol size="12" size-md="8" class="">
                        <div class="vertial-container">
                            <div class="vertial-container-child">
                                <RouterView></RouterView>
                            </div>
                        </div>
                    </IonCol>
                    <IonCol size="0" size-md="2" class="no-side-padding-sm no-side-margin-sm mt0 pt0"></IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>
        <IonFooter class="ion-no-border" id="footer">
            <IonText class="ion-padding-start ion-padding-end">
                <span class=""><a href="#/pages/terms">Terms</a></span>
                <span class="ion-padding-start"><a href="#/pages/privacy">Privacy policy</a></span>
                <span class="ion-padding-start"><a href="#/pages/about">About</a></span>
                <span class="ion-padding-end ion-float-end">{{ version }}</span>
            </IonText>
        </IonFooter>
    </IonPage>
</template>

<script>
import {
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
    IonMenuButton,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
} from "@ionic/vue";
import MenuView from "./MenuView.vue";
import { arrowForwardOutline, homeOutline } from "ionicons/icons";
import NameTitle from "@/components/NameTitle.vue";
import { getVersion } from "@/helpers/versionHelper";

export default {
    name: "DefaultLayout",
    data() {
        return {
            version: "",
        };
    },
    async mounted() {
        this.version = await this.getVersion();
    },
    methods: {
       getVersion: async () => {
            return await getVersion()
        },
    },
    setup() {
        return { arrowForwardOutline, homeOutline };
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
        IonCard,
        NameTitle,
        IonGrid,
        IonRow,
        IonCol,
    },
};
</script>

<style scoped>
.vertial-container {
    display: flex;
    justify-content: center;
    align-items: center; /* If you also want to vertically center */
    height: 100%; /* Ensure it takes full parent height if needed for vertical centering */
}
.vertial-container-child {
    width: 100%;
}
.ht100 {
    height: 100%;
}
</style>
