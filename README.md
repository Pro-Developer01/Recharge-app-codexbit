# UPI Payment Demo - React Native Expo

Minimal React Native Expo app demonstrating UPI deep-link payments on Android.

## Setup

```bash
npm install
npm run android
```

## Test Deep Link
```bash
adb shell am start -W -a android.intent.action.VIEW -d "upipaymentdemo://payment?status=success&txnId=TEST123&responseCode=00"
```

## Notes
- Android only (UPI not available on iOS)
- Use development build, not Expo Go for full functionality
- Most UPI apps don't auto-return - manually switch back
- Demo only - use test UPI IDs
