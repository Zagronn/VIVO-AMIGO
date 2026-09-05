# Android shell activation

The Gradle shell in this directory targets `com.vivoamigo.app`; link the React Native host plus `react-native-vision-camera` and `react-native-biometrics` before release.

The production PWA is synchronized into `app/src/main/assets/public/` for the Android web shell, including the service worker, manifest, VA mark, styles, app code, and local QR renderer.

Required Android permissions:

- `android.permission.CAMERA`
- `android.permission.USE_BIOMETRIC`

Configure `signingConfigs.release` from CI secrets, then run `./gradlew :app:bundleRelease` for an AAB or `./gradlew :app:assembleRelease` for an APK. Verify QR scanning and biometrics on physical hardware before publishing.
