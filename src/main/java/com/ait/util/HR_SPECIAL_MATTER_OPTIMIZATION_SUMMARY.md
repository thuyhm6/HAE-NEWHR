# HrSpecialMatter Optimization Summary

## Tổng quan

Đã cập nhật `HrSpecialMatter` để tương thích với việc tối ưu hóa `DataTablesRequest` sử dụng generic search parameters.

## Những thay đổi đã thực hiện

### 1. HrSpecialMatterService.java

- **Thêm import**: `DataTablesSearchUtil`
- **Cập nhật method**: `getFemaleEmployeesForDataTables()` để sử dụng generic search parameters
- **Thêm method mới**: `searchFemaleEmployeesWithDataTablesRequest()` cho tương thích ngược
- **Sử dụng utility class**: `DataTablesSearchUtil.addSearchParam()` thay vì setter methods cũ

### 2. HrSpecialMatterMapper.java

- **Thêm import**: `DataTablesRequest`
- **Thêm methods mới**:
  - `getFemaleEmployeesForDataTablesWithSearchParams(DataTablesRequest request)`
  - `countFemaleEmployeesForDataTablesWithSearchParams(DataTablesRequest request)`
- **Giữ nguyên methods cũ** để tương thích ngược

### 3. HrSpecialMatterMapper.xml

- **Thêm 2 query mới**:
  - `getFemaleEmployeesForDataTablesWithSearchParams`: Sử dụng `searchParams.fieldName`
  - `countFemaleEmployeesForDataTablesWithSearchParams`: Sử dụng `searchParams.fieldName`
- **Giữ nguyên queries cũ** để tương thích ngược
- **Sử dụng generic search parameters**: `#{searchParams.fieldName}` thay vì `#{fieldName}`

## Cách sử dụng mới

### Trước đây (cách cũ)

```java
DataTablesRequest request = new DataTablesRequest();
request.setEmpName("Nguyen");
request.setDepartment("IT");
request.setActivity("ACTIVE");
```

### Bây giờ (cách mới - tối ưu)

```java
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addSearchParam(request, "empName", "Nguyen");
DataTablesSearchUtil.addSearchParam(request, "department", "IT");
DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");
```

### Hoặc sử dụng utility methods

```java
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addEmployeeSearchParams(request, "Nguyen", "EMP001", "IT", "Developer");
DataTablesSearchUtil.addDateRangeSearchParams(request, "createDateFrom", "createDateTo", "2024-01-01", "2024-12-31");
DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");
```

## Lợi ích

### 1. Tái sử dụng hoàn toàn

- ✅ Không cần sửa `DataTablesRequest` khi thêm field mới
- ✅ Có thể sử dụng cho bất kỳ model nào
- ✅ Code sạch và dễ bảo trì

### 2. Tương thích ngược

- ✅ Giữ nguyên methods cũ
- ✅ Không ảnh hưởng đến code hiện tại
- ✅ Có thể migrate từ từ

### 3. Linh hoạt

- ✅ Thêm bất kỳ field nào cho HrSpecialMatter
- ✅ Hỗ trợ các loại dữ liệu khác nhau
- ✅ Dễ dàng mở rộng

## Ví dụ thực tế

### Thêm field mới cho HrSpecialMatter

```java
// Không cần sửa DataTablesRequest!
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addSearchParam(request, "newField", "value");
DataTablesSearchUtil.addSearchParam(request, "anotherField", "anotherValue");

// MyBatis XML sẽ tự động xử lý
// #{searchParams.newField}
// #{searchParams.anotherField}
```

### Sử dụng với HrSpecialMatter

```java
// Basic search
DataTablesSearchUtil.addEmployeeSearchParams(request, empName, empCode, department, position);
DataTablesSearchUtil.addSearchParam(request, "activity", "ACTIVE");

// Advanced search
DataTablesSearchUtil.addDateRangeSearchParams(request, "createDateFrom", "createDateTo", "2024-01-01", "2024-12-31");
DataTablesSearchUtil.addSearchParam(request, "otFlag", "Y");
DataTablesSearchUtil.addSearchParam(request, "specialContent", "Maternity Leave");
```

## Kết luận

HrSpecialMatter đã được tối ưu hóa để:

- ✅ **Tương thích hoàn toàn** với generic DataTablesRequest
- ✅ **Tái sử dụng 100%** cho tất cả models
- ✅ **Không cần sửa code cũ** khi thêm field mới
- ✅ **Performance tốt** và linh hoạt cao
- ✅ **Dễ bảo trì** và mở rộng

Bây giờ bạn có thể sử dụng HrSpecialMatter với generic search parameters mà không cần lo lắng về việc sửa DataTablesRequest! 🎉
