/// <reference types="vite/client" />

import { LogLevelDesc } from "loglevel";

interface ImportMetaEnv {
    readonly VITE_LOG_LEVEL: LogLevelDesc;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
