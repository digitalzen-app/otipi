import { OtpDb, OtpEntry } from "@/libs/OtpDb";
import * as kdbx from "kdbxweb";
import { saveAs } from "file-saver";
import { decode } from "base64-arraybuffer";
import { jsLogger } from "@/libs/jsLogger";
import { isQuickLoginEnabled, retrieveEncryptedPassFromWebauthn, storeEncryptedPassToWebauthn } from "@/libs/webauthnSecret";
import { passwordAlert, quickAlert } from "@/helpers/IonicHelpers";
import { getSessionFromSw, storeSessiontoSw } from "@/libs/sessionServiceClient";
import { buildOtpUrl } from "@/helpers/otpUrlHelpers";

export interface AppSettings {
    isKeepOpenUntilRestart: boolean;
    googleDriveToken: string | null;
}
const DEFAULT_APP_SETTINGS: AppSettings = {
    isKeepOpenUntilRestart: false,
    googleDriveToken: null,
};
export class OtpDbLocalSingleton {
    private static _instance: OtpDbLocalSingleton | null = null;
    private _otpDbRef: OtpDb | null = null;
    private _encryptedPassRef: kdbx.KdbxCredentials | null = null;

    private constructor(_otpDbRef: OtpDb, encryptedPassRef: kdbx.KdbxCredentials) {
        if (OtpDbLocalSingleton._instance) {
            throw new Error("Database already initialized");
        }
        OtpDbLocalSingleton._instance = this;
        this._otpDbRef = _otpDbRef;
        this._encryptedPassRef = encryptedPassRef;
    }

    static getInstance(): OtpDbLocalSingleton {
        if (!this._instance) {
            throw new Error("Instance not initialized");
        }
        return this._instance;
    }

    getOtpDbRef(): OtpDb {
        if (!this._otpDbRef) {
            throw new Error("Database not initialized");
        }
        return this._otpDbRef;
    }

    /**
     * We use it on copy db operations
     * @param otpDbRef
     */
    setOtpDbRef(otpDbRef: OtpDb): void {
        this._otpDbRef = otpDbRef;
    }

    static async tryAutoOpenLocalDb(): Promise<boolean> {
        if (this.isLocalDbOpen()) {
            return true;
        }
        try {
            if(import.meta.env.DEV){
                const passwordProtectedBase64 = localStorage.getItem("dev-session");    
                if(!passwordProtectedBase64){
                    return false;
                }
                jsLogger.info("We have open session, trying to open db");
                const passwordProtected = kdbx.ProtectedValue.fromBase64(passwordProtectedBase64);
                const encryptedPassRef = new kdbx.Credentials(passwordProtected);
                await this.openLocalDb(encryptedPassRef);
                return this.isLocalDbOpen();
            }
            const passwordProtectedBase64 = await getSessionFromSw();
            if (!passwordProtectedBase64) {
                return false;
            }
            jsLogger.info("We have open session, trying to open db");
            const passwordProtected = kdbx.ProtectedValue.fromBase64(passwordProtectedBase64);
            const encryptedPassRef = new kdbx.Credentials(passwordProtected);

            await this.openLocalDb(encryptedPassRef);
            return this.isLocalDbOpen();
        } catch (e) {
            return false;
        }
    }

    async registerQuickLogin() {
        if (isQuickLoginEnabled()) {
            throw new Error("Quick login already enabled, this is a bug in your flow");
        }
        try {
            const { data: password } = await passwordAlert();
            const encryptedPass: string = kdbx.ProtectedValue.fromString(password).toBase64();

            const otpEncryptedPass = OtpDb.getEncryptedPassRef(password);
            const currentDb = await this.getOtpDbRef().getDbAsArrayBuffer();
            try {
                await OtpDb.openDbByArrayBuffer(currentDb, otpEncryptedPass);
            } catch (e) {
                await quickAlert("Wrong password...");
                throw new Error("Failed to open db with provided password");
            }
            const res = await storeEncryptedPassToWebauthn(encryptedPass);
            if (!res) {
                throw new Error("Failed to store quick login");
            }
            return true;
        } catch (e) {
            jsLogger.error("Failed to register quick login", e);
        }
        return false;
    }

    static async tryQuickLogin() {
        if (!isQuickLoginEnabled()) {
            return false;
        }
        try {
            const encryptedPassBase64: string | null = await retrieveEncryptedPassFromWebauthn();
            if (!encryptedPassBase64) {
                return false;
            }
            const encryptedPass: kdbx.ProtectedValue = kdbx.ProtectedValue.fromBase64(encryptedPassBase64);
            const encryptedPassRef = new kdbx.Credentials(encryptedPass);
            await this.openLocalDb(encryptedPassRef);
        } catch (e) {
            return false;
        }
    }

    static isLocalDbOpen(): boolean {
        return !!this._instance;
    }

    static isLocalDbExist(): boolean {
        return !!localStorage.getItem(OtpDb.KDBX_DBNAME);
    }

    static async initNewDb(encryptedPassRef: kdbx.KdbxCredentials): Promise<OtpDbLocalSingleton> {
        if (this._instance) {
            throw new Error("Database already initialized");
        }
        // Call the synchronous base class method to initialize the database
        const _otpDbRef = OtpDb.initNewDb(encryptedPassRef);
        this._instance = new OtpDbLocalSingleton(_otpDbRef, encryptedPassRef); // This cast is unsafe unless you're sure of compatibility.

        // Assuming saveDbToLocal is defined and does something meaningful in an async way
        await this._instance.saveDbToLocal();

        return this._instance;
    }

    static async openLocalDb(encryptedPassRef: kdbx.KdbxCredentials): Promise<OtpDbLocalSingleton> {
        if (!this.isLocalDbExist()) {
            throw new Error("Database not initialized");
        }
        if (!this._instance) {
            const dataAsStr = localStorage.getItem(OtpDb.KDBX_DBNAME);
            if (!dataAsStr) throw new Error("Failed to retrieve DB from localStorage");
            const _otpDbRef = await OtpDb.openDbFromEncodedString(dataAsStr, encryptedPassRef);
            this._instance = new OtpDbLocalSingleton(_otpDbRef, encryptedPassRef);
        }
        return this._instance;
    }

    async isCorrectPassword(password: string): Promise<boolean> {
        const otpDbRef = this.getOtpDbRef();
        const encryptedPassRef = OtpDb.getEncryptedPassRef(password);
        const localDb = await otpDbRef.getDbAsArrayBuffer();
        try {
            await OtpDb.openDbByArrayBuffer(localDb, encryptedPassRef);
            return true;
        } catch (e) {
            return false;
        }
    }
    async changePasswordAndLock(newPass: string) {
        const dbRef = this.getOtpDbRef().getKdbxDbRef();
        dbRef.credentials.setPassword(kdbx.ProtectedValue.fromString(newPass));
        await this.closeLocalDb();
    }

    private _getProtectedSessionPassRef(): kdbx.KdbxCredentials {
        if (!this._encryptedPassRef) {
            throw new Error("Password not initialized");
        }
        return this._encryptedPassRef;
    }
    async openDbFromEncodedStringWithSessionPass(dataAsStr: string): Promise<OtpDb> {
        const readData = decode(dataAsStr);
        return OtpDb.openDbByArrayBuffer(readData, this._getProtectedSessionPassRef());
    }

    async openDbByArrayBufferWithSessionPass(dbAsArrayBuffer: ArrayBuffer): Promise<OtpDb> {
        return OtpDb.openDbByArrayBuffer(dbAsArrayBuffer, this._getProtectedSessionPassRef());
    }

    async saveDbToLocal(): Promise<void> {
        const dataAsStr = await this.getOtpDbRef().getDbAsEncodedString();
        localStorage.setItem(OtpDb.KDBX_DBNAME, dataAsStr);
    }

    async downloadDb(): Promise<void> {
        const arrayBuffer = await this.getOtpDbRef().getDbAsArrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
        saveAs(blob, "backup.otipi");
    }

    async addOtpEntry(title: string, otpUrl: string, logoDomain?: string): Promise<void> {
        const otpDbRef = this.getOtpDbRef();
        const dbRef = otpDbRef.getKdbxDbRef();
        const entry = dbRef.createEntry(otpDbRef.getGroupByName(OtpDb.OTP_SECRETS_GROUP_NAME));
        entry.fields.set("Title", title);
        entry.fields.set("otp", kdbx.ProtectedValue.fromString(otpUrl));
        if (logoDomain) {
            entry.fields.set("logoDomain", logoDomain);
        }
        await this.saveDbToLocal();
    }

    async updateEntry(entry: OtpEntry): Promise<void> {
        const otpDbRef = this.getOtpDbRef();
        const dbEntry = otpDbRef.getEntryByUuid(OtpDb.OTP_SECRETS_GROUP_NAME, entry.uuid);
        if (!dbEntry) {
            throw new Error("Entry not found, not updating");
        }
        dbEntry.fields.set("Title", entry.title);
        if (entry.logoDomain) {
            dbEntry.fields.set("logoDomain", entry.logoDomain);
        }
        await this.saveDbToLocal();

    }

    async addEntryByManualSecret({
        title,
        secret,
        issuer,
        logoDomain
    }: {
        title: string;
        secret: string;
        issuer?: string;
        logoDomain?: string;
    }): Promise<boolean> {
        const otpUrl = buildOtpUrl({ title, secret, issuer });
        if (!otpUrl) {
            return false;
        }
        await this.addOtpEntry(title, otpUrl, logoDomain);
        await this.saveDbToLocal();
        return true;
    }

    getAppSettings(): AppSettings {
        const settingsGroup = this.getOtpDbRef().getGroupByName(OtpDb.APP_SETTINGS_GROUP_NAME);
        if (!settingsGroup) {
            throw new Error("DE FUC? there is a constructor!");
        }
        let settings = DEFAULT_APP_SETTINGS;
        settingsGroup.entries.forEach((entry) => {
            if (entry.fields.get("Title") === OtpDb.APP_SETTINGS_GROUP_NAME) {
                const settingsStr = entry.fields.get("settings") as string;

                try {
                    const dbSettings = JSON.parse(settingsStr);
                    settings = Object.assign({}, DEFAULT_APP_SETTINGS, dbSettings);
                } catch (e) {
                    // do nothing
                }
            }
        });
        return settings as AppSettings;
    }

    async setAppSettings(partialSettings: Partial<AppSettings>): Promise<void> {
        const fullSettings = Object.assign({}, this.getAppSettings(), partialSettings);
        // check if key in app settings
        const dbRef = this.getOtpDbRef().getKdbxDbRef();
        let settingsGroup = this.getOtpDbRef().getGroupByName(OtpDb.APP_SETTINGS_GROUP_NAME);
        if (!settingsGroup) {
            settingsGroup = dbRef.createGroup(dbRef.getDefaultGroup(), OtpDb.APP_SETTINGS_GROUP_NAME);
        }
        // clear all entries
        settingsGroup.entries.forEach((entry) => {
            dbRef.remove(entry);
        });
        // set new one
        const entry = dbRef.createEntry(settingsGroup);
        // Create a new entry for the settings
        entry.fields.set("Title", OtpDb.APP_SETTINGS_GROUP_NAME);
        entry.fields.set("settings", JSON.stringify(fullSettings));
        await this.saveDbToLocal();
    }

    async archiveMovementAction(uuid: string, moveIntoArchiveDirection: boolean = true): Promise<boolean> {
        const otpDbRef = this.getOtpDbRef();
        const dbRef = otpDbRef.getKdbxDbRef();
        const moveFromGroupName = moveIntoArchiveDirection ? OtpDb.OTP_SECRETS_GROUP_NAME : OtpDb.APP_ARCHIVE_GROUP_NAME;
        const moveIntoGroupName = moveIntoArchiveDirection ? OtpDb.APP_ARCHIVE_GROUP_NAME : OtpDb.OTP_SECRETS_GROUP_NAME;

        const entry = otpDbRef.getEntryByUuid(moveFromGroupName, uuid);
        if (entry) {
            const moveIntoGroupRef = otpDbRef.getGroupByName(moveIntoGroupName);
            dbRef.move(entry, moveIntoGroupRef);
            await this.saveDbToLocal();
            return true;
        }
        return false;
    }

    async deleteOtpEntryFromArchive(uuid: string): Promise<boolean> {
        const otpDbRef = this.getOtpDbRef();
        const dbRef = otpDbRef.getKdbxDbRef();
        const entry = otpDbRef.getEntryByUuid(OtpDb.APP_ARCHIVE_GROUP_NAME, uuid);
        if (entry) {
            dbRef.remove(entry);
            await this.saveDbToLocal();
            return true;
        }
        return false;
    }
    async closeLocalDb(): Promise<void> {
        jsLogger.info("Closing local db");
        await this.saveDbToLocal();
        jsLogger.info("Local db saved");
        this.getOtpDbRef().closeDb();
        jsLogger.info("Local db closed");
        this._otpDbRef = null;
        this._encryptedPassRef = null;
        jsLogger.info("Local db ref nulled");
        OtpDbLocalSingleton._instance = null;
        jsLogger.info("Local db instance nulled");
        await storeSessiontoSw("");
        jsLogger.info("clear SW session storage");
    }
    async deleteLocalDb() {
        // clear the session
        await this.closeLocalDb();
        // remove the DB
        localStorage.removeItem(OtpDb.KDBX_DBNAME);
    }
}

export function getLocalDbInstance() {
    if (!OtpDbLocalSingleton.isLocalDbOpen()) {
        throw new Error("LocalDb not open");
    }
    return OtpDbLocalSingleton.getInstance();
}
