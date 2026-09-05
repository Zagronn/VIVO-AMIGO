# Android shell activation

The Gradle shell in this directory targets `com.vivoamigo.app`; link the React Native host plus `react-native-vision-camera` and `react-native-biometrics` before release.

Required Android permissions:

- `android.permission.CAMERA`
- `android.permission.USE_BIOMETRIC`

Configure `signingConfigs.release` from CI secrets, then run `./gradlew :app:bundleRelease` for an AAB or `./gradlew :app:assembleRelease` for an APK. Verify QR scanning and biometrics on physical hardware before publishing.
