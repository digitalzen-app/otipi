# Development Guide

This document provides instructions for developers working on the Otipi project.
Android and Desktop app are an optional future feature...

### Android Build
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

The output will be in `android/app/build/outputs/bundle/release/`.

### Desktop Build (Electron)
```bash
npm run build:electron
```