# Thymeleaf Templates - WEB-INF/view

## 📁 Cấu Trúc Thư Mục

Thư mục này chứa tất cả các template HTML của Thymeleaf cho ứng dụng HR System.

```
WEB-INF/view/
├── index.html          # Trang chủ
├── employees.html      # Trang quản lý nhân viên
├── departments.html    # Trang quản lý phòng ban
├── README.md          # File này
└── (Các template khác...)
```

## 🎯 Mục Đích

- **Bảo mật**: Thư mục WEB-INF không thể truy cập trực tiếp từ web browser
- **Tổ chức**: Tập trung tất cả template vào một nơi
- **Chuẩn hóa**: Tuân theo cấu trúc WAR file chuẩn

## 🔧 Cấu Hình

### Thymeleaf Configuration

Template resolver được cấu hình trong:

- `ThymeleafConfig.java` - Java configuration
- `application-context.xml` - XML configuration

```java
@Bean
public SpringResourceTemplateResolver templateResolver() {
    SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
    templateResolver.setPrefix("/WEB-INF/view/");
    templateResolver.setSuffix(".html");
    templateResolver.setTemplateMode("HTML");
    templateResolver.setCharacterEncoding("UTF-8");
    templateResolver.setCacheable(false);
    return templateResolver;
}
```

### Static Resources

CSS, JS, Images được serve từ:

- `/assets/css/style.css`
- `/assets/js/app.js`
- `/assets/images/`

## 📝 Template Guidelines

### 1. HTML Structure

```html
<!DOCTYPE html>
<html lang="vi" xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title th:text="${title}">Default Title</title>
    <link href="/assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="/assets/css/style.css" rel="stylesheet" />
    <link href="/assets/css/all.min.css" rel="stylesheet">

  </head>
  <body>
    <!-- Content -->
    <script src="/assets/plugin/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="/assets/js/jquery-3.6.0.min.js"></script>
    <script src="/assets/js/app.js"></script>
  </body>
</html>
```

### 2. Thymeleaf Expressions

```html
<!-- Text content -->
<h1 th:text="${title}">Default Title</h1>

<!-- Conditional rendering -->
<div th:if="${user != null}">
  <p th:text="'Hello, ' + ${user.name}">Hello, User</p>
</div>

<!-- Loops -->
<ul>
  <li th:each="item : ${items}" th:text="${item.name}">Item Name</li>
</ul>

<!-- URLs -->
<a th:href="@{/employees}">Employee List</a>
```

### 3. Bootstrap Integration

```html
<!-- Navigation -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" th:href="@{/}">HR System</a>
    <div class="navbar-nav ms-auto">
      <a
        class="nav-link"
        th:href="@{/}"
        th:classappend="${#httpServletRequest.requestURI == '/'} ? 'active'"
        >Trang chủ</a
      >
      <a
        class="nav-link"
        th:href="@{/employees}"
        th:classappend="${#strings.startsWith(#httpServletRequest.requestURI, '/employees')} ? 'active'"
        >Nhân viên</a
      >
    </div>
  </div>
</nav>

<!-- Cards -->
<div class="card feature-card">
  <div class="card-body">
    <h5 class="card-title" th:text="${title}">Card Title</h5>
    <p class="card-text" th:text="${message}">Card content</p>
  </div>
</div>

<!-- Forms -->
<form th:action="@{/save}" method="post">
  <div class="mb-3">
    <label for="name" class="form-label">Name</label>
    <input
      type="text"
      class="form-control"
      id="name"
      name="name"
      th:value="${item.name}"
    />
  </div>
  <button type="submit" class="btn btn-primary">Save</button>
</form>
```

## 🚀 Build Process

### Maven Configuration

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <executions>
        <execution>
            <id>copy-view-templates</id>
            <phase>process-resources</phase>
            <goals>
                <goal>copy-resources</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.directory}/classes</outputDirectory>
                <resources>
                    <resource>
                        <directory>src/main/webapp/WEB-INF/view</directory>
                        <targetPath>WEB-INF/view</targetPath>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### Build Command

```bash
mvn clean package
```

## 🔍 Debugging

### Template Not Found

- Check template path in controller
- Verify file exists in WEB-INF/view/
- Check Thymeleaf configuration

### Static Resources Not Loading

- Check ResourceHandler configuration
- Verify assets folder structure
- Check browser network tab

### Thymeleaf Errors

- Check template syntax
- Verify model attributes
- Check Thymeleaf logs

## 📋 Best Practices

1. **Naming Convention**

   - Use lowercase with hyphens: `employee-list.html`
   - Be descriptive: `employee-detail.html`

2. **Template Organization**

   - Keep templates focused on single purpose
   - Use fragments for reusable components
   - Separate layout from content

3. **Performance**

   - Minimize inline styles
   - Use external CSS/JS files
   - Enable template caching in production

4. **Security**
   - Escape user input with `th:text`
   - Use `th:utext` carefully
   - Validate all form inputs

## 🎨 Styling Guidelines

### CSS Classes

- Use Bootstrap classes for layout
- Custom styles in `/assets/css/style.css`
- Utility classes for spacing and colors

### JavaScript

- Use `/assets/js/app.js` for common functionality
- Page-specific scripts can be inline or separate files
- Follow jQuery/Bootstrap patterns

---

**Lưu ý**: Tất cả template trong thư mục này sẽ được compile bởi Thymeleaf và render thành HTML cho client.
