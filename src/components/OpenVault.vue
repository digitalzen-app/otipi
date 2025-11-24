<template>
    <h1>Let's open your vault</h1>

    <!-- <IonText> Please use you vault password to open it </IonText> -->

    <IonItem>
        <IonInput label="Enter your password" label-placement="floating" :type="showPassword ? 'text' : 'password'"
            v-model="password" @keyup.enter="openDb()"></IonInput>
    </IonItem>
    <IonItem lines="none">
        <!-- <IonLabel>Show Password</IonLabel> -->
        <IonToggle v-model="showPassword" :checked="showPassword" slot="start" label-placement="end">Show Password
        </IonToggle>
        <IonIcon :icon="showPassword ? eye : eyeOff" slot="end" @click="showPassword = !showPassword"></IonIcon>
    </IonItem>
    <IonButton expand="full" @click="openDb()" :disabled="onLoginProcess">
        Open vault
        <IonSpinner name="dots" v-if="onLoginProcess"></IonSpinner>
    </IonButton>
    <!-- Disabled in browsers for the foresseable future-->
    <div v-if="isQuickLoginEnabled()">
        <IonListHeader>Quick login</IonListHeader>
        <IonButton expand="full" @click="quickLogin()" :disabled="onLoginProcess">
            Quick login
            <IonSpinner name="dots" v-if="onLoginProcess"></IonSpinner>
        </IonButton>
    </div>
</template>
<script>
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonSpinner, IonText, IonTitle, IonToggle, useIonRouter } from "@ionic/vue";
import { eye, eyeOff } from "ionicons/icons";
import { defineComponent } from "vue";
import { funnyAlert, quickAlert, quickWarninigToast } from "@/helpers/IonicHelpers";
import { OtpDb } from "@/libs/OtpDb";
import { jsLogger } from "@/libs/jsLogger";
import { OtpDbLocalSingleton, getLocalDbInstance } from "@/libs/OtpDbLocalSingleton";
import { isQuickLoginEnabled } from "@/libs/webauthnSecret";
import * as kdbx from "kdbxweb";
import { storeSessiontoSw } from "@/libs/sessionServiceClient";
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
        IonListHeader,
        IonSpinner,
    },
    data() {
        return {
            showPassword: false,
            passwordConfirm: "",
            password: "",
            onLoginProcess: false,
        };
    },
    async mounted() {
        jsLogger.info("Mounted OpenVault");
        if (OtpDbLocalSingleton.isLocalDbOpen()) {
            jsLogger.info("Db is open, let's start with closing it");
            await getLocalDbInstance().closeLocalDb();
        }
    },
    setup() {

        return { eye, eyeOff, isQuickLoginEnabled };
    },
    methods: {
        _gotoCodes() {
            this.$router.push({ name: "codes" });
        },
        async openDb() {
            this.onLoginProcess = true;
            try {
                const encryptedPassRef = OtpDb.getEncryptedPassRef(this.password);
                await OtpDbLocalSingleton.openLocalDb(encryptedPassRef);
                jsLogger.info("Opened db");
                const settings = OtpDbLocalSingleton.getInstance().getAppSettings();
                if (import.meta.env.DEV) {
                    const ProtectedValueAsBase64 = kdbx.ProtectedValue.fromString(this.password).toBase64();
                    jsLogger.info("Storing session to localstorage for dev");
                    localStorage.setItem("dev-session", ProtectedValueAsBase64);
                }
                if (settings.isKeepOpenUntilRestart) {
                    jsLogger.info("Storing session to SW for keep open until restart");
                    try {
                        const ProtectedValueAsBase64 = kdbx.ProtectedValue.fromString(this.password).toBase64();
                        await storeSessiontoSw(ProtectedValueAsBase64);
                    } catch (error) {
                        jsLogger.debug("Error storing session to SW", error);
                    }
                }
            } catch (error) {
                this.onLoginProcess = false;
                jsLogger.debug("Error opening db", error);
                quickWarninigToast("Invalid password, try the other one...");
                return;
            }

            this._gotoCodes();
        },
        async quickLogin() {
            this.onLoginProcess = true;
            await OtpDbLocalSingleton.tryQuickLogin();
            const isLogin = OtpDbLocalSingleton.isLocalDbOpen();
            this.onLoginProcess = false;
            if (isLogin) {
                this._gotoCodes();
            } else {
                quickAlert("Quick login failed, please reset it in settings");
            }
        },
    },
});
</script>
@/libs/OtpDb
