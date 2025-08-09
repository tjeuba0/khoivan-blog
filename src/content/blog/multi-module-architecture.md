---
title: 'Multi-Module Architecture trong Android - Scale your app đúng cách'
description: 'Hướng dẫn xây dựng Multi-Module Architecture cho Android apps, từ setup đến best practices'
pubDate: 2024-01-30
author: 'Khoi Van'
category: 'case-study'
tags: ['android', 'architecture', 'multi-module', 'gradle', 'kotlin', 'scalability']
featured: false
language: 'vi'
readingTime: '20 min read'
---

## Why Multi-Module?

Khi app của VietinBank iPay grow từ 50K lines of code lên 500K+, chúng tôi faced với nhiều problems:

- Build time 15+ minutes
- Merge conflicts liên tục
- Khó test và maintain
- Team members step on each other's toes

Multi-module architecture đã giải quyết tất cả những vấn đề này. Let me show you how.

## Module Structure

### Our Module Hierarchy

```
app/
├── app/                     # Main application module
├── core/
│   ├── core-common/        # Common utilities
│   ├── core-ui/           # UI components & themes
│   ├── core-network/      # Network layer
│   └── core-database/     # Database layer
├── features/
│   ├── feature-login/     # Login feature
│   ├── feature-transfer/  # Transfer feature
│   ├── feature-payment/   # Payment feature
│   └── feature-cards/     # Cards management
├── libraries/
│   ├── lib-security/     # Security utilities
│   └── lib-analytics/    # Analytics wrapper
└── buildSrc/             # Build logic
```

## Setting Up Modules

### 1. Create Feature Module

```kotlin
// feature-login/build.gradle.kts
plugins {
    id("com.android.library")
    id("kotlin-android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
}

android {
    namespace = "com.mybank.feature.login"
    compileSdk = Config.compileSdk

    defaultConfig {
        minSdk = Config.minSdk
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    implementation(project(":core:core-common"))
    implementation(project(":core:core-ui"))
    implementation(project(":core:core-network"))

    // Feature dependencies
    implementation(Deps.Compose.ui)
    implementation(Deps.Hilt.android)
    kapt(Deps.Hilt.compiler)

    // Testing
    testImplementation(Deps.Test.junit)
    androidTestImplementation(Deps.Test.compose)
}
```

### 2. Module Communication

#### Using Interfaces

```kotlin
// core-common/src/main/java/com/mybank/core/navigation/Navigator.kt
interface Navigator {
    fun navigateToLogin()
    fun navigateToHome()
    fun navigateToTransfer(accountId: String)
}

// app/src/main/java/com/mybank/navigation/NavigatorImpl.kt
@Singleton
class NavigatorImpl @Inject constructor(
    private val navController: NavController
) : Navigator {
    override fun navigateToLogin() {
        navController.navigate("login")
    }

    override fun navigateToHome() {
        navController.navigate("home") {
            popUpTo("login") { inclusive = true }
        }
    }
}
```

## Dependency Injection với Hilt

### Module Setup

```kotlin
// feature-login/src/main/java/com/mybank/feature/login/di/LoginModule.kt
@Module
@InstallIn(ViewModelComponent::class)
object LoginModule {

    @Provides
    fun provideLoginUseCase(
        repository: AuthRepository
    ): LoginUseCase {
        return LoginUseCase(repository)
    }
}

// Core module provides shared dependencies
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }
}
```

## Feature Module Structure

### Clean Architecture in Each Module

```
feature-transfer/
├── src/main/java/com/mybank/feature/transfer/
│   ├── data/
│   │   ├── repository/
│   │   └── datasource/
│   ├── domain/
│   │   ├── model/
│   │   ├── usecase/
│   │   └── repository/
│   ├── presentation/
│   │   ├── screen/
│   │   ├── viewmodel/
│   │   └── components/
│   └── di/
│       └── TransferModule.kt
```

### Example Feature Implementation

```kotlin
// Domain Layer
data class TransferRequest(
    val fromAccount: String,
    val toAccount: String,
    val amount: BigDecimal,
    val note: String? = null
)

interface TransferRepository {
    suspend fun transfer(request: TransferRequest): Result<TransferResponse>
    suspend fun getAccounts(): Result<List<Account>>
}

class TransferUseCase @Inject constructor(
    private val repository: TransferRepository
) {
    suspend operator fun invoke(request: TransferRequest): Result<TransferResponse> {
        // Business logic validation
        if (request.amount <= BigDecimal.ZERO) {
            return Result.failure(InvalidAmountException())
        }
        return repository.transfer(request)
    }
}

// Presentation Layer
@HiltViewModel
class TransferViewModel @Inject constructor(
    private val transferUseCase: TransferUseCase,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransferUiState())
    val uiState = _uiState.asStateFlow()

    fun transfer(request: TransferRequest) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            transferUseCase(request)
                .onSuccess { response ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            isSuccess = true,
                            transactionId = response.transactionId
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                }
        }
    }
}
```

## Build Configuration

### Version Catalog (libs.versions.toml)

```toml
[versions]
compose = "1.5.4"
hilt = "2.48"
retrofit = "2.9.0"
room = "2.6.0"

[libraries]
compose-ui = { module = "androidx.compose.ui:ui", version.ref = "compose" }
hilt-android = { module = "com.google.dagger:hilt-android", version.ref = "hilt" }
retrofit = { module = "com.squareup.retrofit2:retrofit", version.ref = "retrofit" }
room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }

[bundles]
compose = ["compose-ui", "compose-material3", "compose-tooling"]
```

### BuildSrc for Shared Configuration

```kotlin
// buildSrc/src/main/kotlin/Config.kt
object Config {
    const val compileSdk = 34
    const val minSdk = 24
    const val targetSdk = 34
    const val versionCode = 1
    const val versionName = "1.0.0"
}

// buildSrc/src/main/kotlin/android-library.gradle.kts
plugins {
    id("com.android.library")
    id("kotlin-android")
}

android {
    compileSdk = Config.compileSdk

    defaultConfig {
        minSdk = Config.minSdk
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

## Testing Strategy

### Module Testing

```kotlin
// feature-transfer/src/test/java/TransferUseCaseTest.kt
class TransferUseCaseTest {

    @Mock
    private lateinit var repository: TransferRepository

    private lateinit var useCase: TransferUseCase

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        useCase = TransferUseCase(repository)
    }

    @Test
    fun `transfer with zero amount should return error`() = runTest {
        val request = TransferRequest(
            fromAccount = "123",
            toAccount = "456",
            amount = BigDecimal.ZERO
        )

        val result = useCase(request)

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull() is InvalidAmountException)
    }
}
```

## Benefits We Achieved

### 1. Build Time Improvement

```
Before: 15+ minutes full build
After:  2-3 minutes (only changed modules)
        30 seconds (single feature module)
```

### 2. Team Productivity

- Parallel development on different features
- Less merge conflicts
- Clear code ownership
- Easier onboarding

### 3. Better Testing

- Isolated unit tests per module
- Faster test execution
- Better test coverage

### 4. Reusability

```kotlin
// Share UI components across features
// core-ui/src/main/java/com/mybank/core/ui/components/
@Composable
fun BankButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = BankTheme.colors.primary
        )
    ) {
        Text(text)
    }
}
```

## Common Pitfalls & Solutions

### 1. Circular Dependencies

```kotlin
// ❌ Bad - Circular dependency
// feature-a depends on feature-b
// feature-b depends on feature-a

// ✅ Good - Use abstraction
// Both features depend on core-common interface
interface FeatureNavigator {
    fun navigateToFeatureA()
    fun navigateToFeatureB()
}
```

### 2. Module Granularity

```kotlin
// ❌ Too fine-grained
:feature-login-ui
:feature-login-domain
:feature-login-data

// ✅ Better - Feature contains all layers
:feature-login (contains ui, domain, data)
```

### 3. Resource Conflicts

```xml
<!-- ❌ Bad - Generic names cause conflicts -->
<string name="title">Title</string>

<!-- ✅ Good - Prefixed names -->
<string name="transfer_title">Transfer Money</string>
```

## Migration Strategy

### Phase 1: Extract Core Modules

1. Create core-common, core-ui, core-network
2. Move shared code
3. Update dependencies

### Phase 2: Feature by Feature

1. Identify feature boundaries
2. Create feature module
3. Move code incrementally
4. Update navigation

### Phase 3: Optimize

1. Analyze build performance
2. Optimize module dependencies
3. Enable parallel builds

## Performance Metrics

```kotlin
// Enable build performance tracking
// gradle.properties
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configureondemand=true

// Track build times
./gradlew build --profile
```

## Conclusion

Multi-module architecture transformed our development process:

- **80% faster** incremental builds
- **50% reduction** in merge conflicts
- **Better** code quality and maintainability
- **Happier** development team

Start small, extract gradually, and enjoy the benefits! 🚀

Questions? Reach out on [LinkedIn](https://linkedin.com/in/khoivan) or comment below!
