---
title: 'Cà phê sữa đá, mì gói, và production bug lúc 2 giờ sáng'
description: 'Câu chuyện về một đêm debug production của banking app, và những bài học không có trong sách vở'
pubDate: 'Feb 01 2024'
author: 'Khoi Van'
category: 'life'
tags: ['debugging', 'production', 'life', 'vietnam', 'banking']
featured: true
language: 'vi'
mood: 'personal'
---

## 2:14 AM - Điện thoại rung

Đang say giấc thì điện thoại rung liên tục. Mở mắt nhìn màn hình: 5 missed calls từ DevOps team.

"Production down rồi anh ơi. App banking crash khi user login."

Thế là leo dậy, pha ly cà phê sữa đá (lúc này quán cà phê nào mở đâu), bật laptop lên. Ngoài cửa sổ, Sài Gòn im lặng hiếm hoi. Chỉ có tiếng xe máy thỉnh thoảng lướt qua.

## 2:45 AM - The Hunt Begins

```kotlin
// Logcat shows this beauty
Fatal Exception: java.lang.NullPointerException
at com.vietinbank.auth.LoginViewModel.kt:156
```

Line 156? Cái line mà tôi commit 3 tháng trước, chạy ngon lành qua 2 môi trường test, 1 môi trường staging, và production gần 100 ngày?

Mở Slack, thấy message từ Product Manager: "5 triệu users không login được. Fix ASAP."

No pressure. 😅

## 3:30 AM - Mì gói và Revelation

Vừa húp mì tôm vừa đọc code. Và rồi tôi thấy nó...

```kotlin
// Someone changed this in another module
companion object {
    // Moved from const val to lazy initialization 
    val TOKEN_EXPIRY = lazy { 
        RemoteConfig.getLong("token_expiry") 
    }
}
```

Ai đó đã thay đổi cách load config, từ const sang lazy. Và RemoteConfig chưa kịp initialize khi LoginViewModel gọi đến.

**Race condition.** Cái thứ chỉ xuất hiện khi có 5 triệu users đồng loạt mở app sau khi Firebase Remote Config update.

## 4:00 AM - The Fix

```kotlin
// Quick fix for production
val tokenExpiry = try {
    TOKEN_EXPIRY.value
} catch (e: Exception) {
    DEFAULT_TOKEN_EXPIRY // Fallback value
}
```

Deploy hotfix. Test nhanh. Push to production.

## 4:30 AM - Sài Gòn thức dậy

App hoạt động trở lại. Slack im lặng. Nhìn ra cửa sổ, trời đã hửng sáng. Xe máy bắt đầu đông. Tiếng còi xe, tiếng rao bán bánh mì.

Xuống nhà, mua ly cà phê sữa đá thật từ cô Năm góc đường. Ngồi vỉa hè, nhìn thành phố thức giấc, nghĩ về đêm vừa qua.

## Lessons Learned (không có trong Clean Architecture)

1. **Production luôn khác local** - Dù test kỹ đến đâu, production vẫn có cách surprise bạn.

2. **Race conditions are evil** - Chúng ẩn náu, chờ đúng lúc để phá hoại. Như con muỗi trong phòng ngủ vậy.

3. **Defensive programming is not paranoid** - Fallback values đã cứu rỗi 5 triệu users đêm nay.

4. **Cà phê sữa đá lúc 4:30 AM hits different** - Ngọt ngào hơn, đậm đà hơn, có vị của victory.

5. **Banking apps = High stakes** - Khi bạn handle tiền của người khác, mỗi bug là một responsibility nặng nề.

## The Morning After

9:00 AM - Team meeting.

"Good job fixing it quickly!" - Manager nói.

Nhưng tôi biết, đêm nay về nhà phải refactor cái module config. Phải viết thêm test cho race conditions. Phải document lại cho team.

Và phải mua thêm mì gói dự trữ. Just in case. 🍜

---

*P/S: Đây là lý do tại sao tôi luôn có 1 hộp mì tôm, 1 hộp cà phê sữa đá hòa tan trong drawer. You never know when production decides to throw a party at 2 AM.*

*P/P/S: Cảm ơn cô Năm đã mở quán từ 4:30 sáng. You're the real MVP.*