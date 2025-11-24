# OTIPI - 2FA ANYWHERE 
## A Browser-Based Two-Factor Authentication (2FA) App

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-my.otipi.app-green.svg)](https://my.otipi.app)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/digitalzen-app/otipi/graphs/commit-activity)

**OTIPI** is a secure, open-source, web-based One-Time Password (OTP) authenticator designed as a modern replacement for Authy. Access your 2FA codes from any device, anywhere, with complete control over your data.

*Maintained by the [DigitalZen.app - apps and websites blocker](https://digitalzen.app) team (but don’t forget to check the [disclaimer](#-disclaimer-with-a-smile)!).*

## 🌟 Why OTIPI?

We used Authy for a long time on desktop, but they have now become a mobile-only app. If we lose our mobile device, we lose access to our accounts. 

So, we created OTIPI as a browser-based 2FA app, that can work on ANY device.

- **Works on ANY browser, on ANY device**: No server-side storage of your data.
- **Cross-device redundancy**: Your data is encrypted and stored in your own cloud storage (currently Google Drive, with plans to add more cloud providers).

### Key Benefits:
- **🌐 Universal Access**: Works on any operating system through your web browser.
- **🔒 Privacy-First**: Your OTP seeds are stored locally in an encrypted vault within your browser. Optionally, the vault can be stored in a private location on Google Drive, ensuring it remains inaccessible to others.
- **🚫 No Vendor Lock-in**: Open-source alternative to proprietary 2FA apps.
- **☁️ Sync Anywhere**: Optional Google Drive integration for cross-device sync.
- **🔐 End-to-End Encryption**: Your vault is encrypted with your master password.
- **📱 Progressive Web App**: Install on mobile devices for a native app experience.

## 🚀 Use OTIPI Now

Access OTIPI directly in your browser: **[my.otipi.app](https://my.otipi.app)**

## ✨ Features

### Core Functionality
- **Time-based OTP (TOTP)** generation compatible with Google Authenticator.
- **QR Code scanning** for easy account setup.
- **Manual entry** support for accounts without QR codes.
- **Vault encryption** with a user-defined master password.
- **Archive management** for organizing inactive accounts.

### Security Features
- **Local-first storage**: Your data never leaves your device unless you choose.
- **Optional cloud backup**: Sync to your personal Google Drive.
- **Biometric/WebAuthn quick login** (where supported).
- **Auto-lock functionality** with customizable timeouts.
- **Import/Export** encrypted vault files.

### User Experience
- **Modern, responsive UI** built with Ionic Vue.
- **Dark/Light theme** support.
- **Search and organize** your 2FA accounts.
- **Bulk operations** for managing multiple accounts.
- **Cross-platform compatibility** (Web, Android, iOS, Desktop).

## 🛡️ Security & Privacy

OTIPI is designed with security and privacy as top priorities:

- **Zero-knowledge architecture**: We never see your OTP seeds or passwords.
- **Client-side encryption**: All encryption happens in your browser.
- **Optional cloud sync**: Choose to sync with your personal Google Drive or stay completely offline.
- **Open-source transparency**: Audit the code yourself on GitHub.
- **No tracking**: No analytics, no user tracking, no data collection.

## 🎯 Perfect For

- **Privacy-conscious users** who want control over their 2FA data.
- **Multi-device users** who need access across different platforms.
- **Organizations** seeking an open-source 2FA solution.
- **Developers** who prefer auditable security software.
- **Anyone migrating** from Authy or other proprietary 2FA apps.

## 🔧 Technology Stack

- **Frontend**: Vue 3, Ionic Framework, TypeScript.
- **Build Tools**: Vite, Capacitor.
- **Security**: WebCrypto API, Argon2 password hashing.
- **Storage**: IndexedDB, Google Drive API (optional).
- **Deployment**: Progressive Web App (PWA).

## 📱 Installation Options

### Web Browser (Recommended)
Visit [my.otipi.app](https://my.otipi.app) and install as a PWA for the best experience.

### Self-Hosted
```bash
git clone https://github.com/digitalzen-app/otipi
cd otipi
npm install
npm run build
# Deploy the dist folder to your web server
```

### Development Setup
```bash
git clone https://github.com/digitalzen-app/otipi
cd otipi
npm install
npm run dev
```

## 🤝 Contributing

We're actively looking for maintainers and contributors! OTIPI is maintained by the developers of [DigitalZen.app](https://digitalzen.app) as a side project to help others and welcomes community involvement (but don’t forget to check the [disclaimer](#-disclaimer-with-a-smile)!).

### How to Contribute

1. **Fork the repository**.
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** (`git commit -m 'Add amazing feature'`).
4. **Push to the branch** (`git push origin feature/amazing-feature`).
5. **Open a Pull Request**.

### Areas We Need Help With

- 🔧 **Feature Development**: New functionality and improvements.
- 🐛 **Bug Fixes**: Identifying and resolving issues.
- 📚 **Documentation**: Improving guides and API docs.
- 🌐 **Translations**: Multi-language support.
- 🧪 **Testing**: Unit tests and end-to-end testing.
- 🎨 **UI/UX**: Design improvements and accessibility.
- 📱 **Mobile Apps**: Native iOS and Android development.
- 🔒 **Security Audits**: Code review and penetration testing.

## 📖 Documentation

- [User Guide](docs/user-guide.md).
- [API Documentation](docs/api.md).
- [Security Architecture](docs/security.md).
- [Self-Hosting Guide](docs/self-hosting.md).

## 🆚 Authy Alternative

Migrating from Authy? OTIPI offers:

- ✅ **No subscription fees**: Completely free and open-source.
- ✅ **Data ownership**: Your data stays with you.
- ✅ **No vendor lock-in**: Export your data anytime.
- ✅ **Cross-platform sync**: Works everywhere, not just mobile.
- ✅ **Enhanced privacy**: No tracking or data collection.
- ✅ **Transparent security**: Open-source code you can audit.

## 🏗️ Building for Production

### Web Build
```bash
npm run build
# Output in dist/ folder
```

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support & Community

- **Production App**: [OTIPI.app](https://my.otipi.app).
- **Issues**: [GitHub Issues](https://github.com/digitalzen-app/otipi/issues).
- **Discussions**: [GitHub Discussions](https://github.com/digitalzen-app/otipi/discussions).

## 🌟 Star History

If you find OTIPI useful, please consider giving it a star on GitHub to help others discover it!

---

**Made with ❤️ by the DigitalZen.app team and contributors**.

*OTIPI: Your keys, your control, your privacy.*

## 🔗 Development Resources

### Testing Tools
- [OTP Generator](https://it-tools.tech/otp-generator).
- [TOTP Test](https://totp.danhersam.com/).
- [OTP Test](https://otptest.de/).

### Brand Assets
- Logo colors: Red #FF2E63, Black #252A34.

### Calling for Community Involvement in Future Features:
- Separate the countdown timer to work independently for each OTP code.
- Add support for additional cloud providers to securely store the vault.
- Explore fingerprint-based unlocking without server-side storage using WebAuthn. (We attempted storing the password in the ID field, but it was deemed insecure. We couldn't find a solution that avoids server-side involvement, so we welcome advice and suggestions.)

---

### 🚨 Disclaimer (With a Smile!)

Hey there! While OTIPI is lovingly maintained by the DigitalZen.app team as a side project, we want to make it clear:

- **DigitalZen.app does not officially support or take responsibility for this project.**
- Any usage of OTIPI is entirely at your own risk (but we promise we’ve done our best to make it awesome!).
- **DigitalZen.app customer support will not respond to emails or provide assistance** related to OTIPI. Seriously, they’re busy with other stuff, and we don’t want to confuse them!

For any issues, questions, or feature requests, please check with the amazing OTIPI community. And hey, if you find something cool or spot a bug, **contribute**! We’d love to see what you come up with.

Remember: With great power (and OTPs) comes great responsibility. 😉

