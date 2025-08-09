---
title: 'Jetpack Compose Best Practices - Từ cơ bản đến nâng cao'
description: 'Tổng hợp các best practices khi làm việc với Jetpack Compose, từ performance optimization đến state management'
pubDate: 2024-01-15
author: 'Khoi Van'
category: 'tutorial'
tags: ['jetpack-compose', 'android', 'kotlin', 'ui', 'performance']
featured: false
language: 'vi'
readingTime: '12 min read'
---

## Giới thiệu

Jetpack Compose đã thay đổi hoàn toàn cách chúng ta xây dựng UI trong Android. Sau 2 năm làm việc với Compose trong production, tôi muốn chia sẻ những best practices giúp code của bạn clean, performant và maintainable.

## 1. State Management

### Remember vs RememberSaveable

```kotlin
@Composable
fun CounterScreen() {
    // Sẽ bị reset khi configuration change
    var count by remember { mutableStateOf(0) }

    // Được preserve qua configuration changes
    var savedCount by rememberSaveable { mutableStateOf(0) }
}
```

### State Hoisting

Luôn hoist state lên component cha khi cần share giữa nhiều composables:

```kotlin
@Composable
fun TodoScreen() {
    var todos by remember { mutableStateOf(listOf<Todo>()) }

    TodoList(
        todos = todos,
        onTodoClick = { todo ->
            // Handle click
        }
    )
}

@Composable
fun TodoList(
    todos: List<Todo>,
    onTodoClick: (Todo) -> Unit
) {
    // Stateless composable
}
```

## 2. Performance Optimization

### Stable Types

Đánh dấu data classes với `@Stable` hoặc `@Immutable`:

```kotlin
@Stable
data class User(
    val id: String,
    val name: String,
    val avatar: String
)
```

### Remember Lambda

Tránh tạo lambda mới trong mỗi recomposition:

```kotlin
@Composable
fun UserItem(user: User, onClick: () -> Unit) {
    // ❌ Bad - tạo lambda mới mỗi lần
    Button(onClick = { onClick() }) {
        Text(user.name)
    }

    // ✅ Good - pass trực tiếp
    Button(onClick = onClick) {
        Text(user.name)
    }
}
```

### LazyColumn Keys

Luôn provide stable keys cho LazyColumn items:

```kotlin
LazyColumn {
    items(
        items = users,
        key = { user -> user.id } // Stable key
    ) { user ->
        UserItem(user)
    }
}
```

## 3. Side Effects

### LaunchedEffect vs SideEffect vs DisposableEffect

```kotlin
@Composable
fun LocationScreen(locationService: LocationService) {
    // Run once when key changes
    LaunchedEffect(locationService) {
        locationService.startTracking()
    }

    // Run on every recomposition
    SideEffect {
        analytics.logScreenView("location")
    }

    // With cleanup
    DisposableEffect(locationService) {
        val listener = locationService.addListener { }
        onDispose {
            locationService.removeListener(listener)
        }
    }
}
```

## 4. Modifiers Best Practices

### Order Matters

```kotlin
@Composable
fun ClickableCard() {
    Box(
        modifier = Modifier
            .padding(16.dp)      // Padding trước
            .clickable { }       // Clickable sau
            .background(Color.Blue)
    )
}
```

### Reuse Modifiers

```kotlin
@Composable
fun MyScreen() {
    val commonModifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp)

    Column {
        Text("Title", modifier = commonModifier)
        Text("Subtitle", modifier = commonModifier)
    }
}
```

## 5. Preview Best Practices

### Multiple Previews

```kotlin
@Preview(name = "Light Mode")
@Preview(name = "Dark Mode", uiMode = UI_MODE_NIGHT_YES)
@Preview(name = "Large Font", fontScale = 1.5f)
@Composable
fun UserCardPreview() {
    MyTheme {
        UserCard(
            user = User(
                id = "1",
                name = "John Doe",
                avatar = "https://example.com/avatar.jpg"
            )
        )
    }
}
```

## 6. Navigation

### Type-safe Navigation

```kotlin
@Serializable
data class ProfileRoute(val userId: String)

@Composable
fun NavigationGraph(navController: NavHostController) {
    NavHost(navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onProfileClick = { userId ->
                    navController.navigate(ProfileRoute(userId))
                }
            )
        }

        composable<ProfileRoute> { backStackEntry ->
            val route = backStackEntry.toRoute<ProfileRoute>()
            ProfileScreen(userId = route.userId)
        }
    }
}
```

## 7. Testing

### UI Testing

```kotlin
@Test
fun userCard_displaysCorrectInfo() {
    composeTestRule.setContent {
        UserCard(testUser)
    }

    composeTestRule
        .onNodeWithText(testUser.name)
        .assertIsDisplayed()

    composeTestRule
        .onNodeWithContentDescription("User avatar")
        .assertExists()
}
```

## 8. Common Pitfalls to Avoid

### 1. Using MutableState directly in ViewModel

```kotlin
// ❌ Bad
class MyViewModel : ViewModel() {
    val state = mutableStateOf(UiState())
}

// ✅ Good
class MyViewModel : ViewModel() {
    private val _state = MutableStateFlow(UiState())
    val state = _state.asStateFlow()
}
```

### 2. Not using derivedStateOf

```kotlin
@Composable
fun SearchScreen(items: List<Item>) {
    var query by remember { mutableStateOf("") }

    // ❌ Bad - recalculates on every recomposition
    val filtered = items.filter { it.name.contains(query) }

    // ✅ Good - only recalculates when dependencies change
    val filtered by remember(items, query) {
        derivedStateOf {
            items.filter { it.name.contains(query) }
        }
    }
}
```

## Kết luận

Jetpack Compose là một công cụ mạnh mẽ, nhưng để sử dụng hiệu quả cần hiểu rõ các best practices. Hy vọng những tips này giúp bạn viết Compose code tốt hơn!

Có câu hỏi? Comment bên dưới hoặc connect với mình qua [LinkedIn](https://linkedin.com/in/khoivan)!
