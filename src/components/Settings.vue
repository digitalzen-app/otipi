<template>
    <IonList>
        <IonItem lines="none">
            <IonIcon slot="start" :icon="settingsOutline"></IonIcon>
            <IonLabel>Settings</IonLabel>
        </IonItem>
        <IonItem>
            <IonLabel>Sync with Google Drive</IonLabel>
            <IonButton slot="end" @click="gdriveSync()" :disabled="onGdriveSync">
                <IonIcon :icon="logoGoogle"></IonIcon>
                <IonText class="ion-padding-start">Sync</IonText>
                <IonSpinner name="dots" v-if="onGdriveSync"></IonSpinner>
            </IonButton>
            <IonButton slot="end" @click="gdriveLogout()" v-if="isGoogleLogin" color="light">
                <IonIcon :icon="logOutOutline"></IonIcon>
                <IonText class="ion-padding-start">Disconnect</IonText>
                <IonSpinner name="dots" v-if="onGdriveSync"></IonSpinner>
            </IonButton>
        </IonItem>
        <IonListHeader>Local backup / restore</IonListHeader>
        <IonItem>
            <IonButton @click="backup()" :disabled="onGdriveSync">
                <IonIcon :icon="arrowDownOutline"></IonIcon>
                Backup
            </IonButton>
            <IonButton @click="restore()" :disabled="onGdriveSync">
                <IonIcon :icon="arrowUpOutline"></IonIcon>
                Restore
            </IonButton>
        </IonItem>
        <div>
            <IonListHeader>Biometric/Key quick login</IonListHeader>
            <IonItem>
                <IonButton @click="registerQuickLogin()" :disabled="onRegisterQuickLogin" v-if="!isQuickLoginEnabled">
                    <!-- <IonIcon :icon="onRegisterQuickLogin"></IonIcon> -->
                    <IonSpinner name="dots" v-if="onRegisterQuickLogin"></IonSpinner>
                    Set quick login
                </IonButton>
                <IonButton @click="resetQuickLogin()" v-if="isQuickLoginEnabled">
                    <!-- <IonIcon :icon="arrowUpOutline"></IonIcon> -->
                    Reset quick login
                </IonButton>
            </IonItem>
        </div>
        <IonListHeader>Vault open duration</IonListHeader>
        <IonItem>
            <div class="toggle-container">
                <IonToggle v-model="dbStored.isKeepOpenUntilRestart">Keep vault open until restart</IonToggle>
            </div>
        </IonItem>
        <IonListHeader>Manage archive</IonListHeader>
        <IonItem>
            <IonButton @click="() => $router.push({ name: 'archive' })">Archive management</IonButton>
        </IonItem>
        <IonItem lines="none"></IonItem>
        <IonAccordionGroup>
            <IonAccordion value="dangerZone">
                <IonItem slot="header" color="warning"><ion-label>Danger zone</ion-label></IonItem>
                <div slot="content">
                    <IonItem color="light">
                        <IonButton color="warning" @click="dangerZone(`CHANGE_PASS`)"> Change vault password
                        </IonButton>
                    </IonItem>
                    <IonItem color="light">
                        <IonButton color="warning" @click="dangerZone(`DELETE_BACKUP`)" :disabled="onGdriveSync"> Delete
                            Google drive vault <IonSpinner name="dots" v-if="onGdriveSync"></IonSpinner>
                        </IonButton>
                    </IonItem>
                    <IonItem color="light">
                        <IonButton color="warning" @click="dangerZone(`OVERWRITE_LOCAL`)" :disabled="onGdriveSync">
                            Overwrite local, with Google drive vault<IonSpinner name="dots" v-if="onGdriveSync">
                            </IonSpinner>
                        </IonButton>
                    </IonItem>
                    <IonItem color="light">
                        <IonButton color="warning" @click="dangerZone(`DELETE_LOCAL`)"> Delete local vault </IonButton>
                    </IonItem>
                </div>
            </IonAccordion>
        </IonAccordionGroup>
        <IonItem>
            <IonLabel>Version</IonLabel>
            <IonLabel slot="end">{{ version }}</IonLabel>
        </IonItem>
    </IonList>
</template>
<script lang="ts">
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonSpinner,
    IonText,
    IonToggle,
    toastController,
} from "@ionic/vue";
import { arrowDownOutline, arrowUpOutline, logOutOutline, logoGoogle, settingsOutline } from "ionicons/icons";
import { defineComponent, toRaw } from "vue";
import { funnyAlert, quickAlert, passwordAlert, quickConfirm, quickSuccessToast, quickDangerToast, quickToast } from "@/helpers/IonicHelpers";
import { jsLogger } from "@/libs/jsLogger";
import { SyncSingletonLib } from "@/libs/SyncSingletonLib";
import { OtpDb } from "@/libs/OtpDb";
import { isQuickLoginEnabled, resetQuickLogin } from "@/libs/webauthnSecret";

import { OtpDbLocalSingleton, getLocalDbInstance } from "@/libs/OtpDbLocalSingleton";
import { getVersion } from "@/helpers/versionHelper";
import { doSignOut, isSignedIn } from "@/libs/Gapi";
type AlloedActions = "CHANGE_PASS" | "DELETE_BACKUP" | "DELETE_LOCAL" | "OVERWRITE_BACKUP" | "OVERWRITE_LOCAL";

export default defineComponent({
    name: "Settings",
    components: {
        IonItem,
        IonIcon,
        IonLabel,
        IonList,
        IonButton,
        IonSpinner,
        IonListHeader,
        IonToggle,
        IonNote,
        IonContent,
        IonText,
        IonAccordionGroup,
        IonAccordion,
    },
    data() {
        return {
            version: "",
            onGdriveSync: false,
            onRegisterQuickLogin: false,
            isQuickLoginEnabled: false,
            dbStored: getLocalDbInstance().getAppSettings(),
            isGoogleLogin: isSignedIn(),
        };
    },
    async mounted() {
        this.version = await this.getVersion();
        this.isQuickLoginEnabled = isQuickLoginEnabled();
    },
    watch: {
        dbStored: {
            handler: function (val, oldVal) {
                if ("isKeepOpenUntilRestart" in val) {
                    quickSuccessToast("This will take effect after the next lock & unlock of Otipi");
                }
                // storing everythign in one object
                getLocalDbInstance().setAppSettings(toRaw(this.dbStored));
            },
            deep: true,
        },
    },
    setup() {
        return {
            logoGoogle,
            settingsOutline,
            arrowDownOutline,
            arrowUpOutline,
            logOutOutline
        };
    },
    methods: {
        async registerQuickLogin() {
            this.onRegisterQuickLogin = true;
            let isSuccess = true;
            try {
                isSuccess = await getLocalDbInstance().registerQuickLogin();
            } catch (e) {
                jsLogger.error("Error registering quick login", e);
                isSuccess = false;
            }
            isSuccess ? quickAlert({ header: "Success", message: "Yes! quick login is enabled" }, "That's it!") : funnyAlert("Quick login registration failed");

            this.onRegisterQuickLogin = false;
            this.isQuickLoginEnabled = isQuickLoginEnabled();
        },
        resetQuickLogin() {
            resetQuickLogin();
            this.isQuickLoginEnabled = isQuickLoginEnabled();
        },
        async backup() {
            getLocalDbInstance().downloadDb();
        },
        async restore() {
            try {
                const file = await selectFile();
                if (file) {
                    const contentArrayBuffer = await readFileContent(file);
                    jsLogger.debug("File content read as ArrayBuffer");
                    const { data: password } = await passwordAlert();
                    if (!password) {
                        return funnyAlert("No password provided");
                    }
                    const encryptedPassRef = OtpDb.getEncryptedPassRef(password);
                    try {
                        let recoverdDb;
                        try {
                            recoverdDb = await OtpDb.openDbByArrayBuffer(contentArrayBuffer, encryptedPassRef);
                        } catch (error) {
                            return quickAlert("Seems like your password is the wrong one", "That's it!");
                        }
                        // try to read entries to check if password is correct
                        const entries = recoverdDb.getCalculatedOtpEntries();
                        if (entries.length === 0) {
                            return quickAlert("Restored database is empty, stopping here");
                        }
                        const isSure = await isAreYouSure(`This will overwrite local db. The recovered DB have ${entries.length} records, this action cannot be undone.`);

                        if (!isSure) {
                            return jsLogger.info("User canceled restore");
                        }
                        // if no exception was thrown, password is correct
                        getLocalDbInstance().setOtpDbRef(recoverdDb);
                        getLocalDbInstance().saveDbToLocal();
                        return quickAlert("Database restored successfully");
                    } catch (error) {
                        return quickAlert("Error reading file content", "That's it!");
                    }

                    // Now you can work with the file's content as an ArrayBuffer
                } else {
                    return funnyAlert("No file selected");
                }
            } catch (error) {
                jsLogger.error("Error reading file content", error);
                return quickAlert("Huston we have a problem here", "That's it!");
            }
        },
        async gdriveLogout() {
            this.onGdriveSync = true;
            jsLogger.info("Signing out from Google Drive");
            try {
                await doSignOut();
            } catch (e) {
                jsLogger.error(e);
            }
            this.onGdriveSync = false;
        },
        async gdriveSync() {
            this.onGdriveSync = true;
            try {
                const sessionedInstance = await SyncSingletonLib.getFreshSessionInstance();
                if (!sessionedInstance) {
                    this.onGdriveSync = false;
                    return;
                }
                jsLogger.info("Signed in, syncing to Google Drive");
                const isSuccess = await sessionedInstance.syncWithGdrive();
                if (isSuccess) {
                    quickSuccessToast("Synced successfully");
                } else {
                    throw new Error("sync failed");
                }
            } catch (e) {
                jsLogger.error(e);
                quickDangerToast("Failed to sync");
            }
            this.onGdriveSync = false;
        },
        async dangerZone(action: AlloedActions) {
            const { data: password } = await passwordAlert({ headerText: "Enter your vault password to proceed" });
            if (!password) {
                return quickToast("Action canceled");
            }
            const isCorrectPass = await OtpDbLocalSingleton.getInstance().isCorrectPassword(password);
            if (!isCorrectPass) {
                return quickDangerToast("Nope!");
            }
            let isSure = true;
            if (action !== "CHANGE_PASS") {
                isSure = await isAreYouSure("This action cannot be undone");
            }
            if (!isSure) {
                quickToast("Action canceled");
                return;
            }

            switch (action) {
                case "CHANGE_PASS":
                    const { data: newPass } = await passwordAlert({
                        headerText: "Enter new password",
                        messageText: "After changing the password you will have to unlock the vault again",
                        confimPassword: true,
                    });
                    if (newPass) {
                        await OtpDbLocalSingleton.getInstance().changePasswordAndLock(newPass);
                        quickSuccessToast("Password changed successfully, please reopen the vault");
                        // redirect enforce relogin
                        this.$router.push({ name: "home" });
                    }
                    break;
                case "DELETE_BACKUP":
                    this.onGdriveSync = true;
                    const sessionedInstance = await SyncSingletonLib.getFreshSessionInstance();
                    const isSuccess = await sessionedInstance?.removeRemote();
                    this.onGdriveSync = false;
                    isSuccess ? quickSuccessToast("Backup deleted successfully") : quickDangerToast("Failed to delete backup");
                    break;
                case "OVERWRITE_BACKUP":
                    this.onGdriveSync = true;
                    const sessionedInstance2 = await SyncSingletonLib.getFreshSessionInstance();
                    const isSuccess2 = await sessionedInstance2?.writeLocalOverRemote();
                    this.onGdriveSync = false;
                    isSuccess2 ? quickSuccessToast("Overwrite backup successfully") : quickDangerToast("Failed to overwrite backup");
                    break;
                case "OVERWRITE_LOCAL":
                    this.onGdriveSync = true;
                    const sessionedInstance3 = await SyncSingletonLib.getFreshSessionInstance();
                    const isSuccess3 = await sessionedInstance3?.writeRemoteOverLocal();
                    this.onGdriveSync = false;
                    isSuccess3 ? quickSuccessToast("Overwrite local successfully, password might changed") : quickDangerToast("Failed to overwrite local");
                    this.$router.push({ name: "home" });
                    break;
                case "DELETE_LOCAL":
                    await OtpDbLocalSingleton.getInstance().deleteLocalDb();
                    quickSuccessToast("Local vault deleted successfully");
                    this.$router.push({ name: "home" });

                    break;
            }
        },
        getVersion: async () => {
            return await getVersion()
        },
    },
});

async function isAreYouSure(txt: string): Promise<boolean> {
    const isSure = await quickConfirm({
        header: "Are you sure?",
        message: txt,
        confirmTxt: "Yes, do it",
        cancelTxt: "No, cancel",
        confirmCss: "alert-button-danger",
        cancelCss: "alert-button-warning",
    });
    return isSure;
}
function selectFile(contentType = "*.otipi", multiple = false): Promise<File> {
    return new Promise((resolve, reject) => {
        let input = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.accept = contentType;

        input.onchange = () => {
            const files = input.files || [];
            if (!files || files?.length == 0) {
                reject(null);
            } else resolve(files[0]);
        };
        input.click();
    });
}

async function readFileContent(file: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };

        reader.onerror = () => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.readAsArrayBuffer(file);
    });
}
</script>
@/libs/OtpDb

<style>
.toggle-container {
    display: flex;
    flex-direction: column;
}
</style>
@/libs/SyncSingletonLib
