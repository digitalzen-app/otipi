<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>{{ headerText }}</ion-title>
                <IonButton @click="dismiss()" slot="end" color="warning" fill="none">
                    Cancel
                </IonButton>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
            <IonItem lines="none">
                <ion-label v-if="messageText">{{ messageText }}</ion-label>
            </IonItem>
            <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input aria-label="Password" v-model="password" :type="showPassword ? `text` : `password`" @keyup.enter="submitPassword"></ion-input>
                <IonIcon :icon="showPassword ? eye : eyeOff" slot="end" @click="showPassword = !showPassword" class="hover-cursor mt23"></IonIcon>
            </ion-item>
            <ion-item v-if="confimPassword">
                <ion-label position="floating">Confirm</ion-label>
                <ion-input v-model="password2" :type="showPassword ? `text` : `password`" @keyup.enter="submitPassword"></ion-input>
                <IonIcon :icon="showPassword ? eye : eyeOff" slot="end" @click="showPassword = !showPassword" class="hover-cursor"></IonIcon>
            </ion-item>

            <ion-button expand="block" @click="submitPassword">Let's try this one</ion-button>
        </ion-content>
    </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonButtons } from "@ionic/vue";
import { defineComponent, ref } from "vue";
import { modalController } from "@ionic/vue";
import { eye, eyeOff } from "ionicons/icons";
import { quickAlert } from "@/helpers/IonicHelpers";

export default defineComponent({
    props: {
        headerText: {
            type: String,
            default: "Password please",
        },
        messageText: {
            type: String,
            default: "Please enter your password",
        },
        confimPassword: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        IonPage,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonIcon,
        IonButtons,
    },
    setup(props) {
        const password = ref("");
        const password2 = ref("");
        const showPassword = ref(false);

        function submitPassword() {
            if (props.confimPassword && password.value !== password2.value) {
                return quickAlert("Passwords do not match");
            }
            modalController.dismiss(password.value,"submit");
        }
        function dismiss() {
            modalController.dismiss(null, "cancel");
        }

        return { password, password2, submitPassword, showPassword, eye, eyeOff, dismiss };
    },
});
</script>
<style scoped>  
.mt23 {
    margin-top: 23px;
}
</style>