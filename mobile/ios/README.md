# iOS shell activation

Generate the Xcode shell with `xcodegen generate --spec project.yml`, then link the React Native host plus `react-native-vision-camera` and `react-native-biometrics`.

Required Info.plist permissions:

- `NSCameraUsageDescription`: Scan VIVO payment and delivery QR codes.
- `NSFaceIDUsageDescription`: Unlock protected VIVO account actions.

Run `pod install` in the generated project, archive the `VivoAmigo` scheme in Xcode, and export an App Store IPA with `ExportOptions.plist` after configuring the `com.vivoamigo.app` Team/signing profile.
