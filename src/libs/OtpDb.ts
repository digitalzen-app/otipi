import { argon2Wrapper } from "./argon2Wrapper.js";
import * as kdbx from "kdbxweb";

// import speakeasy from "speakeasy";
import { decode, encode } from "base64-arraybuffer";

import * as OTPAuth from "otpauth";
import { jsLogger } from "./jsLogger.js";

export interface OtpEntry {
    uuid: string;
    title: string;
    token: string;
    issuer: string;
    logoDomain?: string;
}

kdbx.CryptoEngine.setArgon2Impl(argon2Wrapper);

export class OtpDb {
    private databaseRef: kdbx.Kdbx | null;
    static readonly KDBX_DBNAME: string = "otp";
    static readonly OTP_SECRETS_GROUP_NAME: string = "OTP_SECRETS";
    static readonly APP_SETTINGS_GROUP_NAME: string = "APP_SETTINGS";
    static readonly APP_ARCHIVE_GROUP_NAME: string = "OTP_ARCHIVE";

    private ALLOWED_GROUP_NAMES: string[] = [OtpDb.APP_SETTINGS_GROUP_NAME, OtpDb.OTP_SECRETS_GROUP_NAME, OtpDb.APP_ARCHIVE_GROUP_NAME];

    constructor(databaseRef: kdbx.Kdbx) {
        this.databaseRef = databaseRef;
        this.lazyInitDefaultGroups();
    }

    private lazyInitDefaultGroups() {
        for (const groupName of this.ALLOWED_GROUP_NAMES) {
            try {
                this.getGroupByName(groupName);
            } catch (e) {
                const defaultGroup = this.getKdbxDbRef().getDefaultGroup();
                this.getKdbxDbRef().createGroup(defaultGroup, groupName);
            }
        }
    }
    closeDb(): void {
        this.databaseRef = null;
    }
    getKdbxDbRef(): kdbx.Kdbx {
        if (!this.databaseRef) {
            throw new Error("Database not initialized");
        }
        return this.databaseRef;
    }

    static getEncryptedPassRef(password: string): kdbx.KdbxCredentials {
        const encryptedPassRef = kdbx.ProtectedValue.fromString(password);

        const cred = new kdbx.Credentials(encryptedPassRef);
        return cred;
    }
    static initNewDb(encryptedPassRef: kdbx.KdbxCredentials): OtpDb {
        const databaseRef = kdbx.Kdbx.create(encryptedPassRef, this.KDBX_DBNAME);
        jsLogger.info("Database created");
        return new this(databaseRef);
    }
    static initFromKdbxDbRef(databaseRef: kdbx.Kdbx): OtpDb {
        return new this(databaseRef);
    }
    static async openDbFromEncodedString(dataAsStr: string, encryptedPassRef: kdbx.KdbxCredentials): Promise<OtpDb> {
        const readData = decode(dataAsStr);
        return this.openDbByArrayBuffer(readData, encryptedPassRef);
    }

    static async openDbByArrayBuffer(dbAsArrayBuffer: ArrayBuffer, encryptedPassRef: kdbx.KdbxCredentials): Promise<OtpDb> {
        const databaseRef = await kdbx.Kdbx.load(dbAsArrayBuffer, encryptedPassRef);
        return new this(databaseRef);
    }
    async getDbAsArrayBuffer(): Promise<ArrayBuffer> {
        const arrayBuffer = await this.getKdbxDbRef().save();
        return arrayBuffer;
    }
    async getDbAsEncodedString(): Promise<string> {
        const arrayBuffer = await this.getDbAsArrayBuffer();
        return encode(arrayBuffer);
    }

    /**
     * @throws Error
     * @param groupName
     * @returns kdbx.KdbxGroup
     */
    getGroupByName(groupName: string): kdbx.KdbxGroup {
        if (!this.ALLOWED_GROUP_NAMES.includes(groupName)) {
            throw new Error(`Group name ${groupName} not allowed`);
        }
        const group = this.getKdbxDbRef()
            .getDefaultGroup()
            .groups.find((group) => {
                return group.name === groupName;
            });
        if (!group) {
            throw new Error(`Group ${groupName} not found`);
        }
        return group;
    }

    getEntryByUuid(groupName: string, uuid: string): kdbx.KdbxEntry | null {
        const group = this.getGroupByName(groupName);
        const entry = group.entries.find((entry) => {
            return entry.uuid.id === uuid;
        });
        if (!entry) {
            return null;
        }
        return entry;
    }

    getCalculatedOtpEntries(getFromArchive: boolean = false): Array<OtpEntry> {
        const response: Array<OtpEntry> = [];
        const groupName = getFromArchive ? OtpDb.APP_ARCHIVE_GROUP_NAME : OtpDb.OTP_SECRETS_GROUP_NAME;
        this.getGroupByName(groupName).entries.forEach((entry) => {
            const title: string = entry.fields.get("Title") as string;
            const logoDomain: string = entry.fields.get("logoDomain") as string;

            const protectedOtp: kdbx.ProtectedValue = entry.fields.get("otp") as kdbx.ProtectedValue;
            const otpUrl = new kdbx.ProtectedValue(protectedOtp.value, protectedOtp.salt).getText();

            let token = "";
            let issuer = "";

            try {
                const totp = OTPAuth.URI.parse(otpUrl);
                token = totp.generate();
                issuer = totp.issuer || totp.label;
            } catch (e) {
                // do nothing
            }

            response.push({
                uuid: entry.uuid.id,
                title,
                token,
                issuer,
                logoDomain
            });
        });
        return response;
    }
}
