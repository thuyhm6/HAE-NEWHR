Điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, 
Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), 
Thời gian vòa làm - DATE_STARTED (Ngày bắt đầu, Ngày kết thúc), 
Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), 
Loại nhân viên - EMP_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="13864"), 
Trạng thái - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"), 
Quốc tịch - NATIONALITY_CODE (dữ liệu lấy lấy thông qua data-parent-code="870"), 
Ca làm việc - SHIFT_NO(danh sách ca lấy từ /ar/attendanceSettings/api/shift), 
Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM thông qua bảng AR_ITEM_PARAM kết hợp cùng bảng AR_ITEM với điều kiện AR_ITEM_PARAM.ITEM_NO = AR_ITEM.ITEM_NO AND AR_ITEM.ITEM_GROUP_CODE != '1433'). 
Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM gồm <option value=""><!--请选择-->Lựa chọn</option>
							<option value="141443"><!--旷工-->Nghỉ không phép</option>
							<option value="141442"><!--早退-->Về sớm</option>
							<option value="141441"><!--迟到-->Đến muộn</option>
							<option value="14015448"><!--漏卡-->Quên quẹt thẻ</option>)