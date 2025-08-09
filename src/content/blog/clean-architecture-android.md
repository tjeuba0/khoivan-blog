---
title: 'Clean Architecture trong Android - Hướng dẫn từ A-Z'
description: 'Tìm hiểu cách apply Clean Architecture vào dự án Android thực tế với Kotlin, MVVM và Jetpack Compose'
pubDate: 2024-01-10
author: 'Khoi Van'
# heroImage: '/blog-placeholder-1.jpg'
# heroImageAlt: 'Clean Architecture diagram for Android'
category: 'engineering'
tags: ['android', 'clean-architecture', 'kotlin', 'mvvm', 'jetpack-compose']
featured: true
language: 'vi'
readingTime: '15 min read'
---

## Giới thiệu

Clean Architecture là một pattern được Uncle Bob (Robert C. Martin) giới thiệu,
giúp tạo ra code base dễ maintain, test và scale. Trong bài viết này, tôi sẽ
chia sẻ cách apply Clean Architecture vào dự án Android.

## Tại sao cần Clean Architecture?

Sau 8 năm làm Android, tôi nhận thấy nhiều dự án gặp vấn đề:

- Code khó maintain khi app lớn dần
- Khó viết unit test
- Business logic bị trộn lẫn với UI
- Khó thay đổi hoặc thêm features mới

Clean Architecture giải quyết tất cả vấn đề trên!

## Các tầng trong Clean Architecture

### 1. Domain Layer (Core Business)

```kotlin
// UseCase example
class GetUserUseCase(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(userId: String): User {
        return userRepository.getUser(userId)
    }
}
```
