---
title: 'Android Security Best Practices cho Banking Apps'
description: 'Hướng dẫn chi tiết về security trong Android apps, đặc biệt cho Banking và Fintech applications'
pubDate: 2024-01-25
author: 'Khoi Van'
category: 'engineering'
tags: ['android', 'security', 'banking', 'encryption', 'biometric', 'fintech']
featured: false
language: 'vi'
readingTime: '15 min read'
---

## Introduction

Sau 4 năm làm việc với banking apps tại VietinBank, tôi đã học được rất nhiều về mobile security. Banking apps là target của hackers, nên security phải là top priority. Bài viết này tổng hợp các best practices tôi đã áp dụng.

## 1. Data Encryption

### Encrypt Sensitive Data

```kotlin
class EncryptionManager {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        encryptedPrefs.edit()
            .putString("auth_token", token)
            .apply()
    }
}
```

### Database Encryption với SQLCipher

```kotlin
class SecureDatabase {
    fun getDatabase(context: Context): SupportSQLiteOpenHelper {
        val passphrase = SQLCipherUtils.getPassphrase()
        val factory = SupportFactory(passphrase)

        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "secure_db"
        )
        .openHelperFactory(factory)
        .build()
    }
}
```

## 2. Network Security

### Certificate Pinning

```kotlin
class NetworkModule {
    fun provideOkHttpClient(): OkHttpClient {
        val certificatePinner = CertificatePinner.Builder()
            .add(
                "api.mybank.com",
                "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
            )
            .build()

        return OkHttpClient.Builder()
            .certificatePinner(certificatePinner)
            .build()
    }
}
```

### Network Security Config

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">mybank.com</domain>
        <pin-set expiration="2025-01-01">
            <pin digest="SHA-256">base64hash=</pin>
            <pin digest="SHA-256">base64backup=</pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

## 3. Authentication & Biometrics

### Biometric Authentication

```kotlin
class BiometricManager(private val context: Context) {
    private val executor = ContextCompat.getMainExecutor(context)
    private val biometricPrompt = BiometricPrompt(
        context as FragmentActivity,
        executor,
        authenticationCallback
    )

    fun authenticate() {
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Xác thực sinh trắc học")
            .setSubtitle("Sử dụng vân tay hoặc Face ID")
            .setNegativeButtonText("Hủy")
            .setAllowedAuthenticators(
                BiometricManager.Authenticators.BIOMETRIC_STRONG
            )
            .build()

        biometricPrompt.authenticate(promptInfo)
    }

    private val authenticationCallback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            // Handle success
            val cipher = result.cryptoObject?.cipher
            // Use cipher to decrypt sensitive data
        }
    }
}
```

### Cryptographic Operations với Biometric

```kotlin
class CryptoManager {
    private val keyAlias = "BiometricKeyAlias"

    fun generateSecretKey() {
        val keyGenParameterSpec = KeyGenParameterSpec.Builder(
            keyAlias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
        .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
        .setUserAuthenticationRequired(true)
        .setUserAuthenticationParameters(
            30, // Timeout in seconds
            KeyProperties.AUTH_BIOMETRIC_STRONG
        )
        .build()

        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )
        keyGenerator.init(keyGenParameterSpec)
        keyGenerator.generateKey()
    }
}
```

## 4. Code Obfuscation & Protection

### ProGuard/R8 Configuration

```proguard
# Obfuscate code
-obfuscationdictionary proguard-dict.txt
-classobfuscationdictionary proguard-dict.txt
-packageobfuscationdictionary proguard-dict.txt

# Keep security-critical classes
-keep class com.mybank.security.** { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
```

### Anti-Tampering

```kotlin
class IntegrityChecker {
    fun verifyAppSignature(context: Context): Boolean {
        val packageInfo = context.packageManager
            .getPackageInfo(context.packageName, PackageManager.GET_SIGNATURES)

        val signatures = packageInfo.signatures
        val expectedSignature = "YOUR_RELEASE_SIGNATURE_HASH"

        for (signature in signatures) {
            val hash = MessageDigest.getInstance("SHA-256")
                .digest(signature.toByteArray())
                .toHexString()

            if (hash == expectedSignature) {
                return true
            }
        }
        return false
    }

    fun detectRootedDevice(): Boolean {
        val rootIndicators = listOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su"
        )

        return rootIndicators.any { File(it).exists() }
    }
}
```

## 5. Secure Communication

### End-to-End Encryption

```kotlin
class E2EEncryption {
    fun encryptMessage(message: String, publicKey: PublicKey): String {
        val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
        cipher.init(Cipher.ENCRYPT_MODE, publicKey)

        val encrypted = cipher.doFinal(message.toByteArray())
        return Base64.encodeToString(encrypted, Base64.DEFAULT)
    }

    fun decryptMessage(encrypted: String, privateKey: PrivateKey): String {
        val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
        cipher.init(Cipher.DECRYPT_MODE, privateKey)

        val decoded = Base64.decode(encrypted, Base64.DEFAULT)
        val decrypted = cipher.doFinal(decoded)
        return String(decrypted)
    }
}
```

## 6. Session Management

### Secure Session Handling

```kotlin
class SessionManager {
    private var sessionTimeout = 5 * 60 * 1000L // 5 minutes
    private var lastActivityTime = System.currentTimeMillis()

    fun checkSession(): Boolean {
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastActivityTime > sessionTimeout) {
            logout()
            return false
        }
        updateActivityTime()
        return true
    }

    fun updateActivityTime() {
        lastActivityTime = System.currentTimeMillis()
    }

    fun logout() {
        // Clear all sensitive data
        clearTokens()
        clearCache()
        navigateToLogin()
    }
}
```

## 7. Input Validation

### Prevent SQL Injection

```kotlin
class UserRepository {
    // ❌ Bad - Vulnerable to SQL injection
    fun getUserBad(username: String): User? {
        val query = "SELECT * FROM users WHERE username = '$username'"
        return database.rawQuery(query, null)
    }

    // ✅ Good - Parameterized query
    fun getUserGood(username: String): User? {
        val query = "SELECT * FROM users WHERE username = ?"
        return database.rawQuery(query, arrayOf(username))
    }
}
```

### Input Sanitization

```kotlin
class InputValidator {
    fun validateEmail(email: String): Boolean {
        val pattern = Patterns.EMAIL_ADDRESS
        return pattern.matcher(email).matches()
    }

    fun sanitizeInput(input: String): String {
        return input
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;")
    }
}
```

## 8. Logging & Error Handling

### Secure Logging

```kotlin
class SecureLogger {
    fun log(message: String) {
        if (BuildConfig.DEBUG) {
            Log.d(TAG, sanitizeLog(message))
        }
    }

    private fun sanitizeLog(message: String): String {
        // Remove sensitive data patterns
        return message
            .replace(Regex("\\b\\d{16}\\b"), "****") // Credit card
            .replace(Regex("\\b\\d{9,10}\\b"), "****") // Phone number
            .replace(Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"), "****@****")
    }
}
```

## 9. WebView Security

```kotlin
class SecureWebView {
    fun configureWebView(webView: WebView) {
        webView.settings.apply {
            javaScriptEnabled = false // Enable only if needed
            allowFileAccess = false
            allowContentAccess = false
            savePassword = false
            saveFormData = false
        }

        // Validate URLs before loading
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                return if (isUrlSafe(url)) {
                    false // Load the URL
                } else {
                    true // Block the URL
                }
            }
        }
    }
}
```

## 10. Security Checklist

### Pre-release Security Audit

- [ ] All sensitive data encrypted
- [ ] Certificate pinning implemented
- [ ] ProGuard/R8 enabled
- [ ] No hardcoded secrets
- [ ] Root detection active
- [ ] Anti-tampering measures
- [ ] Secure session management
- [ ] Input validation on all forms
- [ ] No sensitive data in logs
- [ ] WebView properly configured
- [ ] Biometric authentication for sensitive operations
- [ ] Network security config properly set

## Tools for Security Testing

1. **MobSF** - Mobile Security Framework
2. **QARK** - Quick Android Review Kit
3. **Drozer** - Security testing framework
4. **Android Studio Lint** - Built-in security checks
5. **Frida** - Dynamic instrumentation

## Conclusion

Security trong banking apps không phải optional - it's mandatory. Implement càng nhiều layers càng tốt (defense in depth). Remember: security is not a feature, it's a process.

Stay secure! 🔐
