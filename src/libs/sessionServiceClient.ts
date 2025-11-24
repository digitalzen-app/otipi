// In your main Vue component or App.vue

import { jsLogger } from "@/libs/jsLogger";

let serviceWorkerInstance: ServiceWorker | null = null;
export async function initServiceWorkerInstance() {
  jsLogger.debug("Initializing service worker instance");

  // @ts-ignore
  if (initServiceWorkerInstance.initiated) {
    throw new Error("Service worker instance already initialized");
  }
  // @ts-ignore
  initServiceWorkerInstance.initiated = true;
  // Register the service worker
  if (!("serviceWorker" in navigator)) {
    jsLogger.error("Service workers are not supported by this browser");
    return null;
  }
  return new Promise<ServiceWorker | null>((resolve, reject) => {
    try {
      navigator.serviceWorker
        .register("/sessionServiceWorker.js")
        .then((registration) => {
          if (!registration.active) {
            jsLogger.error(
              "Service Worker registration failed: ",
              registration
            );
            reject(null);
          }
          serviceWorkerInstance = registration.active;
          jsLogger.info("Service Worker registered: ", serviceWorkerInstance);
          resolve(serviceWorkerInstance);
        })
        .catch((error) => {
          jsLogger.error("Service Worker registration failed: ", error);
          reject(null);
        });
    } catch (error) {
      jsLogger.error("Service Worker registration failed: ", error);
      reject(null);
    }
  });
}
function _getServiceWorkerInstance() {
  if (!serviceWorkerInstance) {
    throw new Error(
      "Service worker instance not initialized, please call initServiceWorkerInstance first"
    );
  }
  return serviceWorkerInstance;
}

export function isServiceWorkerInitialized() {
  return serviceWorkerInstance !== null;
}
// Function to store session data
export async function storeSessiontoSw(sessionData: string): Promise<boolean> {
  if (!isServiceWorkerInitialized()) {
    return false;
  }
  return new Promise((resolve) => {
    jsLogger.debug("sending message to service worker");
    const timeoutCounter = setTimeout(() => {
      jsLogger.error("Timeout while sending session");
      resolve(false);
    }, 200);
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timeoutCounter);
      if (event.data.status === "stored") {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    _getServiceWorkerInstance().postMessage(
      { command: "storeSession", data: sessionData },
      [messageChannel.port2]
    );
  });
}

// Function to retrieve session data
export async function getSessionFromSw(): Promise<string | null> {
  if (!isServiceWorkerInitialized()) {
    jsLogger.warn("Service worker not initialized");
    return null;
  }
  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    const timeoutCounter = setTimeout(() => {
      jsLogger.error("Timeout while retrieving session");
      reject(null);
    }, 200);
    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timeoutCounter);
      if (event.data.status === "retrieved") {
        resolve(event.data.data);
      } else {
        reject(null);
      }
    };
    _getServiceWorkerInstance().postMessage({ command: "getSession" }, [
      messageChannel.port2,
    ]);
  });
}
