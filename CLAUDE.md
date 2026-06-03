1. Ngôn ngữ: Bạn BẮT BUỘC phải trả lời, giải thích, và bình luận code bằng TIẾNG VIỆT.
2. Phong cách: Trả lời ngắn gọn, tập trung vào giải pháp kỹ thuật.
3. Code: Giữ nguyên thuật ngữ tiếng Anh chuyên ngành (ví dụ: function, class, variable). Khi tạo một file giao diện html mới thì cần tránh việc trùng lặp id của các phần tử trong file html đã có. sử dụng tên viết tắt của file html đó để làm tiền tố cho id.  Nếu cần thiết phải trùng id thì phải giải thích rõ lý do tại sao lại cần trùng id đó. Tạo file html cần tuân thủ đa ngôn ngữ, tránh việc hardcode text hiển thị trong file html, thay vào đó sử dụng các key để lấy text hiển thị từ file message.properties, nếu text đã có trong file message.properties thì không cần tạo thêm key. hiển thị mặc định ở trong file HTML là tiếng Việt.
4. Ưu tiên việc tái sử dụng code đã có, tránh việc viết lại code đã tồn tại. Nếu cần phải viết lại code đã tồn tại thì phải giải thích rõ lý do tại sao cần phải viết lại code đó.
4. Định dạng ngày tháng dạng YYYY/MM/DD. hoặc YYYY/MM/DD HH24:MI tùy theo ngữ cảnh sử dụng.
# When modifying code
- Giải thích ngắn gọn trước khi sửa nhiều file
- Sau khi sửa phải:
  - tóm tắt thay đổi
  - giải thích lý do
4. Khi tạo file .html thì lạo luôn các file backend liên quan (controller, service, mapper). với java không cần truyền tham số cpnyId, createBy, updateBy, createIp, updateIp, language ở các file java vì các tham số này đã được interceptor tự động inject. mapper.xml có thể trực tiếp sử dụng #{cpnyId}, #{adminID}, #{adminIP}, #{lang}
5. Áp dụng phân trang với quy tắc: (1) thêm draw/start/length vào DTO, (2) thêm countList+selectListPage vào mapper/XML dùng pattern ROWNUM trên, (3) controller trả về DataTablesResponse<T>, (4) HTML dùng serverSide: true để kích hoạt phân trang phía server, (5) đảm bảo rằng tất cả các truy vấn SQL trong mapper.xml đều được tối ưu hóa để hỗ trợ phân trang hiệu quả, tránh việc tải toàn bộ dữ liệu vào bộ nhớ khi thực hiện phân trang.
5. luôn luôn để để jdbcType cho tất cả các tham số ở mapper.xml
6. Nếu trong cấu lệnh SQL có sửu dụng câu lệnh điều kiện tìm kiếm với LOCAL_NAME thì phải sử dụng hàm CONVERTTOUNSIGN(UPPER(LOCAL_NAME)) để loại bỏ dấu và chuyển thành chữ hoa trước khi so sánh với giá trị tìm kiếm đã được xử lý tương tự, nhằm đảm bảo rằng việc tìm kiếm sẽ không bị ảnh hưởng bởi dấu hoặc chữ thường/hoa trong tên địa phương.
6. các file mapper.xml luôn sử dụng ResultMap để chỉ cho MyBatis biết cách map dữ liệu từ kết quả truy vấn SQL vào đối tượng Java (DTO/POJO)
7. Đối với các file Java, hãy tuân thủ quy tắc đặt tên theo chuẩn CamelCase và sử dụng các annotation như @Service, @Repository, @Autowired để quản lý bean và dependency injection.
8. Đảm bảo rằng tất cả các phương thức trong service layer đều có logging để dễ dàng theo dõi và gỡ lỗi.
9. Sử dụng try-catch để xử lý ngoại lệ và đảm bảo rằng các lỗi được ghi lại một cách chi tiết để hỗ trợ việc gỡ lỗi.
10. Đối với các truy vấn SQL phức tạp, hãy sử dụng MyBatis để viết các câu truy vấn một cách rõ ràng và dễ hiểu, tránh việc viết các câu truy vấn quá dài hoặc phức tạp trong code Java.
11. Đảm bảo rằng tất cả các phương thức trong service layer đều có transaction management để đảm bảo tính toàn vẹn của dữ liệu.
12. Sử dụng các annotation như @Transactional để quản lý transaction trong service layer, đảm bảo rằng các phương thức có liên quan đến việc thay đổi dữ liệu đều được bao bọc trong một transaction để đảm bảo tính nhất quán của dữ liệu.
13. Đối với các phương thức trong service layer, hãy đảm bảo rằng chúng có một cách rõ ràng để xử lý lỗi và trả về thông tin lỗi một cách chi tiết để hỗ trợ việc gỡ lỗi và cải thiện trải nghiệm người dùng.
14. Đảm bảo rằng tất cả các phương thức trong service layer đều có một cách rõ ràng để trả về kết quả, có thể là một đối tượng DTO hoặc một thông báo lỗi chi tiết để hỗ trợ việc gỡ lỗi và cải thiện trải nghiệm người dùng.
15. Sử dụng các annotation như @Valid để đảm bảo rằng các đối tượng DTO được kiểm tra hợp lệ trước khi được xử lý trong service layer, giúp đảm bảo rằng dữ liệu đầu vào là hợp lệ và giảm thiểu lỗi trong quá trình xử lý.
16. Đối với các phương thức trong service layer, hãy đảm bảo rằng chúng có một cách rõ ràng để xử lý lỗi và trả về thông tin lỗi một cách chi tiết để hỗ trợ việc gỡ lỗi và cải thiện trải nghiệm người dùng. Sử dụng các annotation như @ExceptionHandler để xử lý các ngoại lệ một cách hiệu quả và trả về thông tin lỗi chi tiết cho người dùng.
