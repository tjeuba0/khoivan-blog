---
title: 'Kotlin Coroutines & Flow - Xử lý bất đồng bộ như một Pro'
description: 'Deep dive vào Kotlin Coroutines và Flow, từ basic concepts đến advanced patterns trong Android development'
pubDate: 2024-01-20
author: 'Khoi Van'
category: 'article'
tags: ['kotlin', 'coroutines', 'flow', 'android', 'async', 'reactive']
featured: true
language: 'vi'
readingTime: '18 min read'
---

## Overview

Kotlin Coroutines và Flow đã trở thành standard để xử lý async operations trong Android. Bài viết này sẽ cover từ basics đến advanced patterns mà tôi đã áp dụng trong các dự án thực tế.

## Phần 1: Coroutines Fundamentals

### Coroutine Builders

```kotlin
class UserRepository {
    // launch - Fire and forget
    fun updateUserInBackground(user: User) {
        viewModelScope.launch {
            api.updateUser(user)
        }
    }

    // async - Return a value
    suspend fun fetchUserData(): User {
        return coroutineScope {
            val profile = async { api.getProfile() }
            val settings = async { api.getSettings() }

            User(
                profile = profile.await(),
                settings = settings.await()
            )
        }
    }
}
```

### Coroutine Context & Dispatchers

```kotlin
class DataProcessor {
    suspend fun processData(data: List<Data>) {
        withContext(Dispatchers.Default) {
            // CPU-intensive work
            data.map { transform(it) }
        }
    }

    suspend fun saveToFile(content: String) {
        withContext(Dispatchers.IO) {
            // I/O operations
            file.writeText(content)
        }
    }

    fun updateUI(result: String) {
        lifecycleScope.launch(Dispatchers.Main) {
            // UI updates
            textView.text = result
        }
    }
}
```

### Structured Concurrency

```kotlin
class OrderService {
    suspend fun processOrder(orderId: String) = coroutineScope {
        // All child coroutines must complete
        launch { validateOrder(orderId) }
        launch { checkInventory(orderId) }
        launch { processPayment(orderId) }

        // Parent waits for all children
    }

    suspend fun processOrderWithTimeout(orderId: String) {
        withTimeout(5000) {
            processOrder(orderId)
        }
    }
}
```

## Phần 2: Exception Handling

### Try-Catch vs CoroutineExceptionHandler

```kotlin
class ExceptionHandlingExample {
    private val exceptionHandler = CoroutineExceptionHandler { _, exception ->
        Log.e("Coroutine", "Caught $exception")
    }

    fun example1() {
        // Local exception handling
        viewModelScope.launch {
            try {
                riskyOperation()
            } catch (e: Exception) {
                handleError(e)
            }
        }
    }

    fun example2() {
        // Global exception handling
        viewModelScope.launch(exceptionHandler) {
            riskyOperation() // Exception will be caught by handler
        }
    }
}
```

### SupervisorScope

```kotlin
class ParallelTasksExample {
    suspend fun executeTasksIndependently() {
        supervisorScope {
            // One failure doesn't cancel others
            launch { task1() }
            launch { task2() }
            launch { task3() }
        }
    }
}
```

## Phần 3: Flow - Reactive Streams

### Creating Flows

```kotlin
class FlowExamples {
    // Simple flow
    fun numbersFlow() = flow {
        for (i in 1..5) {
            delay(1000)
            emit(i)
        }
    }

    // Flow from suspend function
    fun userFlow() = flow {
        emit(fetchUserFromNetwork())
    }

    // StateFlow for UI state
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    // SharedFlow for events
    private val _events = MutableSharedFlow<Event>()
    val events = _events.asSharedFlow()
}
```

### Flow Operators

```kotlin
class FlowOperators {
    fun demonstrateOperators() {
        flowOf(1, 2, 3, 4, 5)
            .filter { it % 2 == 0 }
            .map { it * it }
            .take(2)
            .collect { println(it) } // 4, 16
    }

    fun combineFlows() {
        val flow1 = flowOf(1, 2, 3)
        val flow2 = flowOf("A", "B", "C")

        flow1.zip(flow2) { num, letter ->
            "$num$letter"
        }.collect { println(it) } // 1A, 2B, 3C
    }
}
```

### Flow Context Preservation

```kotlin
class FlowContext {
    fun flowOnDifferentContext() {
        flow {
            // Runs on IO dispatcher
            emit(fetchDataFromNetwork())
        }
        .flowOn(Dispatchers.IO)
        .map {
            // Runs on Default dispatcher
            processData(it)
        }
        .flowOn(Dispatchers.Default)
        .collect {
            // Runs on Main dispatcher
            updateUI(it)
        }
    }
}
```

## Phần 4: Advanced Patterns

### Retry với Exponential Backoff

```kotlin
suspend fun <T> retryWithBackoff(
    times: Int = 3,
    initialDelay: Long = 100,
    factor: Double = 2.0,
    block: suspend () -> T
): T {
    var currentDelay = initialDelay
    repeat(times - 1) {
        try {
            return block()
        } catch (e: Exception) {
            delay(currentDelay)
            currentDelay = (currentDelay * factor).toLong()
        }
    }
    return block() // Last attempt
}
```

### Debounce Search

```kotlin
class SearchViewModel : ViewModel() {
    private val searchQuery = MutableStateFlow("")

    val searchResults = searchQuery
        .debounce(300)
        .filter { it.length >= 3 }
        .distinctUntilChanged()
        .flatMapLatest { query ->
            searchRepository.search(query)
        }
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            emptyList()
        )
}
```

### Channel for Actor Pattern

```kotlin
class CounterActor {
    private val channel = Channel<CounterMsg>()
    private var counter = 0

    sealed class CounterMsg {
        object Increment : CounterMsg()
        class GetValue(val response: CompletableDeferred<Int>) : CounterMsg()
    }

    fun start() = GlobalScope.launch {
        for (msg in channel) {
            when (msg) {
                is CounterMsg.Increment -> counter++
                is CounterMsg.GetValue -> msg.response.complete(counter)
            }
        }
    }

    suspend fun increment() {
        channel.send(CounterMsg.Increment)
    }

    suspend fun getValue(): Int {
        val response = CompletableDeferred<Int>()
        channel.send(CounterMsg.GetValue(response))
        return response.await()
    }
}
```

## Phần 5: Testing Coroutines

### Testing với runTest

```kotlin
class UserRepositoryTest {
    @Test
    fun `test user fetching`() = runTest {
        val repository = UserRepository(mockApi)

        val user = repository.getUser("123")

        assertEquals("John", user.name)
    }

    @Test
    fun `test flow emissions`() = runTest {
        val flow = repository.getUserFlow()

        val results = flow.take(3).toList()

        assertEquals(3, results.size)
    }
}
```

### TestDispatcher

```kotlin
class ViewModelTest {
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `test loading state`() = runTest {
        val viewModel = MyViewModel()

        viewModel.loadData()
        advanceUntilIdle()

        assertFalse(viewModel.isLoading.value)
    }
}
```

## Best Practices

### 1. Scope Management

```kotlin
class MyViewModel : ViewModel() {
    // Use viewModelScope for ViewModel
    fun loadData() {
        viewModelScope.launch {
            // Automatically cancelled when ViewModel is cleared
        }
    }
}

class MyFragment : Fragment() {
    // Use lifecycleScope for Fragment/Activity
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // Collect flows safely
                viewModel.uiState.collect { }
            }
        }
    }
}
```

### 2. Cancellation

```kotlin
class CancellationExample {
    suspend fun processLargeData(data: List<Data>) {
        coroutineScope {
            data.forEach { item ->
                // Check cancellation regularly
                ensureActive()
                processItem(item)
            }
        }
    }
}
```

### 3. Resource Management

```kotlin
class ResourceManager {
    suspend fun useResource() {
        val resource = acquireResource()
        try {
            coroutineScope {
                // Use resource
            }
        } finally {
            // Always release, even if cancelled
            resource.release()
        }
    }
}
```

## Performance Tips

1. **Use appropriate dispatchers** - Don't block Main thread
2. **Avoid GlobalScope** - Use structured concurrency
3. **Cancel unused coroutines** - Prevent memory leaks
4. **Use StateFlow for UI state** - Better than LiveData
5. **Buffer flows when needed** - Improve performance

## Kết luận

Kotlin Coroutines và Flow provide powerful tools cho async programming. Key takeaways:

- Master structured concurrency
- Understand dispatchers và contexts
- Use Flow cho reactive programming
- Always handle exceptions properly
- Test thoroughly với proper tools

Happy coding! 🚀
