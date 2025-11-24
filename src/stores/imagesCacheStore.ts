// store/imageCacheStore.js
import { jsLogger } from "@/libs/jsLogger";
import { defineStore } from "pinia";

export const useImageCacheStore = defineStore("imageCache", {
  state: () => ({
    imageCache: {} as Record<string, string | false>, // Stores domain: imageSrc or false
  }),
  actions: {
    async checkAndCacheImage(domain: string, useCache = true) {
      if (this.imageCache[domain] !== undefined) {
        // If domain is already in cache, return the cached value
        return this.imageCache[domain];
      }

      const src = `https://www.google.com/s2/favicons?domain=https://${domain}&sz=32`;
      const exists = await imageExists(src); // Assume imageExists is defined as shown previously
      jsLogger.debug(`Image for ${domain} exists: ${exists}`);
      const resultSrc = exists ? src : false;
      if (useCache) {
        this.imageCache[domain] = resultSrc;
      }

      return resultSrc;
    },
  },
});

async function imageExists(url: string) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // when image not found we get 16x16 image, this is the default size
      // we might get it also for domains that do not have  bigger favicon
      if (img.width == 16) {
        resolve(false);
      }
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
