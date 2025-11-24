import { jsLogger } from "@/libs/jsLogger";
import { Html5QrcodeCameraScanConfig, Html5QrcodeScanner,Html5Qrcode, QrcodeSuccessCallback } from "html5-qrcode";


let qrCodeScanner: Html5QrcodeScanner;
const config: Html5QrcodeCameraScanConfig = {
    fps: 10,
    qrbox: 250,
    disableFlip: true,
};
export async function QRscanerInit(elementId: string, successCb: QrcodeSuccessCallback) {
    qrCodeScanner = new Html5QrcodeScanner(elementId, config, false);
    qrCodeScanner.render(successCb, (errorMessage) => {
        // this just shoot tons of error message to console
        // every frame the camera capture and fail to decode into QR code
        // jsLogger.error(errorMessage);
    });
}

export async function stopAndClear() {
    await qrCodeScanner.clear();
}
