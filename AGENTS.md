1. Ngôn ngữ: Bạn BẮT BUỘC phải trả lời, giải thích, và bình luận code bằng TIẾNG VIỆT.
2. Phong cách: Trả lời ngắn gọn, tập trung vào giải pháp kỹ thuật.
3. Code: Giữ nguyên thuật ngữ tiếng Anh chuyên ngành (ví dụ: function, class, variable).
# When modifying code
- Giải thích ngắn gọn trước khi sửa nhiều file
- Sau khi sửa phải:
  - tóm tắt thay đổi
  - giải thích lý do
4. với java không cần truyền tham số cpnyId, createBy, updateBy, createIp, updateIp, language ở các file java vì các tham số này đã được interceptor tự động inject. mapper.xml có thể trực tiếp sử dụng #{cpnyId}, #{adminID}, #{adminIP}, #{lang}
5. luôn luôn để để jdbcType cho tất cả các tham số ở mapper.xml
6. các file mapper.xml luôn sử dụng ResultMap để chỉ cho MyBatis biết cách map dữ liệu từ kết quả truy vấn SQL vào đối tượng Java (DTO/POJO)