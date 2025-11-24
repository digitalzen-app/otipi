/// <reference types="gapi.client" />
/// <reference types="gapi.auth2" />
/// <reference types="google.accounts" />
/// <reference types="gapi.client.drive" />

import { GoogleAuth, User, Authentication } from "@codetrix-studio/capacitor-google-auth";
import { jsLogger } from "./jsLogger";
import { AppSettings, OtpDbLocalSingleton } from "@/libs/OtpDbLocalSingleton";

// Client ID and API key from the Developer Console
const CLIENT_ID = "367883949459-46bqhcdv4vciie62rsjmpmteiipbf4bt.apps.googleusercontent.com";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC_ARR = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES_READABLE: { [key: string]: string } = {
    // write to appdata in google drive, this is not accessible to anyone except the app
    storeAppData: "https://www.googleapis.com/auth/drive.appdata",
};
// just get the values
const SCOPES = Object.values(SCOPES_READABLE).join(" ");

function injectScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        let s = document.querySelector('script[src="' + src + '"]') as HTMLScriptElement;
        let shouldAppend = false;
        if (!s) {
            s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = () => {
                s.setAttribute("data-loaded", "true");
                loadLibsIntoWindowObject.loaded = true;
                console.log("loadLibrary loaded");
                resolve();
            };
            s.onerror = reject;
            shouldAppend = true;
        } else if (s.hasAttribute("data-loaded")) {
            loadLibsIntoWindowObject.loaded = true;
            console.log("loadLibrary been loaded");
            resolve();
        }
        if (shouldAppend) {
            document.head.appendChild(s);
        }
    });
}

async function loadLibsIntoWindowObject() {
    await Promise.all([injectScript("https://accounts.google.com/gsi/client"), injectScript("https://apis.google.com/js/api.js")]);
}
loadLibsIntoWindowObject.loaded = false;

function _readTokenFromStorage(): Authentication | null {
    const storedCred: AppSettings = OtpDbLocalSingleton.getInstance().getAppSettings();
    if (!storedCred || !storedCred.googleDriveToken) {
        return null;
    }
    const credentials = JSON.parse(storedCred.googleDriveToken);
    if (credentials && credentials.access_token) {
        return credentials;
    }
    return null;
}
function _writeAuthToStorage(tokenObj: Authentication) {
    const googleDriveToken = JSON.stringify(tokenObj);
    OtpDbLocalSingleton.getInstance().setAppSettings({
        googleDriveToken,
    });
}
function _clearTokenFromStorage() {
    OtpDbLocalSingleton.getInstance().setAppSettings({
        googleDriveToken: null,
    });
}

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let codeClient: google.accounts.oauth2.CodeClient | null = null;

export async function doSignIn(): Promise<void> {
    const user: User = await GoogleAuth.signIn();
    const authentication: Authentication = user.authentication;
    _writeAuthToStorage(authentication);
    accessToken = authentication.accessToken;
}

let accessToken: string | null = null;

GoogleAuth.initialize({
    clientId: CLIENT_ID,
    scopes: Object.values(SCOPES_READABLE),
    grantOfflineAccess: false,
});


export async function doSignOut(): Promise<void> {
    GoogleAuth.signOut();

    // Revoke the access token
    const credentials = _readTokenFromStorage();
    if (credentials && credentials.accessToken) {
        const revokeTokenUrl = `https://oauth2.googleapis.com/revoke?token=${credentials.accessToken}`;
        await fetch(revokeTokenUrl, {
            method: "POST",
        });
    }
    _clearTokenFromStorage();
    accessToken = null;
}

export function isSignedIn(): boolean {
    return !!accessToken;
}

export async function isHavePerms(): Promise<boolean> {
    try {
        const response = await isFileExistGetId();
        return true;
    } catch (error) {
        const apiError = error as gapi.client.Response<any>;
        if ([403, 401].includes(apiError?.result?.error?.code)) {
            // Permission error detected
            return false;
        } else {
            // Other types of errors
            // (no connection, etc)
            throw error;
        }
    }
}

const FILE_NAME = "otp.kdbx";
const MIME_TYPE = "application/x-kdbx";

export async function isFileExistGetId(): Promise<string | null> {
    try {
        const query = encodeURIComponent(`name='${FILE_NAME}' and mimeType='${MIME_TYPE}' and trashed=false and 'appDataFolder' in parents`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=appDataFolder&fields=files(id)`;

        const response = await fetch(url, {
            method: "GET",
            headers: new Headers({
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to list files");
        }

        const data = await response.json();
        const files = data.files;
        if (files && files.length > 0) {
            const fileId = files[0].id || null;
            return fileId;
        }
    } catch (error) {
        console.error("Error: ", error);
    }
    return null;
}

export async function downloadFile(): Promise<string | null> {
    try {
        const fileId = await isFileExistGetId();
        if (!fileId) {
            throw new Error("File not found");
        }

        // Replace YOUR_ACCESS_TOKEN with the actual access token
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            method: "GET",
            headers: new Headers({
                Authorization: `Bearer ${accessToken}`,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to download file");
        }

        const fileData = await response.text(); // or response.blob() if you expect a binary file
        return fileData;
    } catch (error) {
        console.error("Error: ", error);
    }
    return null;
}

export async function deleteFile(fileId: string) {
    if (!fileId) {
        throw new Error("file Id is missing");
    }
    const headers = new Headers({
        Authorization: `Bearer ${accessToken}`,
    });
    try {
        const deletRes = await fetch(`https://www.googleapis.com/drive/v2/files/${fileId}`, {
            method: "DELETE",
            headers,
        });
        jsLogger.debug("delete res", deletRes.status, deletRes.ok);
        return true;
    } catch (e) {
        jsLogger.error("failed to delete file", e);
        return false;
    }
}

export async function uploadOrUpdate(fileContentStr: string, fileId: string | null) {
    jsLogger.debug("uploadOrUpdate");
    const metadata = {
        name: FILE_NAME,
        mimeType: MIME_TYPE,
        parents: ["appDataFolder"],
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", new Blob([fileContentStr], { type: MIME_TYPE }));

    const headers = new Headers({
        Authorization: `Bearer ${accessToken}`,
    });
    try {
        // Check if file exists

        jsLogger.debug("remote fileId: ", fileId);

        let url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id";

        let method = "POST";
        let payload: FormData | string = formData;

        if (fileId) {
            // File exists, get the ID
            url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
            method = "PATCH";
            headers.append("Content-Type", MIME_TYPE);
            // WHY GOOGLE, WHY?????
            payload = fileContentStr;
        }
        // File does not exist, upload as new

        const uploadResponse = await fetch(url, {
            method,
            headers,
            body: payload,
        });
        const uploadResult = await uploadResponse.json();
        console.log("File uploaded. File ID: ", uploadResult.id);
    } catch (error) {
        jsLogger.error("Error: ", error);
        jsLogger.info("Sigining out due to error");
    }
}
