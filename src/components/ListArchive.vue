<template>
    <div>
        <IonToolbar>
            <IonTitle><IonIcon :icon="archive"></IonIcon> Archived OTPs</IonTitle>
        </IonToolbar>

        <IonList ref="otpIonItemList">
            <IonCard v-if="!totpList.length">
                <IonCardHeader color="success">
                    <IonCardTitle class="ion-text-center">No archived OTPs</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                    <p class="ion-text-center">You can archive OTPs from the main list by swiping left on the item and clicking the Archive button.</p>
                </IonCardContent>
            </IonCard>

            <!-- <IonCard v-if="totpList.length">
                <IonCardContent>
                    <p>The items in the archive are stored ONLY locally on your device and do not sync to the cloud.</p>
                </IonCardContent>
            </IonCard> -->
            <IonItem class="" lines="full" v-for="(totp, $index) in totpList" :key="$index">
                <ImageOrIcon :issuer="totp.issuer" :alt="totp.title" />
                <IonLabel class="ion-padding-start">
                    <IonText>{{ totp.title }}</IonText
                    ><br />
                    <IonNote slot="">{{ totp.issuer }}</IonNote>
                </IonLabel>
                <IonButtons slot="end">
                    <IonButton @click="recover(totp.uuid)" fill="clear" color="tertiary"><IonIcon :icon="arrowUndo" /> Recover</IonButton>
                    <IonButton @click="deleteForever(totp.uuid)" fill="clear" color="danger"><IonIcon :icon="trashBinOutline" /> Delete</IonButton>
                </IonButtons>
            </IonItem>
        </IonList>
    </div>
</template>
<script lang="ts">
/// <reference types="web" />

import {
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonProgressBar,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
    alertController,
    toastController,
} from "@ionic/vue";
import { add, archive, arrowUndo, copyOutline, trashBinOutline } from "ionicons/icons";
import { VNodeRef, defineComponent } from "vue";

import { buildOtpUrl, parseOtpUrl } from "@/helpers/otpUrlHelpers";
import { getLocalDbInstance } from "@/libs/OtpDbLocalSingleton";
import * as QRscaner from "@/libs/QRscaner";
import { jsLogger } from "@/libs/jsLogger";
import ImageOrIcon from "./ImageOrIcon.vue";
import { OtpEntry } from "@/libs/OtpDb";

import { EventBus } from "@/libs/EventBus";
import { quickAlert, quickConfirm, quickDangerToast, quickSuccessToast, quickToast } from "@/helpers/IonicHelpers";
import OtipiName from "./OtipiName.vue";

export default defineComponent({
    name: "ListArchive",

    components: {
        IonItem,
        IonLabel,
        IonBadge,
        IonButton,
        IonFab,
        IonFabButton,
        IonIcon,
        IonModal,
        IonInput,
        IonContent,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonTitle,
        IonImg,
        IonSegment,
        IonSegmentButton,
        IonProgressBar,
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
            arrowUndo,
            trashBinOutline,
        };
    },
    computed: {},
    data() {
        return {
            totpList: [] as Array<OtpEntry>,
        };
    },
    async mounted() {
        this.loadOtpList();
    },
    methods: {
        async loadOtpList() {
            this.totpList = getLocalDbInstance().getOtpDbRef().getCalculatedOtpEntries(true);
        },
        async recover(itemUuid: string) {
            const isSure = await quickConfirm({ message: "Are you sure you want to recover this OTP?" });
            let res = false;
            if (isSure) {
                const localDb = getLocalDbInstance();
                res = await localDb.archiveMovementAction(itemUuid, false);
                this.loadOtpList();
            }
            isSure && res ? quickSuccessToast("Moved to archive, you may recover it through setting") : quickDangerToast("Failed to recover");
        },
        async deleteForever(itemUuid: string) {
            const isSure = await quickConfirm({ header: "Deleting forever", message: "Are you sure you want to destroy this OTP item forever?" });
            let res = false;
            if (isSure) {
                const localDb = getLocalDbInstance();
                res = await localDb.deleteOtpEntryFromArchive(itemUuid);
                this.loadOtpList();
            }
            isSure && res ? quickSuccessToast("Item deleted forever, let's hope we will never need it again") : quickToast("Not deleted");
        },
    },
});

function _getResetForm() {
    return {
        title: "",
        secret: "",
        issuer: "",
    };
}
</script>
