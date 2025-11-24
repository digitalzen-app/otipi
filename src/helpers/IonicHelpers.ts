import PasswordModalVue from "@/components/PasswordModal.vue";
import { ToastOptions, alertController, modalController, toastController } from "@ionic/vue";
import { nextTick } from "vue";

import { OverlayEventDetail } from "@ionic/core";
/**
 * https://stackoverflow.com/a/70479996/2992810
 *
 * make ionic wait for Vue next tic and ionic animation frame
 */
export async function waitForIonVueDomUpdates() {
    await nextTick();
    await requestAnimationFrame();
}

/**
 * https://stackoverflow.com/a/70479996/2992810
 *
 * @returns {Promise} - wait for animation frame
 */
export async function requestAnimationFrame() {
    return new Promise((r) => window.requestAnimationFrame(r));
}

interface MessageObject {
    header: string;
    message: string;
}

export async function quickAlert(messageTxtOrObj: string | MessageObject, buttonTxt: string = "Thanks!"): Promise<void> {
    let header = "Alert ";
    let message: string;

    if (typeof messageTxtOrObj === "object") {
        header = messageTxtOrObj.header;
        message = messageTxtOrObj.message;
    } else {
        message = messageTxtOrObj;
    }

    const alert = await alertController.create({
        header,
        message,
        buttons: [buttonTxt],
    });

    await alert.present();
    await alert.onDidDismiss();
}

export async function funnyAlert(message: string) {
    const userInteractionErrorHeaders = [
        "No Good",
        "Oh No",
        "Error Is Inevitable",
        "Oops... Again?",
        "Utter Fail",
        "Not This Time",
        "Bummer Alert",
        "Uh-Oh Moment",
        "Well, That Happened",
        "Alert: Facepalm Ahead",
        "This Is Awkward",
        "Not Our Finest Moment",
        "Try Again?",
        "Slight Mishap",
        "Yield!",
        "Hold Up",
        "Something's Off",
        "A Bit of a Pickle",
        "Stumbled a Bit",
        "Curveball!",
    ];
    const randomHeader = userInteractionErrorHeaders[Math.floor(Math.random() * userInteractionErrorHeaders.length)];
    const funnyVerificationErrors = [
        "Shite",
        "Damn",
        "Oops",
        "Crap",
        "Uh-oh",
        "Whoops",
        "D'oh",
        "Yikes",
        "Bummer",
        "Nope",
        "Eek",
        "Blimey",
        "Gah",
        "Argh",
        "Meh",
        "Ugh",
        "Dang",
        "Oopsie",
        "Fudge",
        "Crud",
    ];
    const randomBtnText = funnyVerificationErrors[Math.floor(Math.random() * funnyVerificationErrors.length)];
    return quickAlert({ header: message, message: randomHeader }, randomBtnText);
}

/**
 * Creates and presents a customizable confirmation alert with options for confirmation and cancellation.
 *
 * @param {Object} options - Configuration options for the alert.
 * @param {string} [options.header="Confirmation"] - Header text for the alert.
 * @param {string} options.message - Message text to display in the alert.
 * @param {string} options.confirmTxt - Text for the confirm button.
 * @param {string} options.cancelTxt - Text for the cancel button.
 * @param {string} [options.confirmCss=""] - CSS class for the confirm button. Must be one of "alert-button-success", "alert-button-warning", "alert-button-danger", or "".
 * @param {string} [options.cancelCss=""] - CSS class for the cancel button. Must be one of "alert-button-success", "alert-button-warning", "alert-button-danger", or "".
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the confirm button was clicked (true) or the alert was cancelled (false).
 * @throws {Error} If the provided CSS classes for confirm or cancel buttons are not valid.
 *
 * @example
 * quickconfirm({
 *   header: 'Are you sure?',
 *   message: 'This action cannot be undone.',
 *   confirmTxt: 'Yes, do it',
 *   cancelTxt: 'No, cancel',
 *   confirmCss: 'alert-button-danger',
 *   cancelCss: 'alert-button-warning'
 * }).then((confirmed) => {
 *   if (confirmed) {
 *     // Handle confirmation
 *   } else {
 *     // Handle cancellation
 *   }
 * });
 */
interface ConfirmOptions {
    header?: string;
    message: string;
    confirmTxt?: string;
    cancelTxt?: string;
    confirmCss?: string;
    cancelCss?: string;
}

export async function quickConfirm(options: ConfirmOptions): Promise<boolean> {
    const { header = "Confirmation", message, confirmTxt = "Confirm", cancelTxt = "Cancel", confirmCss = "", cancelCss = "" } = options;

    const allowed = ["alert-button-success", "alert-button-warning", "alert-button-danger", ""];
    if (!allowed.includes(confirmCss) || !allowed.includes(cancelCss)) {
        throw new Error("confirmCss and cancelCss must be one of the following: " + allowed.join(", "));
    }

    const alert = await alertController.create({
        header,
        message,
        buttons: [
            {
                text: cancelTxt,
                role: "cancel",
                cssClass: cancelCss,
            },
            {
                text: confirmTxt,
                role: "confirm",
                cssClass: confirmCss,
            },
        ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === "confirm";
}

interface PasswordAlertOptions {
    headerText?: string | null;
    messageText?: string | null;
    confimPassword?: boolean;
}

export async function passwordAlert(componentProps?: PasswordAlertOptions): Promise<OverlayEventDetail> {
    const modal = await modalController.create({
        component: PasswordModalVue,
        componentProps,
    });

    await modal.present();
    return modal.onDidDismiss();
}

export async function quickWarninigToast(message: string, addionalOptions: ToastOptions = {}) {
    addionalOptions.color = "warning";
    return quickToast(message, addionalOptions);
}
export async function quickDangerToast(message: string, addionalOptions: ToastOptions = {}) {
    addionalOptions.color = "danger";
    return quickToast(message, addionalOptions);
}
export async function quickSuccessToast(message: string, addionalOptions: ToastOptions = {}) {
    addionalOptions.color = "success";
    return quickToast(message, addionalOptions);
}
export async function quickToast(message: string, addionalOptions: ToastOptions = {}) {
    toastController
        .create(
            Object.assign(
                {
                    message,
                    duration: 2000,
                    color: "success",
                    position: "bottom",
                    positionAnchor: "footer",

                } as ToastOptions,
                addionalOptions
            )
        )
        .then((toast) => {
            toast.present();
        });
}
