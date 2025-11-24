import { jsLogger } from "@/libs/jsLogger";
import { isFileExistGetId, downloadFile, uploadOrUpdate, isSignedIn, doSignOut, doSignIn, isHavePerms, deleteFile } from "./Gapi";
import { OtpDb } from "./OtpDb";
import { funnyAlert, passwordAlert, quickAlert, quickConfirm, quickDangerToast, quickSuccessToast, quickWarninigToast } from "@/helpers/IonicHelpers";
import { OtpDbLocalSingleton, getLocalDbInstance } from "@/libs/OtpDbLocalSingleton";
import { Kdbx, KdbxEntry, ProtectedValue } from "kdbxweb";

export class SyncSingletonLib {
    private static _instance: SyncSingletonLib | null = null;
    constructor() {
        if (SyncSingletonLib._instance) {
            throw new Error("SyncLib initiated already");
        }
        SyncSingletonLib._instance = this;
    }

    static async getFreshSessionInstance(): Promise<SyncSingletonLib | null> {
        if (!SyncSingletonLib._instance) {
            await this.prepareGdriveSession();
            SyncSingletonLib._instance = new SyncSingletonLib();
        }
        // this is not redundent, user may lose session between syncs
        const success = await this.prepareGdriveSession();
        if (!success) {
            return null;
        }
        return SyncSingletonLib._instance;
    }

    private static async prepareGdriveSession(): Promise<boolean> {
        if (!isSignedIn()) {
            jsLogger.info("Not signed in, attempting to sign in");
            // kill remaining session
            await doSignOut();
            await doSignIn();
        }
        if (!isSignedIn()) {
            quickDangerToast("Failed to sign in to Google Drive");
            return false;
        }
        let isPerm = false;
        try {
            isPerm = await isHavePerms();
        } catch (e) {}
        if (!isPerm) {
            await doSignOut();
            quickWarninigToast("Lost session trying again");
            await doSignIn();
        }
        return true;
    }

    async syncWithGdrive(overwriteLocal: boolean = false): Promise<boolean> {
        const remoteFileExists = await isFileExistGetId();
        let remoteOtpDbRef = null;
        const localDbRef = OtpDbLocalSingleton.getInstance();
        // by default we are syncning local to remote
        let isSyncLocalToRemote = true;

        if (remoteFileExists) {
            jsLogger.info("File exist in Gdrive, downloading...");
            const remoteFileStr = await downloadFile();
            if (!remoteFileStr) {
                return false;
            }
            remoteOtpDbRef = await this._tryOpenRemoteFileByLocalSession(remoteFileStr);
            if (!remoteOtpDbRef) {
                // if the passwords are not the same we will not sync local to remote
                isSyncLocalToRemote = false;
                remoteOtpDbRef = await this._tryOpenRemoteFileByPassword(remoteFileStr);
            }
            if (!remoteOtpDbRef) {
                return false;
            }
        }

        // if remoteDb is present, sync it with localDb
        // if remoteDb is not present, just save localDb to remote
        if (remoteOtpDbRef) {
            if (overwriteLocal) {
                jsLogger.info("Overwriting local with remote");
                localDbRef.setOtpDbRef(remoteOtpDbRef);
            } else {
                // merge remote into local
                jsLogger.debug("Try merge remote into local");
                const res = await this._mergeRemoteIntoCurrent(remoteOtpDbRef, localDbRef.getOtpDbRef());
                if (!res) {
                    return false;
                }
            }
            // change localdb to new merged db
            // localDb.setOtpDbRef(localDbCopy);
            // save it to localsystem
            await localDbRef.saveDbToLocal();
        }
        if (isSyncLocalToRemote) {
            await this.writeLocalOverRemote();
            jsLogger.info("Sync completed");
        } else {
            jsLogger.info("Not syncing local to remote");
            await quickAlert(`Not syncing local to remote because passwords are different, please use the "Overwrite" button from the "Danger zone".`);
        }
        return true;
    }

    async writeLocalOverRemote(): Promise<boolean> {
        try {
            jsLogger.info("Syncing local to remote");
            const localDb = OtpDbLocalSingleton.getInstance();
            const localDbAsArrBuff = await localDb.getOtpDbRef().getDbAsEncodedString();
            const localOtpDbCopy = await getLocalDbInstance().openDbFromEncodedStringWithSessionPass(localDbAsArrBuff);
            // remove APP_SETTINGS group from localcopy so we will not send settings to cloud and have problems with sync
            this._removeSettingsGroupFromDb(localOtpDbCopy.getKdbxDbRef());
            const finalLocalDbAsStr = await localOtpDbCopy.getDbAsEncodedString();
            const fileId = await isFileExistGetId();
            await uploadOrUpdate(finalLocalDbAsStr, fileId);
            // clear editing state so next time we sync it will work
            // localDb.getOtpDbRef().getKdbxDbRef().removeLocalEditState(); // remove local editing state
            return true;
        } catch (e) {
            jsLogger.error("Error while syncing local to remote", e);
            funnyAlert("Error while syncing local to remote");
            return false;
        }
    }

    async writeRemoteOverLocal(): Promise<boolean> {
        try {
            return this.syncWithGdrive(true);
        } catch (e) {
            jsLogger.error("Error while syncing local to remote", e);
            funnyAlert("Error while syncing local to remote");
            return false;
        }
    }

    _removeSettingsGroupFromDb(dbRef: Kdbx) {
        dbRef.getDefaultGroup().groups = dbRef.getDefaultGroup().groups.filter((group) => group.name !== OtpDb.APP_SETTINGS_GROUP_NAME);
    }

    // https://github.com/keeweb/kdbxweb?tab=readme-ov-file#merge
    async _mergeRemoteIntoCurrent(remoteDb: OtpDb, localDb: OtpDb): Promise<boolean> {
        try {
            const localDbKdbxRef = localDb.getKdbxDbRef();
            const remoteDbKdbxRef = remoteDb.getKdbxDbRef();

            // remove APP_SETTINGS group from remote
            this._removeSettingsGroupFromDb(remoteDbKdbxRef);

            // let editStateBeforeSave = localDbKdbxRef.getLocalEditState(); // save local editing state (serializable to JSON)
            // // const savedLoclAsArrBuf = await localDbKdbxRef.save();
            // // const localOtpDbCopy = await getLocalDbInstance().openDbByArrayBufferWithSessionPass(savedLoclAsArrBuf);
            // // const editStateBeforeSave2 = localOtpDbCopy.getKdbxDbRef().getLocalEditState(); // save local editing state (serializable to JSON)
            // // jsLogger.debug("editStateBeforeSave", editStateBeforeSave);
            // // jsLogger.debug("editStateBeforeSave2", editStateBeforeSave2);
            // localOtpDbCopy.getKdbxDbRef().setLocalEditState(editStateBeforeSave); // assign edit state obtained before save

            localDbKdbxRef.merge(remoteDbKdbxRef); // merge remote into local

            // editStateBeforeSave = localOtpDbCopy.getKdbxDbRef().getLocalEditState(); // save local editing state again
            return true;
        } catch (e) {
            jsLogger.error("Error while merging remote into local", e);
            quickAlert({ header: "Error while merging remote into local", message: "You may overwrite local with remote through danger zone, and lose your changes." });
            return false;
        }
    }

    /**
     * @deprecated
     * @param remoteDb 
     * @param localDb 
     */
    _mergeRemoteIntoCurrent_old(remoteDb: OtpDb, localDb: OtpDb) {
        const remoteOtpSecretsMapUuidToEntry: Record<string, KdbxEntry> = {};
        const localOtpSecretsMapUuidToEntry: Record<string, KdbxEntry> = {};
        const remoteArchivedSecretsArr: Array<string> = [];
        const remoteDeletedUuids: Array<string> = [];

        remoteDb.getGroupByName(OtpDb.OTP_SECRETS_GROUP_NAME).entries.forEach((entry) => {
            remoteOtpSecretsMapUuidToEntry[entry.uuid.id] = entry;
        });
        remoteDb.getGroupByName(OtpDb.APP_ARCHIVE_GROUP_NAME).entries.forEach((entry) => {
            remoteArchivedSecretsArr.push(entry.uuid.id);
        });

        localDb.getGroupByName(OtpDb.OTP_SECRETS_GROUP_NAME).entries.forEach((entry) => {
            localOtpSecretsMapUuidToEntry[entry.uuid.id] = entry;
        });

        for (const remoteUuid in remoteOtpSecretsMapUuidToEntry) {
            const remoteEntry = remoteOtpSecretsMapUuidToEntry[remoteUuid];
            const localEntry = localOtpSecretsMapUuidToEntry[remoteUuid];
            // if remote entry is not present in local, add it
            if (!localEntry) {
                localDb.getGroupByName(OtpDb.OTP_SECRETS_GROUP_NAME).entries.push(remoteEntry);
            }
            // if remote entry is present in local, update it if remote is newer
            else {
                if (remoteEntry.lastModTime > localEntry.lastModTime) {
                    localEntry.fields = remoteEntry.fields;
                }
            }
        }
    }

    async _tryOpenRemoteFileByLocalSession(remoteFileStr: string): Promise<OtpDb | null> {
        try {
            const localDb = OtpDbLocalSingleton.getInstance();
            const remoteDbRef = await localDb.openDbFromEncodedStringWithSessionPass(remoteFileStr);
            jsLogger.info("Opened remote DB");
            return remoteDbRef;
        } catch (e) {
            jsLogger.error("Failed opening with session password", e);
        }
        return null;
    }

    async _tryOpenRemoteFileByPassword(remoteFileStr: string, initNewLocalDbFromRemoteFile: boolean = false): Promise<OtpDb | null> {
        try {
            const { data: password, role } = await passwordAlert({
                headerText: "I need your help to open the remote DB",
                messageText: "Enter password to open remote DB if it is encrypted with diffrent pass, the password of remote file is the same as your last synced vault.",
            });
            if (!password) {
                return null;
            }
            const encryptedPassRef = OtpDb.getEncryptedPassRef(password);
            const remoteDbRef = await OtpDb.openDbFromEncodedString(remoteFileStr, encryptedPassRef);
            if (initNewLocalDbFromRemoteFile) {
                // init a new DB with this password
                await OtpDbLocalSingleton.initNewDb(encryptedPassRef);
                // set remote dbRef into local
                OtpDbLocalSingleton.getInstance().setOtpDbRef(remoteDbRef);
            }
            quickSuccessToast("Yay! It's your lucky day. I managed to open the backup vault with the password.");
            return remoteDbRef;
        } catch (e) {
            jsLogger.error("Failed opening with password", e);
            quickDangerToast("Failed to open remote DB with password, try again");
            // recurse into the function again
            // let's hope the user will lost his patient before the recursion limit
            return this._tryOpenRemoteFileByPassword(remoteFileStr, initNewLocalDbFromRemoteFile);
        }
    }

    async removeRemote() {
        const fileId = await isFileExistGetId();
        jsLogger.debug(`remote file Id ${fileId}`);
        if (!fileId) {
            return false;
        }
        return await deleteFile(fileId);
    }
}
