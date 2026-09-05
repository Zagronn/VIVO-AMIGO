# VIVO AMIGO Mobile

Shared React Native architecture for the VIVOAMIGOPAY wallet, CARGO VIVO courier, and VIVO POS scanner apps.

## App targets

- `pay`: wallet balance, escrow hold/release, biometric unlock
- `cargo`: shipment creation, live tracking, proof-of-delivery QR scan
- `pos`: merchant catalog, QR checkout, offline-first sales, SAT FEL status

The `src` modules are platform-neutral boundaries. The production React Native host connects them to `@react-native-async-storage/async-storage`, `react-native-vision-camera`, and `react-native-biometrics`. API origins are centralized in `src/apps.js`; replace them with environment injection for staging and production builds.

## Platform shells

- `ios/README.md`: required Info.plist permissions and native build activation
- `android/README.md`: required Manifest permissions and native build activation

Run `npm run check` from this directory for the dependency-free architecture check. A full native build requires Xcode/ CocoaPods or Android Studio/Gradle and is intentionally not claimed by the root smoke suite when those SDKs are unavailable.
