<template>
    <div>
        <IonList>
            <IonItem lines="none">
                <IonLabel>
                    <h1>Welcome to <OtipiName></OtipiName></h1>
                    <br/>
                    <IonText class="ion-text-start">
                        Create a secure password for your 2FA experience
                    </IonText>
                </IonLabel>
            </IonItem>
            <IonItem class="ion-margin-top">
                <IonInput label="Choose a Strong Password" label-placement="floating" :type="showPassword ? 'text' : 'password'" v-model="password"></IonInput>
                <IonIcon :icon="showPassword ? eye : eyeOff" slot="end" @click="showPassword = !showPassword"></IonIcon>
            </IonItem>
            <IonItem>
                <IonInput label="Confirm Your Password" label-placement="floating" :type="showPassword ? 'text' : 'password'" v-model="passwordConfirm"></IonInput>
                <IonIcon :icon="showPassword ? eye : eyeOff" slot="end" @click="showPassword = !showPassword"></IonIcon>
            </IonItem>
            <IonItem lines="none"> </IonItem>
            <IonButton expand="full" @click="initDb">Create encrypted vault</IonButton>
        </IonList>
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>How to sync or import backup?</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                To import or sync your OTP tokens securely:
                <ul>
                    <li>Create a new encrypted vault for enhanced security.</li>
                    <li>Go to the application's settings.</li>
                    <li>Choose the option to import or sync your backup.</li>
                </ul>
                This ensures your OTP tokens are safely stored and easily manageable.
            </IonCardContent>
        </IonCard>
    </div>
</template>
<script>
import { quickAlert } from "@/helpers/IonicHelpers";
import { OtpDb } from "@/libs/OtpDb";
import { OtpDbLocalSingleton } from "@/libs/OtpDbLocalSingleton";
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonText,
    IonTitle,
    IonToggle,
} from "@ionic/vue";
import { eye, eyeOff, logoGoogle } from "ionicons/icons";
import { defineComponent } from "vue";
import OtipiName from "./OtipiName.vue";

export default defineComponent({
    name: "Settings",
    components: {
        IonItem,
        IonIcon,
        IonLabel,
        IonList,
        IonButton,
        IonInput,
        IonToggle,
        IonTitle,
        IonText,
        IonContent,
        IonSpinner,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        OtipiName,
        IonCardContent,
    },
    data() {
        return {
            showPassword: false,
            passwordConfirm: "",
            password: "",
            onGdriveSync: false,
        };
    },

    setup() {
        return { eye, eyeOff, logoGoogle };
    },
    methods: {
        goHome() {
            this.$router.push({ name: "home" });
        },
        async initDb() {
            if (this.password !== this.passwordConfirm) {
                return quickAlert("Passwords do not match");
            }
            if (this.password.length < 8) {
                return quickAlert("Password must be at least 8 characters long");
            }
            const encryptedPassRef = OtpDb.getEncryptedPassRef(this.password);
            await OtpDbLocalSingleton.initNewDb(encryptedPassRef);
            this.goHome();
        },
    },
});
</script>
@/libs/OtpDb
