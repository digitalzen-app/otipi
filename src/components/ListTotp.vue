<template>
    <div>
        <IonCard v-if="totpList.length == 0">
            <IonCardHeader>
                <IonCardTitle>Welcome to <OtipiName></OtipiName>
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                Ready to get started? 🚀<br /><br />
                Let's add some one-time passwords! <br />
                You can type them in or just scan a QR code.<br />
                Hit the "+" button below to add your first one. <br /><br />
                Want to bring over your stuff from another device or a backup?<br />
                Head over to the settings page and press the "Sync" button.
            </IonCardContent>
        </IonCard>
        <IonSearchbar v-if="totpList.length > 0" v-model="searchText" placeholder="Search by label or issuer">
        </IonSearchbar>
        <IonList ref="otpIonItemList">
            <IonItemSliding v-for="(totp, $index) in searchabeleList" :key="$index">
                <IonItemOptions side="start">
                    <IonItemOption color="light" @click="openEditModal(totp)">
                        <IonIcon :icon="pencil"></IonIcon>
                        Edit
                    </IonItemOption>
                </IonItemOptions>
                <IonItem class="" lines="full">
                    <ImageOrIcon :logoDomain="totp.logoDomain" :alt="totp.title" :key="totp.uuid" />
                    <IonLabel class="ion-padding-start">
                        <IonText>{{ totp.title }}</IonText><br />
                        <IonNote slot="">{{ totp.issuer }}</IonNote>
                    </IonLabel>
                    <IonLabel @click="copyToClipboard(totp.token)" class="hover-cursor" slot="end">
                        <h1>
                            {{ totp.token }}
                            <IonIcon :icon="copyOutline" />
                        </h1>
                    </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                    <IonItemOption color="warning" @click="moveToArchive(totp.uuid)">
                        <IonIcon :icon="archive" />
                        Archive
                    </IonItemOption>
                </IonItemOptions>
            </IonItemSliding>
        </IonList>

        <!-- Ion modal, consider moving to another comp-->
        <IonModal :can-dismiss="isModalDismissable" ref="modal">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <ion-button @click="closeModal()">Cancel</ion-button>
                    </IonButtons>
                    <IonTitle>Add One Time Password</IonTitle>
                    <ion-buttons slot="end">
                        <ion-button :strong="true" @click="confirm()"
                            :disabled="segmentChoise === 'QR'">Confirm</ion-button>
                    </ion-buttons>
                </IonToolbar>
            </IonHeader>
            <IonToolbar>
                <IonSegment @ionChange="segmentChanged($event)" v-model="segmentChoise">
                    <IonSegmentButton value="QR">
                        <ion-label>Scan QR</ion-label>
                    </IonSegmentButton>
                    <IonSegmentButton value="manual">
                        <ion-label>Add manually</ion-label>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>
            <IonContent class="ion-padding">
                <div v-if="segmentChoise === 'QR'">
                    <ion-label>Scan QR</ion-label>
                    <div id="qrScanContainer" style="width: 100%; height: 100%"></div>
                </div>
                <div v-if="segmentChoise === 'manual'">
                    <ion-item>
                        <IonInput label="* Enter secret key here" label-placement="floating" placeholder="i.e. JBSWY3  ..."
                            v-model="totpForm.secret"></IonInput>
                    </ion-item>
                    <ion-item>
                        <IonInput label="* Label" label-placement="floating" placeholder="* label for this entry"
                            v-model="totpForm.title"></IonInput>
                    </ion-item>
                    <ion-item>
                        <IonInput label="Issuer" label-placement="floating" placeholder="e.g. Google"
                            v-model="totpForm.issuer"></IonInput>
                    </ion-item>
                    <ion-item>

                        <IonInput label="Issuer Domain (for the logo)" label-placement="floating"
                            placeholder="e.g. google.com" v-model="totpForm.logoDomain"></IonInput>
                        <ImageOrIcon slot="end" :logoDomain="totpForm.logoDomain" :alt="totpForm.title" />
                    </ion-item>
                </div>
            </IonContent>
        </IonModal>
        <!-- Ion modal, consider moving to another comp-->
        <IonModal ref="editModal">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <!-- @ts-ignore -->
                        <ion-button @click="dismissEditModal()">Cancel</ion-button>
                    </IonButtons>
                    <IonTitle>Edit item</IonTitle>
                    <ion-buttons slot="end">
                        <ion-button :strong="true" @click="storeEdit()">Confirm</ion-button>
                    </ion-buttons>
                </IonToolbar>
            </IonHeader>

            <IonContent class="ion-padding">
                <ion-item>
                    <IonInput label="* Label" label-placement="floating" placeholder="* label for this entry"
                        v-model="otpEditItem.title"></IonInput>
                </ion-item>
                <ion-item>
                    <IonInput label="Issuer Domain (for the logo)" label-placement="floating" placeholder="e.g. google.com"
                        v-model="otpEditItem.logoDomain"></IonInput>
                    <ImageOrIcon slot="end" :logoDomain="otpEditItem.logoDomain" :alt="otpEditItem.title" />
                </ion-item>

            </IonContent>
        </IonModal>
    </div>
</template>
<script lang="ts">
/// <reference types="web" />

import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
    toastController,
} from "@ionic/vue";
import { add, archive, copyOutline, pencil } from "ionicons/icons";
import { defineComponent, toRaw } from "vue";

import { buildOtpUrl, parseOtpUrl } from "@/helpers/otpUrlHelpers";
import { getLocalDbInstance } from "@/libs/OtpDbLocalSingleton";
import * as QRscaner from "@/libs/QRscaner";
import { jsLogger } from "@/libs/jsLogger";
import ImageOrIcon from "./ImageOrIcon.vue";
import { OtpEntry } from "@/libs/OtpDb";

import { EventBus } from "@/libs/EventBus";
import { quickAlert, quickConfirm, quickDangerToast, quickSuccessToast } from "@/helpers/IonicHelpers";
import OtipiName from "./OtipiName.vue";

export default defineComponent({
    name: "ListTotp",
    beforeUnmount() {
        jsLogger.debug("onbeforeUnmount");
        clearInterval(this.interval);
    },
    components: {
        IonItem,
        IonLabel,

        IonButton,

        IonIcon,
        IonModal,
        IonInput,
        IonContent,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonTitle,

        IonSegment,
        IonSegmentButton,

        ImageOrIcon,
        IonNote,
        IonText,
        IonSearchbar,
        IonCard,
        IonCardContent,
        IonCardHeader,
        OtipiName,
        IonCardTitle,
        IonItemOption,
        IonItemOptions,
        IonItemSliding,
        IonList,
    },
    setup() {
        return {
            add,
            copyOutline,
            archive,
            pencil
        };
    },
    computed: {
        searchabeleList() {
            return this.totpList.filter((item) => {
                const searchText = this.searchText.toLowerCase();
                const title = (item.title || "").toLowerCase();
                const issuer = (item.issuer || "").toLowerCase();
                return title.includes(searchText) || issuer.includes(searchText);
            });
        },
    },
    data() {
        return {
            totpList: [] as Array<OtpEntry>,
            timeRemaining: 0,
            percentageRemaining: 0,
            isModalDismissable: false,
            totpForm: _getResetForm(),
            segmentChoise: "QR",
            isQRcallbackEnabled: true,
            interval: null as any,
            searchText: "",
            otpEditItem: {} as OtpEntry,
        };
    },
    async mounted() {
        // DO NOT MOVE localDb.getOtpDbRef() to a separate variable, we need to get a new ref so if user sync with remote he will get the new data
        // otherwise we keep referance to old data
        this.loadOtpList();
        const SEC_BEFORE_REFRESH = 30;
        // const SYNC_EVERY = 100;
        this.interval = setInterval(async () => {
            const timeNow = Date.now() / 1000;
            const timeRemaining = SEC_BEFORE_REFRESH - Math.floor(Math.floor(timeNow) % SEC_BEFORE_REFRESH);
            const timeRemainingWithDecimals = SEC_BEFORE_REFRESH - (+timeNow.toFixed(3) % SEC_BEFORE_REFRESH);
            this.timeRemaining = timeRemaining;
            this.percentageRemaining = timeRemainingWithDecimals / SEC_BEFORE_REFRESH;
            EventBus.emit("percentageRemaining", this.percentageRemaining);
            // re calculate entries when time is up and new cycle begin
            if (timeRemaining == 0 || timeRemaining == SEC_BEFORE_REFRESH) {
                this.loadOtpList();
            }
        }, 125);

        window.addEventListener("focus", this.loadOtpList);

        EventBus.on("showFormModal", async () => await this.showModal());

        // show the first item sliding animation
        this.$nextTick(async () => {
            // Check if the list has items
            if (this.totpList.length > 0) {
                // Reference to the first IonItemSliding element
                // @ts-expect-error - refs
                const firstItemSliding = this.$refs.otpIonItemList.$el.querySelector('ion-item-sliding');
                if (firstItemSliding) {
                    // Open start side
                    await waitForMs(1500);
                    await firstItemSliding.open('start');
                    await waitForMs(500);
                    await firstItemSliding.close();
                    await waitForMs(500);
                    await firstItemSliding.open('end');
                    await waitForMs(500);
                    await firstItemSliding.close();
                }
            }
        });

    },
    methods: {
        loadOtpList() {
            this.totpList = getLocalDbInstance().getOtpDbRef().getCalculatedOtpEntries();
        },
        async moveToArchive(itemUuid: string) {
            (this.$refs as any).otpIonItemList.$el.closeSlidingItems();
            const localDb = getLocalDbInstance();
            const isSure = await quickConfirm({
                header: "Move item to archive confirmation",
                message: "Are you sure you want to move this item to archive? (it will be deleted from other devices, and may be restored from this one only)",
            });
            let res = false;
            if (isSure) {
                res = await localDb.archiveMovementAction(itemUuid);
                this.loadOtpList();
            }
            isSure && res ? quickSuccessToast("Moved to archive, you may recover it through setting") : quickDangerToast("Failed to move to archive");
        },
        copyToClipboard(text: string) {
            try {
                navigator.clipboard.writeText(text);
                (this.$refs as any).otpIonItemList.$el.closeSlidingItems();
                toastController
                    .create({
                        message: "Copied to clipboard: " + text,
                        duration: 2000,
                    })
                    .then((toast) => toast.present());
            } catch (e) {
                jsLogger.error("Failed to copy to clipboard", e);
                quickAlert("Failed to copy to clipboard");
            }
        },
        async openEditModal(item: OtpEntry) {
            this.otpEditItem = JSON.parse(JSON.stringify(item));
            // @ts-expect-error -  refs are bitch and a half so let ignore typing here
            await this.$refs.editModal.$el.present();

        },
        storeEdit() {
            getLocalDbInstance().updateEntry(toRaw(this.otpEditItem));
            this.loadOtpList();
            this.dismissEditModal();
        },
        dismissEditModal() {
            // @ts-expect-error -  refs are bitch and a half so let ignore typing here
            this.$refs.editModal.$el.dismiss();
        },
        async showModal() {
            // @ts-expect-error -  refs are bitch and a half so let ignore typing here
            await this.$refs.modal.$el.present();
            if (this.segmentChoise == "QR") {
                this.$nextTick(() => {
                    this._initQrScanner();
                });
            }
        },
        segmentChanged(event: CustomEvent) {
            const val = event.detail.value;
            if (val === "QR") {
                this.$nextTick(() => {
                    this._initQrScanner();
                });
            } else {
                QRscaner.stopAndClear();
            }
        },
        _initQrScanner() {
            this.isQRcallbackEnabled = true;
            QRscaner.QRscanerInit("qrScanContainer", this.storeQrData);
        },
        async storeQrData(totpUrl: string) {
            jsLogger.debug("storeQrData", totpUrl);
            // we have problem that the callback continue to be called again and again
            if (!this.isQRcallbackEnabled) {
                return;
            }
            this.isQRcallbackEnabled = false;
            const totp = parseOtpUrl(totpUrl);
            if (!totp) {
                quickAlert("The QR code is not a valid TOTP url");
                return;
            }
            await getLocalDbInstance().addOtpEntry(totp.label, totpUrl);
            await QRscaner.stopAndClear();
            await this.closeModal();
            quickAlert("Otp saved successfully");
        },
        _resetForm() {
            this.totpForm = _getResetForm();
        },
        async closeModal() {
            // in case we close the modal without stopping the QR scanner
            QRscaner.stopAndClear();
            this._resetForm();
            this.segmentChoise = "QR";
            this.isModalDismissable = true;
            // @ts-expect-error -  refs types is annoying so let ignore typing here
            await this.$refs.modal.$el.dismiss();
            this.isModalDismissable = false;

            // force list refresh
            this.loadOtpList();
        },
        async confirm() {
            const isGoodEntry = buildOtpUrl(this.totpForm);
            if (!isGoodEntry) {
                quickAlert("Please fill in all the fields with correct values");
                return;
            }
            await getLocalDbInstance().addEntryByManualSecret(this.totpForm);
            // reset form
            this.closeModal();
        },
    },
});

function _getResetForm() {
    return {
        title: "",
        secret: "",
        issuer: "",
        logoDomain: "",
    };
}

async function waitForMs(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
</script>
