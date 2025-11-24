const LOCAL_STORAGE_KEY = "credentialId";
const LOCAL_STORAGE_PAYLOAD_KEY = "credentialPayload";

import { quickAlert } from "@/helpers/IonicHelpers";
import { decode, encode } from "base64-arraybuffer";

function getRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function getRandomChallenge(): Uint8Array {
    return getRandomBytes(32);
}

async function importAesKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
    return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function storeSensitiveDataToWebauthN(sensitiveString: string): Promise<boolean> {
    if (!("credentials" in navigator) || typeof PublicKeyCredential === "undefined") {
        await quickAlert("Your browser does not support Web Authentication API. Please try a different browser.");
        console.error("Web Authentication API not supported on this browser.");
        return false;
    }

    // Wrapping key K_wrap (32 bytes) that will live in WebAuthn (user.id)
    const wrapKeyBytes = getRandomBytes(32);

    // Encrypt sensitiveString with K_wrap
    const encrypted = await encryptStringWithKey(wrapKeyBytes.buffer, sensitiveString);

    const publicKey: PublicKeyCredentialCreationOptions = {
        rp: {
            name: "Otipi.app",
            id: window.location.hostname,
        },
        user: {
            id: wrapKeyBytes, // <= 64 bytes, OK
            name: "Otipi Client",
            displayName: "Otipi Client",
        },
        challenge: getRandomChallenge(),
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required",
        },
    };

    try {
        const credential = (await navigator.credentials.create({
            publicKey,
        })) as PublicKeyCredential | null;

        // Zero out K_wrap in JS memory
        wrapKeyBytes.fill(0);

        if (!credential) {
            console.error("Error: WebAuthn failed to create credential");
            return false;
        }

        const rawId = credential.rawId;
        const base64CredentialId = encode(rawId);

        // Store only: credential id + encrypted payload
        localStorage.setItem(LOCAL_STORAGE_KEY, base64CredentialId);
        localStorage.setItem(LOCAL_STORAGE_PAYLOAD_KEY, JSON.stringify(encrypted));

        return true;
    } catch (err) {
        console.error("Registration failed", err);
        wrapKeyBytes.fill(0);
        return false;
    }
}

async function encryptStringWithKey(rawKey: ArrayBuffer, plaintext: string): Promise<{ ivB64: string; dataB64: string }> {
    const key = await importAesKey(rawKey);
    const iv = getRandomBytes(12); // AES-GCM 96-bit IV
    const encoded = new TextEncoder().encode(plaintext) as BufferSource;

    const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

    return {
        ivB64: encode(iv.buffer),
        dataB64: encode(cipherBuf),
    };
}

async function decryptStringWithKey(rawKey: ArrayBuffer, ivB64: string, dataB64: string): Promise<string> {
    const key = await importAesKey(rawKey);
    const iv = new Uint8Array(decode(ivB64));
    const cipherBuf = decode(dataB64);

    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBuf);

    return new TextDecoder().decode(plainBuf);
}

async function retrieveSensitiveDataFromWebauthNAsString(): Promise<string | null> {
    const credentialIdB64 = localStorage.getItem(LOCAL_STORAGE_KEY);
    const payloadStr = localStorage.getItem(LOCAL_STORAGE_PAYLOAD_KEY);

    if (!credentialIdB64 || !payloadStr) {
        return null;
    }

    const decodedCredentialId = decode(credentialIdB64);
    const payload: { ivB64: string; dataB64: string } = JSON.parse(payloadStr);

    const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: getRandomChallenge(),
        allowCredentials: [
            {
                id: decodedCredentialId,
                type: "public-key",
            },
        ],
        userVerification: "required",
        rpId: window.location.hostname,
    };

    try {
        const assertion = (await navigator.credentials.get({
            publicKey,
        })) as PublicKeyCredential | null;

        if (!assertion) {
            console.error("No assertion returned");
            return null;
        }

        const authResponse = assertion.response as AuthenticatorAssertionResponse;
        const userHandle = authResponse.userHandle;

        if (!userHandle) {
            console.error("No userHandle returned – need resident credentials");
            return null;
        }

        const wrapKeyBytes = new Uint8Array(userHandle);

        const sensitiveString = await decryptStringWithKey(wrapKeyBytes.buffer, payload.ivB64, payload.dataB64);

        // Optional: zero out K_wrap
        wrapKeyBytes.fill(0);

        return sensitiveString;
    } catch (err) {
        console.error("Authentication failed", err);
        await quickAlert("There was an error retrieving your credentials. Please try again. If it persists, please reset quick login under settings.");
        return null;
    }
}

export function resetQuickLogin(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}
export function isQuickLoginEnabled(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_KEY) !== null;
}
export async function retrieveEncryptedPassFromWebauthn(): Promise<string | null> {
    if (localStorage.getItem(LOCAL_STORAGE_KEY) === null) {
        return null;
    }
    const dateRecieved: string | null = await retrieveSensitiveDataFromWebauthNAsString();
    return dateRecieved;
}

export async function storeEncryptedPassToWebauthn(sensitiveString: string): Promise<boolean> {
    // Check if sensitiveString is longer than 64 bytes
    //https://www.w3.org/TR/webauthn-2/#dom-publickeycredentialuserentity-id
    if (new TextEncoder().encode(sensitiveString).length > 64) {
        throw new Error("Sensitive string must not be longer than 64 bytes");
    }

    if (localStorage.getItem(LOCAL_STORAGE_KEY) !== null) {
        throw new Error("WebauthN already has a stored credential");
    }
    return await storeSensitiveDataToWebauthN(sensitiveString);
}
