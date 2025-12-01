<template>
    <IonMenu side="start" menuId="first" contentId="main-router-outlet">
        <ion-header>
            <ion-toolbar>
                <NameTitle class="ion-margin-start" />
                <ion-menu-toggle slot="end">
                    <IonButton fill="clear" color="dark">X</IonButton>
                </ion-menu-toggle>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <ion-list>
                <ion-menu-toggle auto-hide="true">
                    <IonItemDivider>Navigation</IonItemDivider>
                    <ion-item button href="#/otp/codes">
                        <ion-icon slot="start" :icon="homeOutline"></ion-icon>
                        <ion-label>Home</ion-label>
                    </ion-item>
                    <ion-item button href="#/otp/settings">
                        <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
                        <ion-label>Settings</ion-label>
                    </ion-item>
                    <ion-item button href="#/setup/openvault">
                        <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
                        <ion-label> Lock vault </ion-label>
                    </ion-item>
                    <IonItemDivider> Other </IonItemDivider>

                    <ion-item button href="#/otp/privacy">
                        <ion-label>Privacy</ion-label>
                    </ion-item>

                    <ion-item button href="#/otp/terms">
                        <ion-label>Terms</ion-label>
                    </ion-item>

                    <ion-item button href="#/otp/about">
                        <ion-label>About</ion-label>
                    </ion-item>

                    <ion-item button href="https://github.com/digitalzen-app/otipi" target="_blank">
                        <ion-icon slot="start" :icon="logoGithub"></ion-icon>
                        <ion-label>GitHub Project</ion-label>
                    </ion-item>

                    <ion-item button href="https://www.digitalzen.app" target="_blank">
                        <ion-icon slot="start" :icon="heartOutline"></ion-icon>
                        <ion-label>
                            Powered by DigitalZen.app
                            <p style="font-size: 0.8em; margin: 0;">A cross-platform productivity solution, apps and
                                websites blocker</p>
                        </ion-label>
                    </ion-item>
                </ion-menu-toggle>
            </ion-list>
        </ion-content>
        <IonFooter class="ion-no-border">
            <span class="ion-padding-start">ver: {{ version }}</span>
        </IonFooter>
    </IonMenu>
</template>
<script setup>
import { onMounted, ref } from "vue";
import NameTitle from "@/components/NameTitle.vue";
import { getVersion } from "@/helpers/versionHelper";
import { IonMenu, IonContent, IonHeader, IonFooter, IonToolbar, IonTitle, IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonItemDivider, IonButton } from "@ionic/vue";
import { homeOutline, lockClosedOutline, logOutOutline, settingsOutline, logoGithub, heartOutline } from "ionicons/icons";
const version = ref("");

onMounted(async () => {
    version.value = await getVersion();
});
</script>

<style scoped>
.img-logo {
    width: 52px;
}
</style>
