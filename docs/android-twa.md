# MiniPM Android TWA

This project wraps `https://www.minipm.top/app/today` as an Android Trusted Web Activity.

## Output

The installable release APK is generated at:

```text
artifacts/android/MiniPM-1.0.0-release.apk
```

The Android project lives in:

```text
android-twa/
```

## Signing Key

The release signing key is local-only and ignored by Git:

```text
android-twa/minipm-release.keystore
android-twa/KEYSTORE_INFO_LOCAL.txt
```

Keep both files backed up privately. Future APK updates must use the same keystore and alias.

## Domain Verification

The APK is linked to the website through:

```text
public/.well-known/assetlinks.json
```

After deploying the website, verify this URL is reachable:

```text
https://www.minipm.top/.well-known/assetlinks.json
```

## Rebuild

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build_android_twa.ps1
```

Most MiniPM UI/content updates only require deploying the website. Rebuild the APK when changing the package id, Android icon, signing setup, native permissions, or TWA shell settings.
