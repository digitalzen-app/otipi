# Development Notes

## Logo Resources

Logo comes from here:
<!-- https://myfreelogomaker.com/brandkit/173670878/logo-files -->

https://app.logo.com/dashboard/your-logo-files

Brand colors:
- Red: #FF2E63
- Black: #252A34

## Testing Tools

- https://it-tools.tech/otp-generator
- https://totp.danhersam.com/
- https://otptest.de/

## TODO

Useful libraries to consider:
- https://github.com/SergioSuarezDev/Ionic-Biometric-Capacitor
- https://github.com/martinkasa/capacitor-secure-storage-plugin

## Android Build Release

```bash
cd android

./gradlew bundleRelease

# The output will be at:
cd app/build/outputs/bundle/release 

# Create self-signed key
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# Sign the bundle
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release.aab alias_name
```
