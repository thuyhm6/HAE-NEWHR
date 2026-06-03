# DataTables Optimization - Generic Search Parameters

## Vấn đề ban đầu

Trước đây, mỗi khi thêm model mới, chúng ta phải thêm các field cụ thể vào `DataTablesRequest`, vi phạm nguyên tắc tái sử dụng và làm cho class trở nên cồng kềnh.

## Giải pháp tối ưu

Sử dụng `Map<String, Object>` để lưu trữ các tham số tìm kiếm động, cho phép tái sử dụng cho bất kỳ model nào.

## Cấu trúc mới

### 1. DataTablesRequest

```java
public class DataTablesRequest {
    // Core DataTables fields
    private int draw = 1;
    private int start = 0;
    private int length = 10;
    private Search search;
    private Order[] order;
    private Column[] columns;

    // Generic search parameters - can be used for any model
    private Map<String, Object> searchParams = new HashMap<>();

    // Convenience methods
    public void addSearchParam(String key, Object value);
    public Object getSearchParam(String key);
    public String getSearchParamAsString(String key);
    public boolean hasSearchParam(String key);
}
```

### 2. DataTablesSearchUtil

Utility class cung cấp các method tiện ích:

```java
// Add search parameters
DataTablesSearchUtil.addSearchParam(request, "fieldName", "value");

// Add common parameter sets
DataTablesSearchUtil.addContractSearchParams(request, ...);
DataTablesSearchUtil.addEmployeeSearchParams(request, ...);

// Check parameters
DataTablesSearchUtil.hasSearchParam(request, "fieldName");
String value = DataTablesSearchUtil.getSearchParam(request, "fieldName");
```

## Cách sử dụng

### 1. Cho Contract Model

```java
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addContractSearchParams(request,
    contractNo, personId, contractType, workPosition,
    startDateFrom, startDateTo, endDateFrom, endDateTo,
    activity, salaryFrom, salaryTo);
```

### 2. Cho Employee Model

```java
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addEmployeeSearchParams(request,
    empName, empCode, department, position);
```

### 3. Cho Model mới bất kỳ

```java
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addSearchParam(request, "newField1", "value1");
DataTablesSearchUtil.addSearchParam(request, "newField2", "value2");
DataTablesSearchUtil.addDateRangeSearchParams(request,
    "dateFrom", "dateTo", "2024-01-01", "2024-12-31");
```

## MyBatis XML Mapping

### Cách cũ (không tái sử dụng)

```xml
<if test="contractNo != null and contractNo != ''">
    AND hc.CONTRACT_NO LIKE '%' || #{contractNo} || '%'
</if>
<if test="empName != null and empName != ''">
    AND he.EMP_NAME LIKE '%' || #{empName} || '%'
</if>
```

### Cách mới (tái sử dụng)

```xml
<if test="searchParams != null and !searchParams.isEmpty()">
    <if test="searchParams.contractNo != null and searchParams.contractNo != ''">
        AND hc.CONTRACT_NO LIKE '%' || #{searchParams.contractNo} || '%'
    </if>
    <if test="searchParams.empName != null and searchParams.empName != ''">
        AND he.EMP_NAME LIKE '%' || #{searchParams.empName} || '%'
    </if>
    <if test="searchParams.anyNewField != null and searchParams.anyNewField != ''">
        AND table.NEW_FIELD LIKE '%' || #{searchParams.anyNewField} || '%'
    </if>
</if>
```

## Lợi ích

### 1. Tái sử dụng hoàn toàn

- Không cần sửa `DataTablesRequest` khi thêm model mới
- Có thể sử dụng cho bất kỳ model nào
- Code sạch và dễ bảo trì

### 2. Linh hoạt

- Có thể thêm bất kỳ tham số tìm kiếm nào
- Hỗ trợ các loại dữ liệu khác nhau (String, Number, Date)
- Dễ dàng mở rộng

### 3. Hiệu quả

- Giảm code duplication
- Dễ test và debug
- Performance tốt hơn

## Ví dụ thực tế

### Thêm model Product mới

```java
// Controller
DataTablesRequest request = new DataTablesRequest();
DataTablesSearchUtil.addSearchParam(request, "productName", productName);
DataTablesSearchUtil.addSearchParam(request, "category", category);
DataTablesSearchUtil.addNumericRangeSearchParams(request,
    "priceFrom", "priceTo", priceFrom, priceTo);

// MyBatis XML - không cần sửa DataTablesRequest
<if test="searchParams.productName != null and searchParams.productName != ''">
    AND p.PRODUCT_NAME LIKE '%' || #{searchParams.productName} || '%'
</if>
<if test="searchParams.category != null and searchParams.category != ''">
    AND p.CATEGORY = #{searchParams.category}
</if>
<if test="searchParams.priceFrom != null and searchParams.priceFrom != ''">
    AND p.PRICE >= #{searchParams.priceFrom}
</if>
```

## Kết luận

Giải pháp này cho phép:

- ✅ Tái sử dụng hoàn toàn cho tất cả models
- ✅ Không cần sửa code cũ khi thêm model mới
- ✅ Code sạch, dễ bảo trì và mở rộng
- ✅ Performance tốt và linh hoạt cao
