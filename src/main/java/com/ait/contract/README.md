# HR Contract Management Backend

## Tổng quan

Backend cho quản lý thông tin hợp đồng (Contract Info) được xây dựng theo mô hình của HrSpecialMatter với đầy đủ chức năng CRUD và DataTables server-side processing.

## Cấu trúc Backend

### 1. Model Layer

- **HrContract.java**: Model class cho bảng `hr_contract` với tất cả các trường:
  - CONTRACT_NO, PERSON_ID, CONTRACT_TYPE_CODE
  - START_CONTRACT_DATE, END_CONTRACT_DATE, REMARK
  - WORK_TIME, WORK_POSITION, WORK_CONTENT, SALARY
  - DEPTNO, POSITION_NO, POST_GRADE_NO
  - WORK_HOUR_TYPE, TOTAL_PERIOD, CONTRACT_NAME
  - CHANGE_DATE, CONTRACT_TYPE, TOTAL_PERIOD08
  - Các trường audit: CREATE_DATE, CREATED_BY, UPDATE_DATE, UPDATED_BY, etc.
  - Thông tin nhân viên từ bảng hr_employee: EMP_NAME, EMP_CODE, DEPARTMENT, POSITION

### 2. Data Access Layer

- **HrContractMapper.java**: Interface mapper với các method:

  - `getAllContracts()`, `getContractsWithPagination()`
  - `searchContracts()`, `searchContractsWithConditions()`
  - `getContractByContractNo()`, `addContract()`, `updateContract()`, `deleteContract()`
  - `getContractsForDataTables()`, `countContractsForDataTables()`
  - `searchEmployees()`: Tìm kiếm nhân viên cho gán hợp đồng

- **HrContractMapper.xml**: MyBatis XML mapping với:
  - ResultMap đầy đủ cho HrContract
  - Các query SQL với JOIN hr_employee
  - Dynamic SQL cho tìm kiếm và lọc dữ liệu
  - DataTables server-side processing queries

### 3. Service Layer

- **HrContractService.java**: Business logic với:

  - CRUD operations: add, update, delete, get
  - DataTables server-side processing
  - Validation logic
  - Employee search functionality
  - Export functionality
  - Audit field management

- **BaseHrService.java**: Base class tái sử dụng với:
  - Authentication checking
  - Audit field management
  - Error handling utilities
  - Response creation helpers
  - Validation utilities

### 4. Controller Layer

- **HrContractController.java**: REST API endpoints:

  - `GET /hrm/contract/list`: Hiển thị trang danh sách
  - `GET /hrm/contract/api/contract/{contractNo}`: Lấy chi tiết hợp đồng
  - `POST /hrm/contract/api/contract/add`: Thêm hợp đồng mới
  - `POST /hrm/contract/api/contract/update`: Cập nhật hợp đồng
  - `DELETE /hrm/contract/api/contract/delete/{contractNo}`: Xóa hợp đồng
  - `POST /hrm/contract/api/employees/search`: Tìm kiếm nhân viên
  - `GET /hrm/contract/export`: Xuất dữ liệu CSV

- **DataTablesController.java**: DataTables API:

  - `POST /api/datatables/contracts`: DataTables server-side processing
  - `GET /api/datatables/test-contracts`: Test endpoint

- **BaseHrController.java**: Base controller với:
  - Authentication checking
  - Response creation helpers
  - Error handling
  - Audit field management

### 5. DTO Layer

- **DataTablesRequest.java**: Mở rộng với các field cho contract:
  - contractNo, personId, contractType
  - workPosition, startDateFrom, startDateTo
  - endDateFrom, endDateTo, salaryFrom, salaryTo
  - orderColumn, orderDir, searchValue, offset, limit

## Tính năng chính

### 1. CRUD Operations

- ✅ Tạo mới hợp đồng với validation
- ✅ Cập nhật thông tin hợp đồng
- ✅ Xóa hợp đồng với confirmation
- ✅ Xem chi tiết hợp đồng
- ✅ Tìm kiếm hợp đồng theo nhiều tiêu chí

### 2. DataTables Integration

- ✅ Server-side processing với phân trang
- ✅ Tìm kiếm real-time
- ✅ Sắp xếp theo nhiều cột
- ✅ Export dữ liệu (CSV, Excel, PDF, Print)

### 3. Search & Filter

- ✅ Tìm kiếm theo số hợp đồng, tên hợp đồng
- ✅ Lọc theo mã nhân viên, tên nhân viên
- ✅ Lọc theo loại hợp đồng, phòng ban, vị trí
- ✅ Lọc theo khoảng thời gian bắt đầu/kết thúc
- ✅ Lọc theo khoảng lương, trạng thái hoạt động

### 4. Employee Integration

- ✅ Tìm kiếm nhân viên để gán hợp đồng
- ✅ Hiển thị thông tin nhân viên trong danh sách hợp đồng
- ✅ JOIN với bảng hr_employee

### 5. Security & Validation

- ✅ Authentication checking
- ✅ CSRF protection
- ✅ Input validation
- ✅ Audit trail (created_by, updated_by, etc.)

## API Endpoints

### Contract Management

```
GET    /hrm/contract/list                    # Hiển thị trang danh sách
GET    /hrm/contract/api/contract/{id}       # Lấy chi tiết hợp đồng
POST   /hrm/contract/api/contract/add        # Thêm hợp đồng mới
POST   /hrm/contract/api/contract/update     # Cập nhật hợp đồng
DELETE /hrm/contract/api/contract/delete/{id} # Xóa hợp đồng
POST   /hrm/contract/api/employees/search    # Tìm kiếm nhân viên
GET    /hrm/contract/export                  # Xuất dữ liệu CSV
```

### DataTables API

```
POST   /api/datatables/contracts             # DataTables server-side processing
GET    /api/datatables/test-contracts        # Test endpoint
```

## Cách sử dụng

### 1. Frontend Integration

Frontend đã được tạo sẵn trong:

- `viewNOContractInfo.html`: Trang danh sách hợp đồng
- `editContract.html`: Modal thêm/sửa hợp đồng

### 2. Database Setup

Đảm bảo bảng `hr_contract` đã được tạo với đầy đủ các trường theo model.

### 3. Configuration

- Cấu hình MyBatis mapper trong `application.properties`
- Đảm bảo database connection đã được thiết lập

## Tối ưu hóa

### 1. Code Reusability

- BaseHrService và BaseHrController cho các module khác
- Generic validation và error handling
- Reusable response creation methods

### 2. Performance

- Server-side processing cho DataTables
- Efficient SQL queries với proper indexing
- Pagination support

### 3. Maintainability

- Clear separation of concerns
- Comprehensive error handling
- Detailed logging
- Consistent naming conventions

## Kế hoạch mở rộng

1. **Caching**: Thêm Redis cache cho dữ liệu thường xuyên truy cập
2. **Audit Logging**: Chi tiết hóa audit trail
3. **File Upload**: Hỗ trợ upload file đính kèm hợp đồng
4. **Notification**: Thông báo khi hợp đồng sắp hết hạn
5. **Reporting**: Báo cáo thống kê hợp đồng
6. **Workflow**: Quy trình phê duyệt hợp đồng

## Lưu ý

- Backend được xây dựng theo mô hình của HrSpecialMatter để đảm bảo tính nhất quán
- Tất cả API đều có authentication checking
- Error handling được thực hiện đầy đủ với logging chi tiết
- Code được tối ưu để có thể tái sử dụng cho các module khác
