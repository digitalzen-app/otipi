import * as logger from "loglevel";
// get log level from vite
const logLevel = import.meta.env.VITE_LOG_LEVEL || "error";
console.log("logLevel", logLevel);
logger.setLevel(logLevel);

export const jsLogger = logger;
