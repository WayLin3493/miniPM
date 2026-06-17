$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$twaDir = Join-Path $repoRoot "android-twa"
$keyInfoPath = Join-Path $twaDir "KEYSTORE_INFO_LOCAL.txt"
$manifestPath = Join-Path $twaDir "twa-manifest.json"
$jdkPath = Join-Path $env:USERPROFILE ".bubblewrap\tools\jdk17\jdk-17.0.19+10"
$sdkPath = Join-Path $env:USERPROFILE ".bubblewrap\tools\android-sdk"

if (!(Test-Path $keyInfoPath)) {
  throw "Missing $keyInfoPath. Keep the original signing key info file to rebuild release APKs."
}

if (!(Test-Path $manifestPath)) {
  throw "Missing $manifestPath."
}

if (!(Test-Path (Join-Path $jdkPath "bin\java.exe"))) {
  throw "Missing JDK 17 at $jdkPath."
}

if (!(Test-Path (Join-Path $sdkPath "platform-tools"))) {
  throw "Missing Android SDK at $sdkPath."
}

$env:JAVA_HOME = $jdkPath
$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath
$env:PATH = "$jdkPath\bin;$sdkPath\bin;$sdkPath\cmdline-tools\latest\bin;$sdkPath\platform-tools;$env:PATH"

$keyInfo = Get-Content $keyInfoPath -Raw
$password = [regex]::Match($keyInfo, "Keystore password: (.+)").Groups[1].Value.Trim()
if (!$password) {
  throw "Cannot read keystore password from $keyInfoPath."
}

$env:BUBBLEWRAP_KEYSTORE_PASSWORD = $password
$env:BUBBLEWRAP_KEY_PASSWORD = $password

Push-Location $twaDir
try {
  cmd /c "npx --registry=https://registry.npmjs.org @bubblewrap/cli update --manifest=twa-manifest.json --skipVersionUpgrade"
  cmd /c "npx --registry=https://registry.npmjs.org @bubblewrap/cli build --manifest=twa-manifest.json --skipPwaValidation"
}
finally {
  Pop-Location
}

$artifactsDir = Join-Path $repoRoot "artifacts\android"
New-Item -ItemType Directory -Force -Path $artifactsDir | Out-Null

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.appVersion
$outputApk = Join-Path $artifactsDir "MiniPM-$version-release.apk"
Copy-Item -LiteralPath (Join-Path $twaDir "app-release-signed.apk") -Destination $outputApk -Force

Write-Host "Built APK: $outputApk"
