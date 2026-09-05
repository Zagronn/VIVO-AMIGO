# iOS shell activation

Create the React Native iOS host with the standard Community CLI, then link `react-native-vision-camera` and `react-native-biometrics`.

Required Info.plist permissions:

- `NSCameraUsageDescription`: Scan VIVO payment and delivery QR codes.
- `NSFaceIDUsageDescription`: Unlock protected VIVO account actions.

Run `pod install` in `ios/`, then build the `VivoAmigo` scheme in Xcode with Release signing configured.
