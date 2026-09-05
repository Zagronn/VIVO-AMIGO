# VIVO AMIGO Mobile

Shared React Native architecture for the VIVOAMIGOPAY wallet, CARGO VIVO courier, and VIVO POS scanner apps.

## App targets

- `pay`: wallet balance, escrow hold/release, biometric unlock
- `cargo`: shipment creation, live tracking, proof-of-delivery QR scan
- `pos`: merchant catalog, QR checkout, offline-first sales, SAT FEL status

The `src` modules are platform-neutral boundaries. The production React Native host connects them to `@react-native-async-storage/async-storage`, `react-native-vision-camera`, and `react-native-biometrics`. API origins are centralized in `src/apps.js`; replace them with environment injection for staging and production builds.

## Platform shells

- `ios/project.yml`: XcodeGen shell for the `com.vivoamigo.app` App Store target
- `ios/ExportOptions.plist`: App Store export profile
- `android/`: Gradle release shell for the `com.vivoamigo.app` APK/AAB target
- `ios/README.md`: required signing, Info.plist permissions, and native build activation
- `android/README.md`: required signing, Manifest permissions, and native build activation

Run `npm run check`, `npm run check:host`, and `npm run check:native` from this directory for dependency-free architecture and shell checks. Generate the iOS project with `xcodegen generate --spec ios/project.yml`, then archive/export with Xcode and `ios/ExportOptions.plist`. Build Android with `./gradlew :app:bundleRelease` or `./gradlew :app:assembleRelease` after adding a signing keystore. A signed IPA/AAB requires Apple and Android signing credentials and is intentionally not claimed when those tools or credentials are unavailable.
