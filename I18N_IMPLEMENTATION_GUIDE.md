# Hướng dẫn triển khai hệ thống đa ngôn ngữ (i18n) cho HR System

## Tổng quan

Hệ thống đa ngôn ngữ đã được triển khai thành công với hỗ trợ 4 ngôn ngữ:

- 🇻🇳 Tiếng Việt (vi) - Ngôn ngữ mặc định
- 🇺🇸 English (en)
- 🇨🇳 中文 (zh)
- 🇰🇷 한국어 (ko)

## Cấu trúc files đã tạo

### 1. File Messages Properties

```
src/main/resources/
├── messages.properties              # Ngôn ngữ mặc định (Tiếng Việt)
├── messages_vi_VN.properties       # Tiếng Việt
├── messages_en_US.properties       # English
├── messages_zh_CN.properties       # 中文
└── messages_ko_KR.properties       # 한국어
```

### 2. Java Classes

```
src/main/java/com/ait/
├── config/
│   └── MultilingualConfig.java     # Cấu hình Spring i18n
├── controller/
│   ├── LanguageController.java     # Controller thay đổi ngôn ngữ
│   └── MultilingualDemoController.java # Controller demo
└── util/
    └── I18nUtil.java               # Utility class cho i18n
```

### 3. Thymeleaf Templates

```
src/main/webapp/WEB-INF/view/
├── fragments/
│   └── multilingual.html           # Fragments cho language selector
├── multilingual/
│   └── demo.html                   # Trang demo i18n
└── login/
    └── login.html                  # Trang login đã cập nhật i18n
```

## Cách sử dụng

### 1. Trong Thymeleaf Templates

#### Sử dụng message key cơ bản:

```html
<span th:text="#{login.username}">Tên đăng nhập</span>
```

#### Sử dụng message key với arguments:

```html
<span th:text="#{validation.min.length(8)}">Độ dài tối thiểu là 8 ký tự</span>
```

#### Sử dụng trong attributes:

```html
<input th:placeholder="#{login.username}" />
```

### 2. Trong Java Code

#### Sử dụng I18nUtil:

```java
// Lấy message với locale hiện tại
String message = I18nUtil.getMessage("login.username");

// Lấy message với arguments
String message = I18nUtil.getMessage("validation.min.length", new Object[]{8});

// Lấy message với locale cụ thể
String message = I18nUtil.getMessage("login.username", Locale.ENGLISH);

// Kiểm tra message có tồn tại không
boolean exists = I18nUtil.hasMessage("login.username");
```

### 3. Thêm Language Selector vào trang

#### Dropdown Selector:

```html
<div th:replace="~{fragments/multilingual :: languageSelector}"></div>
```

#### Button Selector:

```html
<div th:replace="~{fragments/multilingual :: languageButtons}"></div>
```

#### Compact Selector:

```html
<div th:replace="~{fragments/multilingual :: languageSelectorCompact}"></div>
```

## API Endpoints

### 1. Thay đổi ngôn ngữ

```
GET /change-language?lang={languageCode}
```

Ví dụ:

- `/change-language?lang=vi` - Chuyển sang tiếng Việt
- `/change-language?lang=en` - Chuyển sang English
- `/change-language?lang=zh` - Chuyển sang 中文
- `/change-language?lang=ko` - Chuyển sang 한국어

### 2. Lấy thông tin ngôn ngữ hiện tại

```
GET /api/current-language
```

Response:

```json
{
  "locale": "vi_VN",
  "languageCode": "vi",
  "languageName": "Tiếng Việt",
  "supportedLanguages": ["vi", "en", "zh", "ko"],
  "supportedLanguagesMap": {
    "vi": "Tiếng Việt",
    "en": "English",
    "zh": "中文",
    "ko": "한국어"
  }
}
```

### 3. Lấy danh sách ngôn ngữ được hỗ trợ

```
GET /api/supported-languages
```

Response:

```json
{
  "vi": "Tiếng Việt",
  "en": "English",
  "zh": "中文",
  "ko": "한국어"
}
```

## Cách thêm message mới

### 1. Thêm vào tất cả file messages.properties

Ví dụ thêm message mới `employee.salary.range`:

**messages.properties (mặc định):**

```properties
employee.salary.range=Mức lương
```

**messages_en_US.properties:**

```properties
employee.salary.range=Salary Range
```

**messages_zh_CN.properties:**

```properties
employee.salary.range=薪资范围
```

**messages_ko_KR.properties:**

```properties
employee.salary.range=급여 범위
```

### 2. Sử dụng trong template:

```html
<span th:text="#{employee.salary.range}">Mức lương</span>
```

### 3. Sử dụng trong Java code:

```java
String message = I18nUtil.getMessage("employee.salary.range");
```

## Cách thêm ngôn ngữ mới

### 1. Tạo file messages mới

Ví dụ thêm tiếng Nhật:

```
src/main/resources/messages_ja_JP.properties
```

### 2. Cập nhật MultilingualConfig.java

```java
public static String[] getSupportedLanguages() {
    return new String[] { "vi", "en", "zh", "ko", "ja" }; // Thêm "ja"
}

public static String getLanguageName(String languageCode) {
    switch (languageCode) {
        case "vi": return "Tiếng Việt";
        case "en": return "English";
        case "zh": return "中文";
        case "ko": return "한국어";
        case "ja": return "日本語"; // Thêm case mới
        default: return "Unknown";
    }
}
```

### 3. Cập nhật I18nUtil.java

```java
public static String getLanguageName(String languageCode) {
    switch (languageCode) {
        case "vi": return "Tiếng Việt";
        case "en": return "English";
        case "zh": return "中文";
        case "ko": return "한국어";
        case "ja": return "日本語"; // Thêm case mới
        default: return "Unknown";
    }
}

public static Locale createLocale(String languageCode) {
    switch (languageCode) {
        case "vi": return new Locale("vi", "VN");
        case "en": return new Locale("en", "US");
        case "zh": return new Locale("zh", "CN");
        case "ko": return new Locale("ko", "KR");
        case "ja": return new Locale("ja", "JP"); // Thêm case mới
        default: return new Locale("vi", "VN");
    }
}
```

### 4. Cập nhật multilingual.html

```html
<option value="ja">🇯🇵 JP</option>
```

## Demo và Test

### 1. Truy cập trang demo:

```
http://localhost:8080/multilingual/demo
```

### 2. Test thay đổi ngôn ngữ:

- Sử dụng language selector trong topbar
- Hoặc truy cập trực tiếp: `/change-language?lang=en`

### 3. Kiểm tra API:

```bash
curl http://localhost:8080/api/current-language
curl http://localhost:8080/api/supported-languages
```

## Lưu ý quan trọng

1. **Encoding**: Tất cả file properties sử dụng UTF-8 encoding
2. **Cache**: Messages được cache 1 giờ, có thể thay đổi trong MultilingualConfig
3. **Fallback**: Nếu không tìm thấy message, sẽ trả về key
4. **Session**: Ngôn ngữ được lưu trong session, tự động restore khi reload
5. **Default**: Ngôn ngữ mặc định là tiếng Việt (vi_VN)

## Troubleshooting

### 1. Message không hiển thị

- Kiểm tra key có tồn tại trong tất cả file messages.properties
- Kiểm tra encoding UTF-8
- Kiểm tra cache (restart server nếu cần)

### 2. Ngôn ngữ không thay đổi

- Kiểm tra JavaScript console có lỗi không
- Kiểm tra API endpoint `/change-language` có hoạt động không
- Kiểm tra session có được lưu không

### 3. Character encoding issues

- Đảm bảo tất cả file properties sử dụng UTF-8
- Kiểm tra server configuration
- Kiểm tra browser encoding settings

## Kết luận

Hệ thống đa ngôn ngữ đã được triển khai hoàn chỉnh với:

- ✅ 4 ngôn ngữ được hỗ trợ
- ✅ UI components cho language selection
- ✅ API endpoints cho thay đổi ngôn ngữ
- ✅ Utility classes cho Java code
- ✅ Thymeleaf integration
- ✅ Demo page để test
- ✅ Documentation đầy đủ

Bạn có thể bắt đầu sử dụng ngay bằng cách thêm language selector vào các trang và sử dụng message keys trong templates.
