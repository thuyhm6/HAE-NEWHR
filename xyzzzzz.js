build dụ án để đưa vào JEUS 8
deploy-jeus.bat
mã màu: #f4731f

destroy: true,
columnDefs: [
	{ "width": "2%", "targets": 0 },
],

CONVERTTOUNSIGN(UPPER(t2.LOCAL_NAME)) LIKE '%' || CONVERTTOUNSIGN(UPPER(#{localName})) || '%'

<select class="form-select" id="arItemItemGroupCode" name="itemGroupCode"
	data-parent-code="1429" data-default-text="-- Chọn mã nhóm --">
</select>
Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812")
Trạng thái làm việc - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118" không có data-default-text)
Học vị - vrl_edu_deg_ (dữ liệu lấy lấy thông qua data-parent-code="13769")
Quan hệ - vrl_f_type_ (dữ liệu lấy lấy thông qua data-parent-code="950")
Giới tính - vrl_f_gen_ (dữ liệu lấy lấy thông qua data-parent-code="13768")

vrl_postFamily là Nhóm nhân viên -POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812" không có data-default-text). khi chọn value của Nhóm nhân viên thì đồng thời load lại cấp bậc - vrl_postGradeNo với data-parent-code chính là value vừa chọn của Nhóm nhân viên

<input type="text" class="form-control js-daterangepicker" data-drp-format="YYYY-MM-DD">

sử dụng processingModal.html để hiển thị khi đang xử lý, tham khảo cách sử dụng ở viewPiciOtAffirmLBatchList.html


url: '/ar/attendanceSettings/api/shift',
url: '/sys/api/code/list?parentCodeNo=400223',

sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên. $('#esm_empOffice').val('15119'); để truyền giá trị tìm kiếm mặc định

sử dụng cách tìm kiếm Họ tên / Mã NV như của viewPaInputItemData.html để tìm nhân viên.

sử dụng vppoOpenEmpSearch như của viewPaPayObj.html để tìm 1 nhân viên.

sử dụng veas_deptSearch như của viewEvsAffirmorSetup.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban.

sử dụng vpid_deptSearch như của viewPaInputItemData.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban.

phần vrl_deptNo lựa chọn phòng ban, tham khảo veas_deptSearch của viewEvsAffirmorSetup.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban (chỉ được phép chọn 1 phòng ban). khi hiện ra thì hiện Tên phòng ban, khi chọn xong thì lưu giá trị vào trường DEPTNO. vrl_costCenter cũng làm tương tự nhưng lưu giá trị vào trường COST_CENTER. khi chọn được phòng ban thì vrl_costCenter cũng được tuwej động chọn đúng mã đó.

bạn là người hiểu rất rõ về dự án này. căn cứ vào file viewNOContractInfo.html - ký kết hợp đồng,  hãy tạo cho tôi một file viewContractInfoForSearch.html - Tra cứu hợp đồng, dữ liệu lấy ra là tất cả các hợp đồng trong bảng HR_CONTRACT

Tạo cho tôi 1 file viewResumeList.html - Tổng hợp thay đổi nằm trong module org, dữ liệu lấy ra là tất cả các lần có thay đổi liên quan đến bộ phận. Dữ liệu này được lưu trong bảng org_resume_info với các trường tham khảo từ hình ảnh. Có đầy đủ chức năng tìm kiếm, thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị ORG_RESUME_INFO_SEQ.NEXTVAL, trường NO là duy nhất trong bảng org_resume_info, được tạo nên dựa trên ngày hiện tại với định dạng YYYYMMDDXXXX (XXXX là số thứ tự tăng dần)

Tạo cho tôi một file viewResumeProcess.html - Quy trình thay đổi nằm trong module org, với giao diện tham khảo từ hình ảnh. ở mục "Tên phiên bản" là tên của phiên bản thay đổi, chính là dữ liệu từ cột RESUME_NAME trong bảng org_resume_info

@viewResumeProcess.html#L21-23, khi người dùng tick vào Sao chép tổ chức cũ, Tự động tạo ra quyết định, Tạo ra nội dung thay đổi ,Hình thành tổ chức mới và bấm nút "Thực hiện" thì sẽ gọi đến một procedure PKG_RESUME_PROCESS.PR_PROCESS_EXECUTE(
						#RESUME_NO:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#type:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#). việc tick vào và bấm nút "Thực hiện" thì sẽ gọi đến procedure trên phải thực hiện theo thứ tự: Sao chép tổ chức cũ -> Tự động tạo ra quyết định -> Tạo ra nội dung thay đổi -> Hình thành tổ chức mới. giá trị tham số type tương ứng như sau: Sao chép tổ chức cũ - copyOrg, Tự động tạo ra quyết định - scfl, Tạo ra nội dung thay đổi - sczz, Hình thành tổ chức mới - qdzz


Tạo cho tôi một file viewComposeOrg.html - Thiết lập tổ chức nằm trong module org, với giao diện tham khảo từ hình ảnh. phần danh sách các tổ chức bên trái là dữ liệu lấy từ bảng ORG_INFO, phần bên phải là dữ liệu lấy từ bảng ORG_EMPLOYEE. với các trường của bảng ORG_INFO và ORG_EMPLOYEE tham khảo từ hình ảnh


Tạo cho tôi một file viewDeptManagerCheck.html - Kiểm tra trưởng bộ phận nằm trong module org, với giao diện tham khảo từ hình ảnh. dữ liệu lấy từ 2 bảng ORG_INFO và ORG_EMPLOYEE. trường IS_PART_TIME là thể hiện của việc kiêm nhiệm, nếu là 1 thì là kiêm nhiệm, nếu là 0 thì là không kiêm nhiệm, trường VACANCY thể hiện phòng ban có chức danh trưởng bộ phận hay không, nếu là 1 thì là có, nếu là 0 thì là không

căn cứ vào cấu trúc của viewComposeOrg.html hãy Tạo cho tôi một file viewOrgBusiness.html - Quản lý nghiệp vụ phòng ban nằm trong module org, với giao diện tham khảo từ hình ảnh. phần danh sách các tổ chức bên trái là dữ liệu lấy từ bảng ORG_INFO, phần bên phải là dữ liệu lấy từ bảng ORG_BUSINESS_RELATION. Mối quan hệ của 2 bảng là 1 ORG_INFO với nhiều ORG_BUSINESS_RELATION. với các trường của bảng ORG_BUSINESS_RELATION tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel.

căn cứ vào cấu trúc của viewResumeList.html hãy Tạo cho tôi một file viewOrgCostCenter.html - Quản lý mã chi phí nằm trong module org, dữ liệu lấy từ bảng ORG_COST_CENTER. với các trường của bảng ORG_COST_CENTER tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị ORG_COST_CENTER_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewComposeOrg.html hãy Tạo cho tôi một file viewCurrentOrgInfo.html - Cây sơ đồ tổ chức nằm trong module org. phần danh sách các tổ chức bên trái là dữ liệu lấy từ bảng HR_DEPARTMENT, phần bên phải là dữ liệu lấy từ bảng HR_EMPLOYEE. với các trường của bảng HR_DEPARTMENT và HR_EMPLOYEE tham khảo từ hình ảnh.

Tạo cho tôi một file viewOrgInfo.html - Cấu trúc tổ chức nằm trong module org, với giao diện tham khảo từ hình ảnh. dữ liệu lấy từ 2 bảng HR_DEPARTMENT và HR_EMPLOYEE

tạo một bản sao từ viewComposeOrg.html với tên là viewHistoryOrgInfo.html - Lịch sử thay đổi tổ chức nằm trong module org. Lược bỏ đi chức năng thêm, sửa, xóa

Tạo cho tôi một file viewWorkInformation.html - Thông tin công việc nằm trong module hrm/empinfo. dữ liệu lấy từ 2 bảng hr_work_experience với các trường tham khảo từ hình ảnh. trường PERSON_ID của bảng hr_work_experience tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị HR_W_EXP_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file educationSearch.html - Quá trình học tập nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_education với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_education tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị hr_edu_seq.nextval

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file addressSearch.html - Tra cứu địa chỉ nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_address_matters với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_address_matters tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị HR_ADDRESS_MATTERS_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file familySearch.html - Tra cứu gia đình nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_family với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_family tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị HR_FAMILY_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file emergencyAddressSearch.html - Tra cứu địa chỉ khẩn cấp nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_emergency_address với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_emergency_address tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị HR_EMERGENCY_ADDRESS_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file recognitionSearch.html - Tra cứu khen thưởng nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_reward với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_reward tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị hr_reward_seq.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file punishmentSearch.html - Tra cứu kỷ luật nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_punishment với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_punishment tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị hr_punishment_seq.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file viewQualification.html - Tra cứu Chứng chỉ nằm trong module hrm/empinfo. dữ liệu lấy từ bảng hr_qualification với các trường tham khảo từ hình ảnh, trường PERSON_ID của bảng hr_qualification tham chiếu đến trường PERSON_ID của bảng HR_EMPLOYEE. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ khi tạo mới là tự động tăng với giá trị hr_qualification_apply_seq.NEXTVAL

căn cứ vào cấu trúc của viewComposeOrg.html hãy Tạo cho tôi một file viewCodeManage.html - Quản lý code nằm trong module sys. phần bên trái lấy dữ liệu từ 2 bảng sy_code và sy_global_name, bảng sy_global_name là dạng bảng đa ngôn ngữ, tôi có thiết lập 4 loại ngôn nữa đó là tiếng việt - vi, tiếng anh - en, tiếng trung - zh, tiếng hàn - ko, thể hiện theo kiểu phân cấp, trường NO của bảng sy_global_name tương ứng với trường CODE_NO của bảng sy_code, và tương ứng với CODE_NO sẽ có PARENT_CODE_NO để phân cấp cha con, chi tiết các trường của 2 bảng sy_global_name và sy_code tham khảo ở hình ảnh. phần bên phải là danh sách các code là con của những code được chọn ở bên trái, Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường SEQ của bảng sy_global_name khi tạo mới là tự động tăng với giá trị SY_GLOBAL_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file viewCompany.html - Quản lý công ty nằm trong module sys/basicMaintenance. dữ liệu lấy từ bảng HR_COMPANY với các trường tham khảo từ hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường CPNY_NO khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của công ty sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

căn cứ vào cấu trúc của viewCodeManage.html hãy Tạo cho tôi một bản sao là file viewCodePamers.html - Quản lý tham số nằm trong module sys/basicMaintenance, lưu ý vấn đề ID. chỉ khác là mục đích của giao diện này để cấu hình code cho mã công ty là trường CPNY_ID của bảng HR_COMPANY. khi click vào tên ở bên trái, thì sẽ xuất hiện dánh sách các node con ở bên phải, ở đấy tôi có thể tick chọn các node con để lưu cho mã công ty đó, giá trị sẽ được lưu vào trong bảng SY_CODE_PARAM, chi tiết các trường của bảng SY_CODE_PARAM tham khảo ở hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường PARAM_NO của bảng SY_CODE_PARAM khi tạo mới là tự động tăng với giá trị SY_CODE_PARAM_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewCodePamers.html hãy Tạo cho tôi một file viewMenuPamers.html - Quản lý tham số màn hình nằm trong module sys/basicMaintenance, lưu ý vấn đề ID. mục đích của giao diện này để cấu hình code cho mã công ty là trường CPNY_ID của bảng HR_COMPANY. khi click vào tên ở bên trái, thì sẽ xuất hiện dánh sách các node con ở bên phải, ở đấy tôi có thể tick chọn các node con để lưu cho mã công ty đó, giá trị sẽ được lưu vào trong bảng sy_menu_param, chi tiết các trường của bảng sy_menu_param tham khảo ở hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường PARAM_NO của bảng sy_menu_param khi tạo mới là tự động tăng với giá trị SY_MENU_PARAM_SEQ.NEXTVAL


căn cứ vào cấu trúc của viewCompany.html hãy Tạo cho tôi một file viewMenuList.html - Quản lý menu nằm trong module sys/basicMaintenance, lưu ý các ID để tránh xung đột với các ID ở các file html khác. dữ liệu lấy từ bảng sy_menu với các trường tham khảo từ hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường MENU_NO khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của menu sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

căn cứ vào cấu trúc của viewCompany.html hãy Tạo cho tôi một file viewSyRolesGroupList.html - Quản lý nhóm quyền nằm trong module sys/syRole, lưu ý các ID để tránh xung đột với các ID ở các file html khác. dữ liệu lấy từ bảng SY_ROLES_GROUP với các trường tham khảo từ hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường ROLE_GROUP_NO và ROLE_GROUP_ID khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

căn cứ vào cấu trúc của viewSyRolesGroupList.html hãy Tạo cho tôi một file viewRolesGroup.html - Quản lý quyền hạn nằm trong module sys/syRole, lưu ý các ID để tránh xung đột với các ID ở các file html khác. dữ liệu lấy từ bảng SY_ROLES với các trường tham khảo từ hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường ROLE_NO và ROLE_ID khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name. mục đích của giao diện này để kết nối đến bảng sy_role_relation thông qua trường ROLE_NO. chức năng của giao diện này là để phân menu vào quyền hạn. khi thêm mới quyền hạn thì sẽ hiển thị tất cả menu theo dạng phân cấp để có thể tick chọn. bảng sy_role_relation có các trường như hình ảnh tham khảo.

hãy sửa lại cách thức lưu menu cho mỗi quyền hạn, khi click vào từng quyền hạn ở bên trái thì sẽ hiển thị tất cả menu theo dạng phân cấp ở bên phải để có thể tick chọn. thêm nút lưu để lưu lại vào bảng sy_role_relation. khi xóa quyền hạn thì sẽ xóa luôn trong bảng sy_role_relation.

chỉnh sửa lại chức năng của giao diện viewSyRolesGroupList.html. chức năng của giao diện này là để phân quyền vào nhóm quyền. khi thêm mới nhóm quyền thì sẽ hiển thị tất cả quyền hạn (quyền hạn chính là các giá trị trong bảng SY_ROLES) để có thể tick chọn, và khi xóa quyền hạn thì sẽ xóa luôn trong bảng trung gian. 2 bảng SY_ROLES và SY_ROLES_GROUP có quan hệ thông qua bảng trung gian là sy_role_group_relation có các trường như hình ảnh tham khảo. 

hãy sửa lại cách thức lưu quyền hạn cho mỗi nhóm quyền ở giao diện viewSyRolesGroupList.html, khi click vào từng nhóm quyền ở bên trái thì sẽ hiển thị tất cả quyền hạn (quyền hạn chính là các giá trị trong bảng SY_ROLES) ở bên phải để có thể tick chọn. thêm nút lưu để lưu lại vào bảng sy_role_group_relation. khi xóa quyền hạn thì sẽ xóa luôn trong bảng sy_role_group_relation.

căn cứ vào cấu trúc của viewSyRolesGroupList.html hãy Tạo cho tôi một file viewLoginUser.html - Quản lý người dùng nằm trong module sys/syRole, lưu ý các ID để tránh xung đột với các ID ở các file html khác. dữ liệu lấy từ bảng SY_USER với các trường tham khảo từ hình ảnh, có chức năng reset mật khẩu về mặc định là 123456A@ hoặc một mật khẩu mà tự nhập vào ô reset mật khẩu, xuất excel. khi click vào từng người dùng ở bên trái thì sẽ hiển thị tất cả nhóm quyền (nhóm quyền chính là các giá trị trong bảng SY_ROLES_GROUP) ở bên phải để có thể tick chọn. thêm nút lưu để lưu lại vào bảng sy_USER_relation. khi xóa nhóm quyền thì sẽ xóa luôn trong bảng sy_USER_relation. mục đích của giao diện này để kết nối đến bảng SY_ROLE_GROUP thông qua bảng trung gian là sy_USER_relation thông qua trường USER_NO và ROLE_GROUP_NO. chức năng của giao diện này là để phân quyền vào user. bảng sy_USER_relation có các trường như hình ảnh tham khảo.

căn cứ vào cấu trúc của viewWorkInformation.html hãy Tạo cho tôi một file viewCycleParameter.html - Tra cứu thông số nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_STATISTIC_DATE_PARAM với các trường tham khảo từ hình ảnh, trường CPNY_ID của bảng AR_STATISTIC_DATE_PARAM tham chiếu đến trường CPNY_ID của bảng HR_COMPANY. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường PARAM_NO khi tạo mới là tự động tăng với giá trị AR_STATISTIC_DATE_PARAM_SEQ.NEXTVAL

căn cứ vào cấu trúc của viewCycleParameter.html hãy Tạo cho tôi một file viewCycle.html - Chi nhánh nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_STATISTIC_DATE với các trường tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường STAT_NO khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

căn cứ vào cấu trúc của viewCycle.html hãy Tạo cho tôi một file viewArItem.html - Danh sách hạng mục nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_ITEM với các trường tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường ITEM_NO khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

căn cứ vào cấu trúc của viewArItem.html hãy Tạo cho tôi một file viewArItemParamList.html - Danh sách tham số nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_ITEM_PARAM với các trường tham khảo từ hình ảnh. dữ liệu kết hợp cùng với bảng AR_ITEM thông qua trường ITEM_NO, kết hợp với bảng HR_COMPANY thông qua trường CPNY_ID. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường AR_PARAM_NO khi tạo mới là tự động tăng với giá trị AR_ITEM_PARAM_SEQ.NEXTVAL.


hãy rà soát lại toàn bộ dự án, kiểm tra xem  code dự án đã tối ưu chưa, cần thay đổi ở đâu không, hãy kiểm tra vấn đề bảo mật đã tốt chưa

@MapperScan(value = {"com.ait.mapper", "com.ait.ar"}, annotationClass = Mapper.class)

căn cứ vào cấu trúc của viewCodePamers.html hãy Tạo cho tôi một file viewItemParameter.html - Quản lý tham số hạng mục nằm trong module ar/attendanceSettings, lưu ý vấn đề ID. mục đích của giao diện này để cấu hình tham số cho các Item của bảng AR_ITEM thông qua trường ITEM_NO, với điều kiện ACTIVITY = 1. khi click vào tên ở bên trái, thì sẽ xuất hiện dánh sách các node con ở bên phải (dữ liệu lấy từ bảng AR_ITEM_PARAM thông qua trường ITEM_NO), tham khảo hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang. và chức năng thêm, sửa, xóa sẽ tác động vào bảng AR_ITEM_PARAM, lưu ý trường AR_PARAM_NO của bảng AR_ITEM_PARAM khi tạo mới là tự động tăng với giá trị AR_ITEM_PARAM_SEQ.NEXTVAL


căn cứ vào cấu trúc của viewItemParameter.html hãy Tạo cho tôi một file viewShift.html - Thiết lập ca làm việc nằm trong module ar/attendanceSettings, lưu ý vấn đề ID. mục đích của giao diện này để cấu hình ca làm việc cho các SHIFT_NO của bảng AR_SHIFT010 thông qua trường SHIFT_NO, với điều kiện ACTIVITY = 1. khi click vào tên ở bên trái, thì sẽ xuất hiện danh sách các node con ở bên phải (dữ liệu lấy từ bảng AR_SHIFT020 thông qua trường SHIFT_NO), cấu trúc 2 bảng AR_SHIFT010 và AR_SHIFT020 tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa, phân trang. và chức năng thêm, sửa, xóa sẽ tác động vào bảng AR_SHIFT010 và bảng AR_SHIFT020, lưu ý trường SHIFT_NO của bảng AR_SHIFT010 khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.. lưu ý trường PK_NO của bảng AR_SHIFT020 khi tạo mới là tự động tăng với giá trị AR_SHIFT020_SEQ.NEXTVAL


căn cứ vào cấu trúc của viewArItem.html hãy Tạo cho tôi một file viewStatutoryHolidays.html - Thiết lập ngày lễ nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_CALENDER với các trường tham khảo từ hình ảnh (điều kiện là TYPEID = '1442' or statutory_flag = 1). dữ liệu kết hợp với bảng HR_COMPANY thông qua trường CPNY_ID. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý khi thêm mới hay sửa, thì chính là sửa dữ liệu trong bảng AR_CALENDER, đồng thời sửa luôn dữ liệu trong bảng AR_CALENDER_GROUP, đồng thời xóa dữ liệu trong bảng ar_calender_group_history, sau đó thêm dữ liệu vào bảng ar_calender_group_history thông qua bảng AR_CALENDER_GROUP thông qua trường AR_DATE_STR và CPNY_ID (với các trường của bảng ar_calender_group_history và AR_CALENDER_GROUP tham khảo từ hình ảnh).

căn cứ vào hình ảnh tham khảo hãy Tạo cho tôi một file viewCompanyCalendar.html - Lịch công ty nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_CALENDER. dữ liệu kết hợp với bảng HR_COMPANY thông qua trường CPNY_ID. mặc định khi hiển thị lịch sẽ hiển thị theo tháng năm hiện tại, Có thể bấm vào ngày để sửa. lưu ý khi sửa, thì chính là sửa dữ liệu trong bảng AR_CALENDER, đồng thời sửa luôn dữ liệu trong bảng AR_CALENDER_GROUP, đồng thời xóa dữ liệu trong bảng ar_calender_group_history, sau đó thêm dữ liệu vào bảng ar_calender_group_history thông qua bảng AR_CALENDER_GROUP thông qua trường AR_DATE_STR và CPNY_ID.

căn cứ vào cấu trúc của viewArItem.html hãy Tạo cho tôi một file viewSummaryItem.html - Hạng mục tổng hợp nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_STA_ITEM với các trường tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường ITEM_NO của bảng AR_STA_ITEM khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của hạng mục sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name. giá trị của trường DATATYPE luôn luôn là 1492

căn cứ vào cấu trúc của viewArItem.html hãy Tạo cho tôi một file viewSummaryParamItem.html - Thông số tổng hợp nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_STA_ITEM_PARAM với các trường tham khảo từ hình ảnh. dữ liệu kết hợp với bảng AR_STA_ITEM thông qua trường ITEM_NO. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường PARAM_NO của bảng AR_STA_ITEM_PARAM khi tạo mới là tự động tăng với giá trị AR_STA_ITEM_PARAM_SEQ.NEXTVAL. Khí bấm thêm mới, sẽ tìm những ITEM_NO nào mà có ở bảng AR_STA_ITEM những chưa có trong bảng AR_STA_ITEM_PARAM. Khi thực hiện thêm mới thì giá trị của trường CAL_ORDER bằng giá trị của trường CAL_ORDER lớn nhất trong bảng AR_STA_ITEM_PARAM + 1 (với điều kiện CPNY_ID = #{cpnyId}). 


căn cứ vào cấu trúc của viewItemParameter.html hãy Tạo cho tôi một file viewSummaryFormula.html - Công thức tổng hợp nằm trong module ar/attendanceSettings, lưu ý vấn đề ID để tránh xung đột giữa các giao diện. mục đích của giao diện này để cấu hình công thức cho các ITEM_NO của bảng AR_STA_ITEM_PARAM thông qua trường ITEM_NO, với điều kiện ACTIVITY = 1. khi click vào tên ở bên trái (tức là click vào ITEM_NAME với điều kiện ITEM_NO = NO của bảng SY_GLOBAL_NAME, với danh sách các ITEM_NO được lấy từ bảng AR_STA_ITEM_PARAM với việc sắp xêp từ nhỏ đến lớn theo CAL_ORDER), thì sẽ xuất hiện danh sách các node con ở bên phải (dữ liệu lấy từ bảng AR_STA_FORMULAR thông qua trường ITEM_NO), cấu trúc 2 bảng AR_STA_FORMULAR tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa. và chức năng thêm, sửa, xóa sẽ tác động vào bảng AR_STA_FORMULAR. lưu ý trường FORMULAR_NO của bảng AR_STA_FORMULAR khi tạo mới là tự động tăng với giá trị AR_STA_FORMULAR_SEQ.NEXTVAL

khi bấm vào thêm mới hoặc chỉnh sửa công thức, sẽ hiện thêm phần công cụ ở bên dưới, thông tin tham khảo ở hình ảnh. với "Danh sách hạng mục chấm công" lấy dữ liệu từ câu lệnh: SELECT DISTINCT A.*,     S2.CONTENT ITEM_NAME,     S1.CONTENT ITEM_GROUP_NAME    FROM AR_ITEM A,      AR_ITEM_PARAM C,      SY_GLOBAL_NAME S1,      SY_GLOBAL_NAME S2    WHERE A.ITEM_NO = C.ITEM_NO       AND C.CPNY_ID = #{cpnyId}      AND A.ITEM_GROUP_CODE = S1.NO(+)      AND S1.LANGUAGE(+) = #{lang}      AND A.ITEM_NO = S2.NO(+)      AND S2.LANGUAGE(+) = #{lang}    ORDER BY A.ITEM_NO; với "Bảng tổng hợp chấm công" lấy dữ liệu từ câu lệnh: SELECT       T.ITEM_NO,     S1.CONTENT ITEM_NAME,     CAL_ORDER,     T.STA_ITEM_ID,     T.DATATYPE,           S2.CONTENT DATATYPE_NAME         FROM AR_STA_ITEM T,      AR_STA_ITEM_PARAM PA,      SY_GLOBAL_NAME S1,      SY_GLOBAL_NAME S2    WHERE T.ITEM_NO = PA.ITEM_NO      AND PA.ITEM_NO = S1.NO(+)      AND S1.LANGUAGE(+) = #{lang}      AND T.DATATYPE = S2.NO(+)      AND S2.LANGUAGE(+) = #{lang}      AND PA.CPNY_ID = #{cpnyId}      AND T.ACTIVITY = 1 AND PA.ACTIVITY = 1    ORDER BY PA.CAL_ORDER; với "Thông tin cơ bản" lấy dữ liệu từ câu lệnh: SELECT DISTINCT_FIELD,     S1.CONTENT FIELD_NAME    FROM PA_DISTINCT_LIST,      SY_GLOBAL_NAME S1    WHERE TABLE_NAME = 'PA_HR_V'      AND CPNY_ID = #{cpnyId}      AND ID = S1.NO(+)      AND S1.LANGUAGE(+) = #{lang}      AND PA_DISTINCT_LIST.ACTIVITY = 1    ORDER BY PA_DISTINCT_LIST.ORDERNO; các trường của bảng pa_distinct_list tham khảo từ hình ảnh. hãy chỉnh sửa lại câu lệnh nếu nó chưa tối ưu. khi bấm vào từng tên của các hạng mục trong phần công cụ, sẽ lấy ra ID của hạng mục đó và điền vào ô Công thức (Formular) trong form thêm mới hoặc chỉnh sửa công thức, với điều kiện sau: Bấm vào hạng mục trong phần "Danh sách hạng mục chấm công" sẽ lấy ra ITEM_ID của hạng mục đó chèn thêm "ATT_ITEM." ở trước và điền vào ô Công thức (Formular) trong form thêm mới hoặc chỉnh sửa công thức. Bấm vào hạng mục trong phần "Bảng tổng hợp chấm công" sẽ lấy ra STA_ITEM_ID của hạng mục đó chèn thêm "STA_ITEM." ở trước và điền vào ô Công thức (Formular) trong form thêm mới hoặc chỉnh sửa công thức. khi bấm vào hạng mục trong phần "Thông tin cơ bản" sẽ lấy ra DISTINCT_FIELD của hạng mục đó chèn thêm "STA_ITEM." ở trước và điền vào ô Công thức (Formular) trong form thêm mới hoặc chỉnh sửa công thức. 

căn cứ vào cấu trúc của viewItemParameter.html hãy Tạo cho tôi một file viewAttendanceKeeper.html - Phân quyền chấm công nằm trong module ar/attendanceSettings, lưu ý vấn đề ID để tránh xung đột giữa các giao diện. mục đích của giao diện này để phân quyền cho các PERSON_ID của bảng AR_SUPERVISOR thông qua trường PERSON_ID, với điều kiện ACTIVITY = 1. bên trái là dữ liệu thông tin nhân viên lấy từ bảng AR_SUPERVISOR, khi click vào tên nhân viên ở bên trái, thì sẽ xuất hiện cơ cấu sơ đồ tổ chức ở bên phải (dữ liệu lấy từ bảng HR_DEPARTMENT), thêm điều kiện nếu trong bảng AR_SUPERVISOR_INFO có giá trị của trường PERSON_ID twuogn ứng với giá trị của trường PERSON_ID trong bảng AR_SUPERVISOR, tương ứng với PERSON_ID đó có giá trị DEPTNO  = DEPTNO trong bảng HR_DEPARTMENT thì sẽ xuất hiện nút chọn, cấu trúc 2 bảng AR_SUPERVISOR và AR_SUPERVISOR_INFO tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa. và chức năng thêm, sửa, xóa sẽ tác động vào bảng AR_SUPERVISOR và AR_SUPERVISOR_INFO, việc thêm dữ liệu vào bảng AR_SUPERVISOR tức lấy thoogn tin nhân viên để thêm vào. lưu ý trường AR_SUPERVISOR_NO của bảng AR_SUPERVISOR_INFO khi tạo mới là tự động tăng với giá trị AR_SUPERVISOR_NO_SEQ.NEXTVAL

căn cứ vào hình ảnh tham khảo hãy Tạo cho tôi một file viewDepartManagerList.html - Chốt công nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_DEPARTMENT_MANAGE với các trường tham khảo từ hình ảnh. mặc định khi hiển thị dữ liệu sẽ hiển thị theo ngày hiện tại với điều kiện LOCK_DATE, với cái giá trị tương ứng LOCK_ATTEN_FLAG - Nghỉ phép - Ca ngày, LOCK_ATTEN_NIGHT_FLAG - Nghỉ phép - Ca đêm, LOCK_OT_FLAG - Tăng ca - Ca ngày, LOCK_OT_NIGHT_FLAG - Tăng ca - Ca đêm, LOCK_ATTEN_EX_FLAG - Bất thường - Ca ngày, LOCK_ATTEN_EX_NIGHT_FLAG - Bất thường - Ca đêm, LOCK_ATTEN_ANNUAL_FLAG - Nghỉ phép năm - Ca ngày, LOCK_ATTEN_ANNUAL_NIGHT_FLAG - Nghỉ phép năm - Ca đêm

ở đây hãy thêm chức năng khi bấm vào sẽ sổ ra danh sách phòng ban có phân cấp (dữ liệu phòng ban được lấy từ bảng HR_DEPARTMENT và bảng AR_SUPERVISOR_INFO thông qua trường DEPTNO và PERSON_ID = #{adminID}), trên đầu mỗi tên phòng ban sẽ có nút tick chọn, khi tick chọn thì sẽ truyền Tên và mã phòng ban được tick vào Input, khi bấm tìm kiếm thì sẽ dựa vào các mã phòng ban đó để tìm. 

căn cứ vào cấu trúc của viewArItem.html hãy Tạo cho tôi một file viewDynamicGroup.html - Nhân viên đặc biệt nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_EMP_GROUP với các trường tham khảo từ hình ảnh. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID. khi thêm mới hoặc sửa, thì giá trị của GROUP_NO luôn là 80000084


căn cứ vào cấu trúc của viewDynamicGroup.html hãy Tạo cho tôi một file addEmpShiftView.html - Xếp ca làm việc nằm trong module ar/attendanceMintenance. dữ liệu lấy từ bảng AR_SCHEDULE_HAE với các trường tham khảo từ hình ảnh. mặc định khi hiển thị dữ liệu sẽ hiển thị theo tháng hiện tại với điều kiện AR_DATE_STR. dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. Có đầy đủ chức năng thêm mới, sửa, xóa, phân trang, xuất excel. lưu ý trường PK_NO của bảng AR_SCHEDULE_HAE khi tạo mới là tự động tăng với giá trị AR_SCHEDULE_SEQ.NEXTVAL. dữu liệu của trường SHIFT_NO lấy từ /ar/attendanceSettings/api/shift. Dữ liệu của trường TYPEID lấy thông qua data-parent-code="1439"

Thêm cho tôi chức năng thêm mới dữ liệu thông qua việc upload file excel. Trước hết tạo chức năng tải file excel mẫu, sau đó tạo chức năng upload file excel. Với chức năng tạo file excel mẫu, thì tạo ra một file excel với các cột tham khảo từ hình ảnh, với dữ liệu là dữ liệu mẫu. Lưu ý cột D - Date type chính là lấy danh sách từ data-parent-code="1439", khi chọn một giá trị ở cột D - Date type thì cột E - Date type code sẽ tự động điền giá trị code tương ứng. tương tự với cột F - Shift chính là lấy danh sách từ /ar/attendanceSettings/api/shift, khi chọn một giá trị ở cột F - Shift thì cột G - Shift code sẽ tự động điền giá trị code tương ứng. Khi thực hiện upload file excel, thì sẽ hiển thị một modal để chọn file excel, sau khi chọn file excel, thì dựa vào dữ liệu trong file excel để Insert vào bảng AR_SCHEDULE_HAE. Lưu ý khi Insert vào bảng AR_SCHEDULE_HAE, thì giá trị của PK_NO là tự động tăng với giá trị AR_SCHEDULE_SEQ.NEXTVAL, giá trị của SHIFT_NO là lấy từ cột G - Shift, giá trị của TYPEID là lấy từ cột E - Date type code, giá trị của AR_DATE_STR là lấy từ cột C - Date, giá trị của PERSON_ID là lấy từ cột A - Employee ID (lấy PERSON_ID tương ứng với EMPID trong bảng HR_EMPLOYEE), giá trị của REMARK là lấy từ cột J - Remark. các chức năng liên quan đến tải file excel mẫu và upload file excel hãy để ở module sy/excel cho mực đích dùng chung, về sau ở các giao diện khác muốn sử dụng đến chức năng này thì sẽ gọi đến module sy/excel

nếu tôi đã có sẵn file mẫu tên là AR_SCHEDULE_HAE_Template.xlsx nằm trong thư mục src/main/resources/templates. và nội dung cả file mẫu đã có sẵn dòng tiêu đề (dòng 1), đã có sẵn 2 sheet Template và TemplateCode. thì đoạn này sẽ sửa lại code như thế nào.

căn cứ vào viewCompanyCalendar.html hãy Tạo cho tôi một file viewClassCalendar.html - Lịch nhóm ca nằm trong module ar/attendanceSettings. dữ liệu lấy từ bảng AR_CALENDER_GROUP với điều kiện CPNY_ID = #{cpnyId}. mặc định khi hiển thị lịch nhóm ca sẽ hiển thị theo tháng năm hiện tại, Dữ liệu của trường GROUP_ID lấy thông qua data-parent-code="400223", Khi bấm thêm mới sẽ lựa chọn ngày bắt đầu - START_DATE và ngày kết thúc - END_DATE (định dạng DD-MM-YYYY), lựa chọn nhóm ca - GROUP_ID, lựa chọn Ca làm việc - WORK_SHIFT, lựa chọn Ca nghỉ ngơi - REST_SHIFT, danh sách ca lấy từ /ar/attendanceSettings/api/shift. khi bấm lưu thì sẽ gọi đến Procedure AR_ADD_CALENDER_DATE_BANCI_P(to_date(#{START_DATE, jdbcType=VARCHAR},'DD-MM-YYYY'), to_date(#{END_DATE, jdbcType=VARCHAR},'DD-MM-YYYY'), #{WORK_SHIFT, jdbcType=VARCHAR}, #{REST_SHIFT, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{GROUP_ID, jdbcType=VARCHAR}, #{adminIP, jdbcType=VARCHAR}, #{adminID, jdbcType=VARCHAR}). Có thể bấm vào ngày để sửa. lưu ý khi sửa, thì chính là sửa dữ liệu trong bảng AR_CALENDER_GROUP, đồng thời xóa dữ liệu trong bảng ar_calender_group_history, sau đó thêm dữ liệu vào bảng ar_calender_group_history thông qua bảng AR_CALENDER_GROUP thông qua trường AR_DATE_STR và CPNY_ID và GROUP_ID.

căn cứ vào viewCompanyCalendar.html hãy Tạo cho tôi một file viewEmpCalendar.html - Lịch cá nhân nằm trong module ar/attendanceSettings. dữ liệu lấy từ câu lệnh SELECT a.DDATE, a.IYEAR, a.IMONTH, a.IDAY, a.IWEEK, a.WORKDAYFLAG, a.DDATE_STR, a.CPNY_ID, GET_AR_SHIFTNO(#{personId}, a.DDATE_STR, a.CPNY_ID) as SHIFT_NO, GET_AR_DATETYPE_DETAIL(#{personId}, a.DDATE_STR, a.CPNY_ID) as TYPEID, a.OVERTYPEID, a.TYPEID_DEFAULT, a.STATUTORY_FLAG, a.REMARK, TO_CHAR(a.DDATE, 'YYYY-MM-DD') AS DDATE_FORMATTED, GET_GLOBAL_NAME(GET_AR_SHIFTNO(#{personId}, a.DDATE_STR, a.CPNY_ID), #{lang}) AS SHIFT_NAME, GET_GLOBAL_NAME(GET_AR_DATETYPE_DETAIL(#{personId}, a.DDATE_STR, a.CPNY_ID), #{lang}) AS TYPEID_NAME, GET_GLOBAL_NAME(a.OVERTYPEID, #{lang}) AS OVERTYPEID_NAME, GET_GLOBAL_NAME(a.TYPEID_DEFAULT, #{lang}) AS TYPEID_DEFAULT_NAME FROM AR_CALENDER a WHERE a.DDATE BETWEEN GET_AR_START_DATE(#{iyear}||#{imonth}, a.CPNY_ID,'') AND GET_AR_END_DATE(#{iyear}||#{imonth}, a.CPNY_ID,'')#{imonth}   AND a.CPNY_ID = #{cpnyId}   ORDER BY a.IDAY. mặc định khi hiển thị lịch cá nhân sẽ hiển thị theo tháng năm hiện tại và người đang đăng nhập, bên cạnh phần chọn tháng năm là phần chọn nhân viên. Có thể bấm vào ngày để sửa lịch. lưu ý khi sửa, thì chính là sửa dữ liệu trong bảng AR_SCHEDULE_HAE, nếu trong bảng AR_SCHEDULE_HAE chưa có dữ liệu thì thêm mới, nếu đã có dữ liệu thì sửa mới.


căn cứ vào cấu trúc của addEmpShiftView.html hãy Tạo cho tôi một file viewArShiftGroupList.html - Lịch sử ca làm cá nhân nằm trong module /ess/deptEmpAtt. dữ liệu lấy từ bảng AR_SHIFTGROUP_MANAGEMENT với các trường tham khảo từ hình ảnh.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. dữ liệu của trường SHIFT_NO lấy thông qua data-parent-code="400223", BEFOR_SHIFT_NO là Ca làm việc trước khi thay đổi, SHIFT_NO là Ca làm việc sau khi thay đổi, START_DATE là ngày bắt đầu thay đổi. Khi query ra dữ liệu thì có thể trực tiếp thay đổi được trên các dòng dữ liệu, các cột có thể thay đổi được là  SHIFT_NO, START_DATE, REMARK. khi bấm lưu thì sẽ gọi đến Procedure AR_SHIFTGROUP_CHANGE_P(#{PERSON_ID, jdbcType=VARCHAR}, #{BEFOR_SHIFT_NO, jdbcType=VARCHAR}, #{SHIFT_NO, jdbcType=VARCHAR}, #{START_DATE, jdbcType=VARCHAR}, #{REMARK, jdbcType=VARCHAR}, #{adminID, jdbcType=VARCHAR}, #{adminIP, jdbcType=VARCHAR}). START_DATE có định dạng là YYYY-MM-DD.

căn cứ vào cấu trúc của viewArShiftGroupList.html hãy Tạo cho tôi một file viewApplyAttManagentByAnyApproverList.html - Quản lý nghỉ phép nằm trong module /ar/attendanceMintenance. dữ liệu lấy từ bảng ess_leave_apply_tb với các trường tham khảo từ hình ảnh.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. dữ liệu của trường LEAVE_TYPE_CODE lấy thông qua data-parent-code="21", trường LEAVE_TYPE_NO có giá trị mặc định là 21. Khi query ra dữ liệu thì có thể trực tiếp thay đổi được trên các dòng dữ liệu, các cột có thể thay đổi được là  LEAVE_FROM_TIME, LEAVE_TO_TIME, LEAVE_REASON, LEAVE_TYPE_CODE. Thông tin người phê duyệt được lấy từ cấu lệnh SELECT PKG_AFFIRM_EMAIL.GET_AFFIRMOR_LIST_IMPROVE(#{LEAVE_TYPE_NO, jdbcType=VARCHAR}, #{PERSON_ID, jdbcType=VARCHAR}, #{LEAVE_TYPE_CODE, jdbcType=VARCHAR}, #{APPLY_LENGTH, jdbcType=VARCHAR}, #{lang}) AFFIRM_STR FROM DUAL. câu lệnh này sẽ cho ra một câu lệnh SQL để lấy ra thông tin người phê duyệt, khi thực hiện cấu lệnh SQL thì sẽ cho ra thông tin người duyệt giống như hình. khi lưu thông tin phê duyệt thì chạy procedure PKG_AFFIRM_EMAIL.PR_DELETE_LEAVE_CONFIRM(#{APPLY_NO, jdbcType=VARCHAR}, #{message,jdbcType=VARCHAR,mode=OUT}). sau đó thêm thông tin người duyệt vào trong bảng SY_AFFIRM_EMAIL với các trường tham khảo từ hình ảnh, người phê duyệt đầu tiên với AFFIRM_LEVEL = 0, AFFIRM_TYPE = 4, APPLY_TYPE_NO = 21, APPLY_AFFIRM_FLAG  = 14014306, APPLY_FLAG = 0, AFFIRMOR_ID = PERSON_ID của bảng ess_leave_apply_tb. những người phê duyệt tiếp theo chính là thông tin được lấy từ câu lệnh SQL trong phần AFFIRM_STR, với AFFIRM_TYPE = 1. lưu ý trường SEQ_NO của bảng SY_AFFIRM_EMAIL khi tạo mới là tự động tăng với giá trị ESS_AFFIRM_SEQ.NEXTVAL, APPLY_NO bằng với APPLY_NO của bảng ess_leave_apply_tb. giá trị APPLY_NO khi tạo mới là ESS_APPLY_SEQ.NEXTVAL.

hãy tạo một module /sy/syAffirm. dữ liệu lấy từ bảng SY_AFFIRM_EMAIL với các trường tham khảo từ hình ảnh. với đầy đủ các hàm liên quan đến thêm, sửa, xóa, tìm kiếm dữ liệu của bảng SY_AFFIRM_EMAIL. 

khi bấm đây sẽ hiện lên modal là thông tin phê duyệt của đơn đó, bao gồm các thông tin như hình ảnh.

căn cứ vào cấu trúc của addEmpShiftView.html hãy Tạo cho tôi một file viewAttendanceManagentForSerchInfoList.html - Tra cứu chấm công nằm trong module /ar/attendanceMintenance. dữ liệu lấy từ bảng AR_DETAIL_HAE với các trường tham khảo từ hình ảnh.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. DEPT_NAME - Tên phòng ban, POST_GRADE_NAME - Chức vụ. với các điều kiện truy vấn kèm theo là AND ITEM_NO NOT IN ('90000295',
                          '90000296',
                          '90000297',
                          '90000298',
                          '90000299',
                          '90000300',
                          '90000301')
   AND EXISTS (SELECT *
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HR_EMPLOYEE.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}). mặc định khi vòa giao diện này thì truy xuất những dữ liệu có AR_DATE_STR nằm trong khoảng ngày hiện tại, và trước ngầy hiện tại 1 ngày. có chức năng xuất excel. ở phần điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), Thời gian (Ngày bắt đầu, Ngày kết thúc), Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), Ca làm việc - SHIFT_NO(danh sách ca lấy từ /ar/attendanceSettings/api/shift), Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM thông qua bảng AR_ITEM_PARAM kết hợp cùng bảng AR_ITEM với điều kiện AR_ITEM_PARAM.ITEM_NO = AR_ITEM.ITEM_NO AND AR_ITEM.ITEM_GROUP_CODE != '1433')

tương tự tạo luôn tiếp cho tôi một file viewSearchApplyOtInfoList.html - Tra cứu tăng ca nằm trong module /ar/attendanceMintenance. dữ liệu lấy từ bảng AR_DETAIL_HAE.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. DEPT_NAME - Tên phòng ban, POST_GRADE_NAME - Chức vụ. với các điều kiện truy vấn kèm theo là AND ITEM_NO IN ('90000295',
                          '90000296',
                          '90000297',
                          '90000298',
                          '90000299',
                          '90000300',
                          '90000301')
   AND EXISTS (SELECT *
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HR_EMPLOYEE.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}). mặc định khi vòa giao diện này thì truy xuất những dữ liệu có AR_DATE_STR nằm trong khoảng ngày hiện tại, và trước ngầy hiện tại 1 ngày. có chức năng xuất excel. ở phần điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), Thời gian (Ngày bắt đầu, Ngày kết thúc), Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), Ca làm việc - SHIFT_NO(danh sách ca lấy từ /ar/attendanceSettings/api/shift), Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM thông qua bảng AR_ITEM_PARAM kết hợp cùng bảng AR_ITEM với điều kiện AR_ITEM_PARAM.ITEM_NO = AR_ITEM.ITEM_NO AND AR_ITEM.ITEM_GROUP_CODE = '1433')

khi bấm đây sẽ hiện lên modal là thông tin phê duyệt của đơn đó, bao gồm các thông tin như hình ảnh. với phần thoogn tin phê duyệt lấy từ câu lệnh SELECT * FROM (SELECT A.SEQ, A.AFFIRM_TYPE, DECODE(A.AFFIRM_TYPE,'1','审核','2','协议','3','通告','4','企案','审核') AFFIRM_TYPE_NAME, A.APPLY_NO, A.APPLY_TYPE, A.APPLY_FLAG, A.APPLY_PERSON_ID, A.AFFIRM_PERSON_ID, A.TITLE, A.AFFIRM_LEVEL, A.AFFIRM_FLAG, A.AFFIRM_URL, A.APPLY_TYPE_CODE, A.APPLY_PERSON_INFO, A.ACTIVITY, DECODE(A.AFFIRM_TYPE,'3',DECODE(A.AFFIRM_FLAG,'0','未通告','已通告'),4,DECODE(A.AFFIRM_FLAG,'2','取消','提交'),DECODE(A.AFFIRM_FLAG,'0','未审批',1,'已通过','已否决')) AFFIRM_FLAG_NAME, HR.LOCAL_NAME || '/' || GET_CODE_NAME(HR.POST_GRADE_NO,#{lang}) AFFIRM_NAME, GET_DEPT_NAME(HR.DEPTNO,#{lang}) DEPTNAME, A.APPLY_AFFIRM_FLAG APPLY_AFFIRM_FLAG_NO, GET_CODE_NAME(A.APPLY_AFFIRM_FLAG,#{lang}) APPLY_AFFIRM_FLAG, TO_CHAR(A.AFFIRM_DATE,'DD/MM/YYYY HH24:MI:SS') UPDATE_DATE, A.AFFIRM_CONTENT FROM SY_AFFIRM_EMAIL A, HR_EMPLOYEE HR WHERE A.AFFIRM_PERSON_ID = HR.PERSON_ID AND A.APPLY_NO = #APPLY_NO# AND A.APPLY_TYPE = #APPLY_TYPE# AND A.APPLY_AFFIRM_FLAG <> '14014310' UNION ALL SELECT '' AS SEQ, '' AS AFFIRM_TYPE, '' AS AFFIRM_TYPE_NAME, B.APPLY_NO AS APPLY_NO, '' AS APPLY_TYPE, '' AS APPLY_FLAG, '' AS APPLY_PERSON_ID, '' AS AFFIRM_PERSON_ID, '' AS TITLE, 100 AS AFFIRM_LEVEL, TO_CHAR(B.CONFIRM_FLAG) AS AFFIRM_FLAG, '' AS AFFIRM_URL, '' AS APPLY_TYPE_CODE, '' AS APPLY_PERSON_INFO, '' AS ACTIVITY, '' AS AFFIRM_FLAG_NAME, get_local_name_by_personid(B.CONFIRM_BY, #{lang}) AS AFFIRM_NAME, 'HR' AS DEPTNAME, '' AS APPLY_AFFIRM_FLAG_NO, '' AS APPLY_AFFIRM_FLAG, TO_CHAR(B.CONFIRM_DATE, 'DD/MM/YYYY HH24:MI:SS') AS UPDATE_DATE, B.HR_COMMENT AS AFFIRM_CONTENT  FROM   ESS_LEAVE_APPLY_TB B    WHERE B.APPLY_NO = #APPLY_NO# )  ORDER BY to_number(AFFIRM_LEVEL); Thoogn tin nhân viên và Thông tin xin phép lấy dữ liệu từ cấu lệnh SELECT HE.EMPID, HE.LOCAL_NAME, HE.PERSON_ID, HE.DEPTNO, HE.CPNY_ID, ESS.APPLY_NO, ESS.LEAVE_TYPE_CODE, GET_DEPT_NAME(HE.DEPTNO, #{lang}) DEPTNAME, get_global_name(ESS.LEAVE_TYPE_CODE, #{lang}) LEAVE_TYPE_NAME, TO_CHAR(ESS.LEAVE_FROM_TIME, 'DD/MM/YYYY  HH24:MI') LEAVE_FROM_TIME, TO_CHAR(ESS.LEAVE_TO_TIME, 'DD/MM/YYYY  HH24:MI') LEAVE_TO_TIME, ESS.APPLY_LENGTH LEAVE_LENGTH, AR_GET_DAY_HOURS(HE.PERSON_ID,TO_CHAR(ESS.LEAVE_FROM_TIME,'YYYY/MM/DD')) DAY_HOURS, ESS.LEAVE_REASON APPLY_REMARK, ESS.AFFIRM_FLAG, get_global_name(ESS.AFFIRM_FLAG, #{lang}) AFFIRM_FLAG_NAME, get_global_name(HE.POST_GRADE_NO, #{lang}) POST_GRADE_NAME, TO_CHAR(ESS.CREATE_DATE, 'YYYY/MM/DD HH24:MI:SS') CREATE_DATE, ESS.DETAIL_TYPE, get_global_name(ESS.DETAIL_TYPE, #{lang}) DETAIL_TYPE_NAME, ESS.ACTIVITY, ESS.CONFIRM_FLAG FROM ESS_LEAVE_APPLY_TB ESS, HR_EMPLOYEE HE WHERE ESS.PERSON_ID = HE.PERSON_ID AND ESS.APPLY_NO = #APPLY_NO:VARCHAR#

Dựa vào viewAttendanceManagentForSerchInfoList.html hãy tạo cho tôi một file viewAttendanceExForBatchInfoList.html - Nghỉ bất thường nằm trong module /ess/infoApplyAttendance. Giao diện này để lấy ra những người có dữ liệu quẹt thẻ bất thường (không đúng với ca làm việc),  dữ liệu lấy từ bảng AR_DETAIL_HAE.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. DEPT_NAME - Tên phòng ban, POST_GRADE_NAME - Chức vụ. với câu lệnh lấy dữ liệu là SELECT           TO_CHAR(TO_DATE(EC.AR_DATE_STR,'YYYY/MM/DD'),'DD/MM/YYYY') AR_DATE_STR,           TO_CHAR(TO_DATE(REPLACE(EC.AR_DATE_STR,'/','.'),'YYYY.MM.DD'),'DD.MM.YYYY') DATE_STR,        EC.PK_NO APPLY_NO,        EC.PERSON_ID,        TO_CHAR(EC.FROM_TIME,'DD-MM-YYYY HH24:MI') FROM_DATE,        TO_CHAR(EC.TO_TIME,'DD-MM-YYYY HH24:MI') TO_DATE,        EC.QUANTITY WORK_HOUR,        EC.ITEM_NO,        get_global_name(EC.ITEM_NO,#{lang}) ITEM_NO_NAME,        TO_CHAR(EC.CREATE_DATE,'DD-MM-YYYY') CREATE_DATE,        get_local_name_by_personid(EC.CREATED_BY,#{cpnyId}) CREATED_NAME,        TO_CHAR(EC.UPDATE_DATE,'DD-MM-YYYY') UPDATE_DATE,        get_local_name_by_personid(EC.UPDATED_BY,#{cpnyId}) UPDATED_NAME,        GET_AR_MAC_TIME(EC.PERSON_ID,EC.AR_DATE_STR,'IN') INDOOR_TIME,        GET_AR_MAC_TIME(EC.PERSON_ID,EC.AR_DATE_STR,'OUT') OUTDOOR_TIME,        TO_CHAR(TO_DATE(GET_AR_SHIFT_START_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'DD/MM/YYYY') SHIFT_START_YEAR,        TO_CHAR(TO_DATE(GET_AR_SHIFT_START_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'HH24') SHIFT_START_HH,        TO_CHAR(TO_DATE(GET_AR_SHIFT_START_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'MI') SHIFT_START_MI,        TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'DD/MM/YYYY') SHIFT_END_YEAR,        TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'HH24') SHIFT_END_HH,        TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(EC.PERSON_ID,EC.AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'MI') SHIFT_END_MI,        HR.EMPID,        HR.LOCAL_NAME,        get_dept_name(HR.DEPTNO,#{lang}) DEPT_NAME,        GET_UPDATED_INFO(EC.CREATED_BY) CREATED_BY,             GET_UPDATED_INFO(EC.UPDATED_BY) UPDATED_BY,             LOCK_YN      FROM AR_DETAIL_HAE EC,HR_EMPLOYEE HR      WHERE EC.PERSON_ID = HR.PERSON_ID       AND HR.PERSON_ID NOT LIKE '111111%'         AND EC.AR_DATE_STR NOT IN        (SELECT AR_DATE_STR           FROM ESS_CARD_APPLY_TB CARD          WHERE AFFIRM_FLAG IN ('14014306','14014307','14014308') AND CARD.CONFIRM_FLAG <> '2' AND  PERSON_ID = EC.PERSON_ID)      AND EC.ITEM_NO IN ('141443','141441','141442','14015448')      AND EC.AR_DATE_STR < TO_CHAR(SYSDATE,'YYYY/MM/DD')      AND (             EXISTS             (SELECT B1.DEPTID                      FROM HR_DEPARTMENT B1                     WHERE B1.DEPTNO = HR.DEPTNO                     START WITH B1.DEPTNO in                                (SELECT HRD.DEPTID                                   FROM HR_DEPARTMENT HRD                                  WHERE HRD.MANAGER_EMP_ID = #{adminID})                    CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO                UNION                SELECT AR_SUPERVISOR_INFO.DEPTNO                  FROM AR_SUPERVISOR_INFO                 WHERE AR_SUPERVISOR_INFO.DEPTNO = HR.DEPTNO                   AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}                    ) )         AND               EC.AR_DATE_STR BETWEEN TO_CHAR(TO_DATE(#{fromDate},'DD/MM/YYYY'),'YYYY/MM/DD') AND TO_CHAR(TO_DATE(#{toDate},'DD/MM/YYYY'),'YYYY/MM/DD')             ORDER BY EC.AR_DATE_STR DESC     
. mặc định khi vào giao diện này thì truy xuất những dữ liệu có AR_DATE_STR nằm trong tuần hiện tại. có chức năng xuất excel. ở phần điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), Thời gian (Ngày bắt đầu, Ngày kết thúc), Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), Ca làm việc - SHIFT_NO(danh sách ca lấy từ /ar/attendanceSettings/api/shift), Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM gồm <option value=""><!--请选择-->Lựa chọn</option>
							<option value="141443"><!--旷工-->Nghỉ không phép</option>
							<option value="141442"><!--早退-->Về sớm</option>
							<option value="141441"><!--迟到-->Đến muộn</option>
							<option value="14015448"><!--漏卡-->Quên quẹt thẻ</option>). Ngay từ từng dòng dữ liệu được select ra, có thể điền trực tiếp ngày giờ ra vào thục tế. tham khảo giao diện từ hình ảnh

khi dữ liệu được tick chọn, thời gian ra vào được điền, thì khi bấm vào Xin phép, sẽ đem hết các dòng dữ liệu được tick chọn để xử lý. áp dụng tương tự như khi bấm Lưu - lvSaveLine ở viewApplyAttManagentByAnyApproverList.html. chỉ khác là khi xin phép thì thêm mới vào bảng ESS_CARD_APPLY_TB với các trường như ảnh tham khảo. giá trị SEQ khi tạo mới là ESS_APPLY_SEQ.NEXTVAL, còn APPLY_NO được lấy từ AR_MAC_RECORDS_APPLY_SEQ.NEXTVAL. có 1 thay đổi là tApplyTypeCode = 218197 chứ không phải là 21

căn cứ vào cấu trúc của viewAttendanceManagentForSerchInfoList.html hãy Tạo cho tôi một file viewCheckAttencetanceExForBatchList.html - Tra cứu nghỉ bất thường nằm trong module /ess/infoApplyAttendance. dữ liệu lấy từ bảng ESS_CARD_APPLY_TB .dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. DEPT_NAME - Tên phòng ban, POST_GRADE_NAME - Chức vụ. với các điều kiện truy vấn kèm theo là AND EXISTS (SELECT B1.DEPTID
          FROM HR_DEPARTMENT B1
         WHERE B1.DEPTNO = HR.DEPTNO
         START WITH B1.DEPTNO in
                    (SELECT HRD.DEPTID
                       FROM HR_DEPARTMENT HRD
                      WHERE HRD.MANAGER_EMP_ID = #{adminID})
        CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO
        UNION
        SELECT AR_SUPERVISOR_INFO.DEPTNO
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HR.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}). mặc định khi vòa giao diện này thì truy xuất những dữ liệu có AR_DATE_STR nằm trong tháng hiện tại. có chức năng xuất excel. ở phần điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), Thời gian (Ngày bắt đầu, Ngày kết thúc), Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), Ca làm việc - SHIFT_NO(danh sách ca lấy từ /ar/attendanceSettings/api/shift), Loại nghỉ phép - ITEM_NO (lấy ra danh sách ITEM gồm <option value=""><!--请选择-->Lựa chọn</option>
							<option value="141443"><!--旷工-->Nghỉ không phép</option>
							<option value="141442"><!--早退-->Về sớm</option>
							<option value="141441"><!--迟到-->Đến muộn</option>
							<option value="14015448"><!--漏卡-->Quên quẹt thẻ</option>)

khi bấm đây sẽ hiện lên modal là thông tin phê duyệt của đơn đó cách hiển thị giao diện và lấy dữ liệu tương tụ như khi bấm vào lvOpenApplyDetail ở giao diện viewApplyAttManagentByAnyApproverList. khác là thay vì lấy dữ liệu từ bảng ESS_LEAVE_APPLY_TB thì sẽ lấy từ bảng ESS_CARD_APPLY_TB

tạo cho tôi một giao diện viewArDetailCalculate.html - Tính toán chi tiết, nằm trong module ar/attendanceMintenance. có các trường nhập liệu gồm, Phân loại tính toán - caltype, Thời gian tính toán - fromDate, toDate, Phòng ban/Nhân viên. và 1 nút "Tính toán". Ở mục "Phân loại tính toán"  Nếu chọn "Nhân viên" thì thì mục Phòng ban/Nhân viên sẽ hiển thị để lựa chọn nhân viên - sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên - personId. Nếu chọn "Phòng ban" thì mục Phòng ban/Nhân viên sẽ hiển thị Phòng ban - deptId (tham khảo viewDepartManagerList.html để lấy ra list phòng ban) và bên cạnh sẽ hiển thị dạng check box "Bao gồm phòng ban con" - sonDeptFlag. Khi bấm nút "Tính toán" sẽ gọi Procedure với các tham số  AR_DETAIL_CAL_P(#fromDate:VARCHAR#, #toDate:VARCHAR#, #caltype:VARCHAR#, null, #deptId:VARCHAR#, #sonDeptFlag:VARCHAR#, #cpnyId:VARCHAR#, 'ALL',#personId,jdbcType=VARCHAR,mode=INOUT#)


tương tự như viewApplyAttManagentByAnyApproverList.html hãy Tạo cho tôi một file viewApplyOtManagentByAnyApproverList.html - Quản lý tăng ca nằm trong module /ar/attendanceMintenance. dữ liệu lấy từ bảng ess_apply_ot với các trường tham khảo từ hình ảnh.dữ liệu kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. dữ liệu của trường LEAVE_TYPE_CODE lấy thông qua data-parent-code="21", trường LEAVE_TYPE_NO có giá trị mặc định là 21. Khi query ra dữ liệu thì có thể trực tiếp thay đổi được trên các dòng dữ liệu, các cột có thể thay đổi được là APPLY_OT_DATE,  OT_FROM_TIME, OT_TO_TIME, APPLY_OT_REMARK. Thông tin người phê duyệt được lấy từ cấu lệnh SELECT PKG_AFFIRM_EMAIL.GET_AFFIRMOR_LIST_IMPROVE(#{LEAVE_TYPE_NO, jdbcType=VARCHAR}, #{PERSON_ID, jdbcType=VARCHAR}, #{LEAVE_TYPE_CODE, jdbcType=VARCHAR}, #{APPLY_LENGTH, jdbcType=VARCHAR}, #{lang}) AFFIRM_STR FROM DUAL. câu lệnh này sẽ cho ra một câu lệnh SQL để lấy ra thông tin người phê duyệt, khi thực hiện cấu lệnh SQL thì sẽ cho ra thông tin người duyệt giống như hình. khi lưu thông tin phê duyệt thì chạy procedure PKG_AFFIRM_EMAIL.PR_DELETE_OT_CONFIRM(#{APPLY_NO, jdbcType=VARCHAR}, #{message,jdbcType=VARCHAR,mode=OUT}). sau đó thêm thông tin người duyệt vào trong bảng SY_AFFIRM_EMAIL, người phê duyệt đầu tiên với AFFIRM_LEVEL = 0, AFFIRM_TYPE = 4, APPLY_TYPE_NO = 31, APPLY_AFFIRM_FLAG  = 14014306, APPLY_FLAG = 0, AFFIRMOR_ID = PERSON_ID của bảng ess_apply_ot. những người phê duyệt tiếp theo chính là thông tin được lấy từ câu lệnh SQL trong phần AFFIRM_STR, với AFFIRM_TYPE = 1. lưu ý trường SEQ_NO của bảng SY_AFFIRM_EMAIL khi tạo mới là tự động tăng với giá trị ESS_AFFIRM_SEQ.NEXTVAL, APPLY_NO bằng với APPLY_NO của bảng ess_apply_ot. giá trị APPLY_NO khi tạo mới là ESS_APPLY_SEQ.NEXTVAL.

dựa vào cách thức upload excel ở giao diện viewApplyAttManagentByAnyApproverList. hãy tạo cho tôi một chức năng tương tự ở viewApplyOtManagentByAnyApproverList với templateName=OvertimeApply_add_Template. cái trường cần upload căn cứ vào file excel như hình. dữ liệu khi upload lên sẽ được thêm vào bảng ESS_OT_APPLY_TB_EXCEL_TEMP (với các trường tham khảo ở hình). procedure sẽ gọi đến PKG_ESS_OT_EXCEL_IMP.PR_VALID_ESS_OT_DATA(
            #{adminID, jdbcType=VARCHAR, mode=IN},
            #{cpnyId, jdbcType=VARCHAR, mode=IN},
            #{message, jdbcType=VARCHAR, mode=OUT}
        ) khi upload xong thì mở ra tab viewImportOtTempList nằm trong module /ar/attendanceMintenance/

thêm cho tôi 1 cột Tổng giờ tăng ca - OT_TOTAIL_MONTH , và cột Giới hạn tăng ca - OT_LIMIT 

căn cứ vào cấu trúc của addressSearch.html hãy Tạo cho tôi một file ManageEmpPositionInfoList.html - Danh sách nhân viên nằm trong module /ess/viewDept. dữ liệu lấy từ cấu lệnh SELECT H.EMPID EMPID_ID,         H.LOCAL_NAME,         H.PERSON_ID,         H.PERSON_SUPPLIER_COMPANY,         get_global_name(HP.NATIONALITY_CODE, #{lang}) NATIONALITY_CODE,         get_global_name(H.POST_FAMILY, #{lang}) POST_FAMILY,         get_global_name(H.DUTY_NO, #{lang}) DUTY_NAME,         get_global_name(H.POSITION, #{lang}) POSITION,         get_global_name(H.EMPLOYEE_OWNED, #{lang}) EMPLOYEE_OWNED,          GET_DEPT_NAME(H.DEPTNO,#{lang}) DEPTNAME,         D.ORG_NAME_LOCAL,         GET_UPDATED_INFO(D.MANAGER_EMP_ID) MANAGER_EMP_NAME,         get_global_name(H.DUTY_NO, #{lang}) DUTY_NO,         GET_GLOBAL_NAME(H.POST_GRADE_NO,#{lang}) POST_GRADE_NO,         GET_GLOBAL_NAME(H.MAIN_BUSINESS,#{lang}) MAIN_BUSINESS,         TO_CHAR(H.DATE_STARTED,'DD/MM/YYYY')DATE_STARTED,         get_local_name_personid (CASE WHEN D.MANAGER_EMP_ID = H.PERSON_ID THEN (SELECT HRD.MANAGER_EMP_ID FROM HR_DEPARTMENT HRD WHERE HRD.DEPTNO=D.PARENT_DEPT_NO)ELSE D.MANAGER_EMP_ID END           ,#{cpnyId})         MANAGER_NAME,         GET_GLOBAL_NAME(H.POSITION_NO,#{lang}) POSITION_NAME,         GET_GLOBAL_NAME(H.EMP_OFFICE,#{lang}) EMP_OFFICE_NAME    FROM HR_EMPLOYEE H,HR_DEPARTMENT D,SY_CODE SC,HR_PERSONAL_INFO HP          WHERE H.CPNY_ID = #{cpnyId}       AND H.DEPTNO=D.DEPTNO(+)   AND HP.PERSON_ID = H.PERSON_ID   AND H.POST_GRADE_NO = SC.CODE_NO(+)   AND H.EMPID NOT LIKE '111111%'           AND               EXISTS       (SELECT B1.DEPTID                FROM HR_DEPARTMENT B1               WHERE B1.DEPTNO = D.DEPTNO               START WITH B1.DEPTNO in                          (SELECT HRD.DEPTID                             FROM HR_DEPARTMENT HRD                            WHERE HRD.MANAGER_EMP_ID = #{adminID})              CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO          UNION          SELECT AR_SUPERVISOR_INFO.DEPTNO          FROM AR_SUPERVISOR_INFO         WHERE AR_SUPERVISOR_INFO.DEPTNO = D.DEPTNO           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}              )                                       ORDER BY H.EMPID ASC . Điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, 
Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), 
Thời gian vòa làm - DATE_STARTED (Ngày bắt đầu, Ngày kết thúc), 
Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), 
Loại nhân viên - EMP_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="13864"), 
Trạng thái - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"), 
Quốc tịch - NATIONALITY_CODE (dữ liệu lấy lấy thông qua data-parent-code="870"), Có chức năng xuất excel, khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết của nhân viên đó.


Tạo thêm cho tôi một file viewDeptPersonalInfoManageList.html - Quản lý thông tin nhân sự phòng ban nằm trong module /ess/viewDept. dữ liệu lấy vẫn lấy gióng như ManageEmpPositionInfoList.html nhưng hiển thi dữ liệu lên thì tham khảo hình ảnh để hiển thị những trường cần thiết (mục đích là hiển thi của nhân viên ở phía bên trái). khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết của nhân viên đó.

căn cứ vào cấu trúc của ManageEmpPositionInfoList.html hãy Tạo cho tôi một file viewManageEvsResultEmpList.html - Thông tin đánh giá nằm trong module /ess/viewDept. dữ liệu lấy từ cấu lệnh SELECT EMPID,               LOCAL_NAME,               GET_DEPT_NAME(DEPTNO,#{lang})DEPT_NAME,              EVS_YEAR,                MAX(EVS_MONTH1) EVS_MONTH1,                MAX(EVS_MONTH2) EVS_MONTH2,                MAX(EVS_MONTH3) EVS_MONTH3,                MAX(EVS_MONTH4) EVS_MONTH4,                MAX(EVS_MONTH5) EVS_MONTH5,                MAX(EVS_MONTH6) EVS_MONTH6,                MAX(EVS_MONTH7) EVS_MONTH7,                MAX(EVS_MONTH8) EVS_MONTH8,                MAX(EVS_MONTH9) EVS_MONTH9,                MAX(EVS_MONTH10) EVS_MONTH10,                MAX(EVS_MONTH11) EVS_MONTH11,                MAX(EVS_MONTH12) EVS_MONTH12,                MAX(EVS_MONTH13) EVS_MONTH13           FROM (         SELECT EMPID,               LOCAL_NAME,              DEPTNO,              ORDERNO,              EVS_YEAR,                DECODE(EVS_MONTH,'14015045',MAX(FINAL_GRADE)) EVS_MONTH1,                DECODE(EVS_MONTH,'14015046',MAX(FINAL_GRADE)) EVS_MONTH2,                DECODE(EVS_MONTH,'14015047',MAX(FINAL_GRADE)) EVS_MONTH3,                DECODE(EVS_MONTH,'14015048',MAX(FINAL_GRADE)) EVS_MONTH4,                DECODE(EVS_MONTH,'14015049',MAX(FINAL_GRADE)) EVS_MONTH5,                DECODE(EVS_MONTH,'14015050',MAX(FINAL_GRADE)) EVS_MONTH6,                DECODE(EVS_MONTH,'14015051',MAX(FINAL_GRADE)) EVS_MONTH7,                DECODE(EVS_MONTH,'14015052',MAX(FINAL_GRADE)) EVS_MONTH8,                DECODE(EVS_MONTH,'14015053',MAX(FINAL_GRADE)) EVS_MONTH9,                DECODE(EVS_MONTH,'14015054',MAX(FINAL_GRADE)) EVS_MONTH10,                DECODE(EVS_MONTH,'14015055',MAX(FINAL_GRADE)) EVS_MONTH11,                DECODE(EVS_MONTH,'14015057',MAX(FINAL_GRADE)) EVS_MONTH12,                DECODE(EVS_MONTH,'ability',MAX(FINAL_GRADE)) EVS_MONTH13           FROM (SELECT HRE.EMPID,               HRE.LOCAL_NAME,               HRE.DEPTNO,               SC.ORDERNO,EVS.EVS_YEAR,                DECODE(EVS.EVS_TYPE,'ability','ability',                DECODE(EVS.EVS_MONTH,'14015058','14015050','14015059','14015057',EVS.EVS_MONTH)) EVS_MONTH,                CASE WHEN EVS.FINAL_GRADE = 'A' THEN 'EX'                          WHEN EVS.FINAL_GRADE = 'B' THEN 'VG'                          WHEN EVS.FINAL_GRADE = 'C' THEN 'GD'                          WHEN EVS.FINAL_GRADE = 'D' THEN 'NI'                          WHEN EVS.FINAL_GRADE = 'E' THEN 'UN'                          ELSE EVS.FINAL_GRADE END FINAL_GRADE           FROM EVS_OBJECT EVS,HR_EMPLOYEE HRE,SY_CODE SC          WHERE EVS.PERSON_ID = HRE.PERSON_ID            AND HRE.POST_GRADE_NO = SC.CODE_NO(+)            AND PKG_EVS_PROCESS.GET_EVS_FEEDBACK(EVS.RESUME_SEQ,'14015078') = 1         AND         EVS.EVS_YEAR = #{year}                      AND         EXISTS (SELECT B1.DEPTNO               FROM HR_DEPARTMENT B1              WHERE B1.DEPTNO = HRE.DEPTNO              START WITH B1.DEPTNO in (                                SELECT HRD.DEPTID                                FROM HR_DEPARTMENT HRD                                WHERE HRD.MANAGER_EMP_ID = #{adminID}                          )             CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO            UNION          SELECT AR_SUPERVISOR_INFO.DEPTNO          FROM AR_SUPERVISOR_INFO         WHERE AR_SUPERVISOR_INFO.DEPTNO = HRE.DEPTNO           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID}            UNION            SELECT SUD.DEPTNO           FROM SY_USER SU,SY_USER_DEPT SUD          WHERE SU.USER_NO = SUD.USER_NO             AND SU.PERSON_ID = #{adminID}             AND SUD.DEPTNO=HRE.DEPTNO)                                 AND HRE.EMPID NOT LIKE '11111%'            AND EVS.ACTIVITY = '14015361')           GROUP BY EMPID,LOCAL_NAME,DEPTNO,ORDERNO,EVS_YEAR,EVS_MONTH)         GROUP BY EMPID,LOCAL_NAME,DEPTNO,ORDERNO,EVS_YEAR                   ORDER BY DEPTNO,ORDERNO,EMPID,EVS_YEAR. Điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, 
Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), 
Thời gian vòa làm - DATE_STARTED (Ngày bắt đầu, Ngày kết thúc), 
Năm đánh giá - EVS_YEAR,
Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), 
Loại nhân viên - EMP_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="13864"), 
Trạng thái - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"), Có chức năng xuất excel.

Tham khảo theo file viewDeptPersonalInfoManageList.html. Tạo cho tôi một file viewHAECardInfoList.html - Thẻ nhân sự nằm trong module hrm/empinfo. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ bảng HR_EMPLOYEE và bảng HR_PERSONAL_INFO, 2 bảng này có quan hệ 1-1. Điều kiện tìm kiếm có những điều kiện gồm: Mã nhân viên/Họ tên, 
Phòng ban (tham khảo viewDepartManagerList.html để lấy ra list phòng ban), 
Thời gian vòa làm - DATE_STARTED (Ngày bắt đầu, Ngày kết thúc), 
Nhóm nhân viên - POST_FAMILY (dữ liệu lấy lấy thông qua data-parent-code="14015812"), 
Loại nhân viên - EMP_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="13864"), 
Trạng thái - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"), Có chức năng in ra thẻ nhân sự.

dự án này của tôi sử dụng lại database của hệ thống cũ, vì vậy nên khi đăng nhập thì giá trị trường PASSWORD của bảng sy_user chưa được mã hóa, hãy thiết lập để ban đầu người dùng vẫn có thể đăng nhập được vào hệ thống, nhưng sau đó sẽ hiện lên popup yêu cầu người dùng phải thay đổi mật khẩu để mã hóa, nếu không đổi mật khẩu thì sẽ bị out khỏi hệ thống

Dựa tho cấu trức hệ thống, hãy tạo cho tôi một file viewPersonalInfoForEss.html - Thông tin cá nhân nằm trong module /ess/empinfo. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ bảng HR_EMPLOYEE và bảng HR_PERSONAL_INFO. Chỉ hiển thị thông tin của chính người dùng đó. Ngoài ra phần "Loại địa chỉ" lấy từ bảng HR_ADDRESS_MATTERS. "Thông tin gia đình" lấy từ bảng HR_FAMILY. "Người liên hệ khẩn cấp" lấy từ bảng HR_EMERGENCY_ADDRESS. 

Tương tự như viewPersonalInfoForEss.html. hãy tạo cho tôi một file viewEssPersonalInfo.html - Thông tin Công việc nằm trong module /ess/empinfo. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ bảng HR_EMPLOYEE và bảng HR_PERSONAL_INFO. Chỉ hiển thị thông tin của chính người dùng đó. Ngoài ra phần "Quyết định nhân sự" lấy từ bảng HR_EXPERIENCE_INSIDE. "Kinh nghiệm" lấy từ bảng HR_WORK_EXPERIENCE.

Tương tự như viewPersonalInfoForEss.html. hãy tạo cho tôi một file viewQualificationInfo.html - Thông tin chứng chỉ nằm trong module /ess/empinfo. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ bảng HR_EMPLOYEE và bảng HR_PERSONAL_INFO. Chỉ hiển thị thông tin của chính người dùng đó. Ngoài ra phần "Trình độ học vấn" lấy từ bảng HR_EDUCATION. "Thông tin chứng chỉ" lấy từ bảng HR_QUALIFICATION. "Thông tin khen thưởng" lấy từ bảng HR_REWARD.

Tham khảo theo file viewEssPersonalInfo.html. Tạo cho tôi một file viewWorkGroupExperList.html - Tra cứu nhóm ca làm nằm trong module /ess/workgroup. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ bảng AR_SHIFTGROUP_MANAGEMENT và bảng HR_EMPLOYEE. Chỉ hiển thị thông tin của chính người dùng đó. Ca làm - GROUP_ID (dữ liệu lấy lấy thông qua data-parent-code="400223").

Tham khảo theo file viewWorkGroupExperList.html. Tạo cho tôi một file viewPersonShiftList.html - Ca làm cá nhân nằm trong module /ess/workgroup. giao diện tham khảo từ hình ảnh. Dữ liệu lấy từ câu lệnh SQL: SELECT TO_CHAR(TO_DATE(DDATE_STR,'YYYY/MM/DD'),'DD/MM/YYYY') DDATE_STR,
               GET_GLOBAL_NAME(get_ar_shiftno(#{adminID},to_char(AC.DDATE, 'yyyy/mm/dd'),AC.CPNY_ID),#{lang}) OVERTYPEID_NAME,
             GET_GLOBAL_NAME(SHIFT.SHIFT_NO,#interLanguage:VARCHAR#) SHIFT_NAME,
             GET_AR_ALL_DATETYPE(#{adminID},DDATE_STR,AC.CPNY_ID) DATE_TYPE,
             GET_GLOBAL_NAME(GET_AR_ALL_DATETYPE(#{adminID},DDATE_STR,AC.CPNY_ID),#interLanguage:VARCHAR#) DATE_NAME,
             TO_CHAR(TO_DATE(GET_AR_SHIFT_START_TIME(#{adminID},DDATE_STR,AC.CPNY_ID),'YYYY-MM-DD HH24:MI'),'DD/MM/YYYY HH24:MI') SHIFT_START_TIME,
             TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(#{adminID},DDATE_STR,AC.CPNY_ID),'YYYY-MM-DD HH24:MI'),'DD/MM/YYYY HH24:MI') SHIFT_END_TIME
        FROM AR_CALENDER AC,AR_SHIFT020 SHIFT
       WHERE GET_AR_SHIFTNO(#{adminID},DDATE_STR,CPNY_ID) = SHIFT.SHIFT_NO
         AND AC.CPNY_ID = #{cpnyId}
   AND DDATE_STR >= TO_CHAR(TO_DATE(#{startDate}, 'DD/MM/YYYY'), 'YYYY/MM/DD')
   AND DDATE_STR <= TO_CHAR(TO_DATE(#{endDate}, 'DD/MM/YYYY'), 'YYYY/MM/DD')
 GROUP BY DDATE_STR, SHIFT.SHIFT_NO, AC.CPNY_ID, AC.OVERTYPEID, AC.DDATE
 ORDER BY DDATE_STR.

 Tham khảo theo file viewWorkGroupExperList.html. Tạo cho tôi một file viewSSTApplyAttendance.html - Xin nghir pheps nằm trong module /ess/infoApplyAttendance. giao diện tham khảo từ hình ảnh. Loại nghỉ phép - APPLY_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="21"). Khi chọn loại nghỉ phép thì sẽ hiển thị ra tình trạng phép năm của nhân viên đó, gồm: Tổng phép năm:  Tạo phép năm:  Còn lại năm ngoái:  Số ngày đã sử dụng:  Số ngày còn lại. thogon tin được lấy thông qua câu lệnh: SELECT SUM(TOT_VAC_CNT + ADD_VAC + LAST_YEAR_VAC) AS TOT_VAC_CNT, --Tổng phép năm
       SUM(USE_VAC　+　AFFIRM_USE_VAC　+　USE_VAC_CNT) AS USE_VAC, --Số ngày đã sử dụng
       SUM(TOT_VAC_CNT + ADD_VAC + LAST_YEAR_VAC - USE_VAC　-　AFFIRM_USE_VAC　-　USE_VAC_CNT) AS REMAIN_VAC, --Số ngày còn lại
       SUM(TOT_VAC_CNT) AS YEAR_VAC_CNT, --Tạo phép năm
       SUM(ADD_VAC) AS ADD_VAC,
       SUM(LAST_YEAR_VAC) AS LAST_YEAR_VAC --Còn lại năm ngoái
  FROM (SELECT A.END_DATE,
           A.TOT_VAC_CNT,
           A.ADD_VAC,
           A.MENT_VAC,
           A.USE_VAC_CNT,
           A.LAST_YEAR_VAC,
               AR_USE_VACATION(TO_CHAR(A.STRT_DATE,'YYYY/MM/DD'),TO_CHAR(A.END_DATE,'YYYY/MM/DD'),A.CPNY_ID, A.PERSON_ID, 'CONFIRM') USE_VAC,
               AR_USE_VACATION(TO_CHAR(A.STRT_DATE,'YYYY/MM/DD'),TO_CHAR(A.END_DATE,'YYYY/MM/DD'),A.CPNY_ID, A.PERSON_ID, 'AFFIRM') AFFIRM_USE_VAC
          FROM AR_VAC_EMP A
         WHERE A.PERSON_ID = #{adminID}
           AND A.ACTIVITY = 1
           AND (SYSDATE BETWEEN STRT_DATE AND END_DATE)).
Đồng thời hiển thị danh sách line phê duyệt của người dùng đó (Thông tin người phê duyệt tham khảo hình ảnh). việc lấy ra người phê duyệt cũng như logic tạo đơn xin nghỉ phép tương tự như viewApplyAttManagentByAnyApproverList.html. 

Khi lựa chọn thời gian bắt đầu hoặc thời gian kết thúc, hệ thống sẽ gọi đến câu lệnh: select ar_get_day_hours(#{adminID},#{fromDateTime}) AS DAY_HOUR, GET_AR_LEAVE_LENGTH(#{adminID},#{cpnyId},to_date(#{fromDateTime},'YYYY.MM.DD HH24:MI:SS'),to_date(#{toDateTime},'YYYY.MM.DD HH24:MI:SS'),#{leaveType}) AS LEAVE_LENGTH from dual để lấy ra thời lượng và điền vào phần Thời lượng. lấy LEAVE_LENGTH chia cho DAY_HOUR ra phần nguyên thì là ngày, phần thập phân nhân với 24 ra phần giờ.


Tham khảo theo file viewSSTApplyAttendance.html. Tạo cho tôi một file viewApplyAttendanceInfoList.html - Chi tiết xin nghỉ phép nằm trong module /ess/infoApplyAttendance. giao diện tham khảo từ hình ảnh. Loại nghỉ phép - ITEM_NO (dữ liệu lấy lấy thông qua data-parent-code="21"),  Trạng thái duyệt - AFFIRM_FLAG (dữ liệu lấy lấy thông qua data-parent-code="14014304"). với dữ liệu được lấy từ bảng ESS_LEAVE_APPLY_TB.


tương tự như file viewSSTApplyAttendance.html. Tạo cho tôi một file viewSSTOtApplyInfo.html - Xin tăng ca nằm trong module /ess/infoApply. giao diện tham khảo từ hình ảnh. Khi chọn ngày tăng ca thì sẽ hiển thị ra thông tin của ngày đó, thông tin được lấy thông qua câu lệnh: SELECT  GET_AR_DATETYPE(#{adminID},#{applyDate},#{cpnyId}) DATETYPE,
          get_global_name(get_ar_shiftno(#{adminID},#{applyDate},#{cpnyId}),#interLanguage#) SHIFTNAME, --Ca làm việc
          TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(#{adminID},#{applyDate},#{cpnyId}),'YYYY.MM.DD HH24:MI'),'HH24:MI') SHIFT_END_TIME,
          TO_CHAR(TO_DATE(GET_AR_SHIFT_END_TIME(#{adminID},#{applyDate},#{cpnyId}),'YYYY.MM.DD HH24:MI')+1/12,'HH24:MI') SHIFT_END_TIME_2,
          TO_CHAR(TO_DATE(GET_AR_SHIFT_START_TIME(#{adminID},#{applyDate},#{cpnyId}),'YYYY.MM.DD HH24:MI'),'HH24:MI') SHIFT_START_TIME,
          GET_AR_TIME_BY_CPNYID(#{adminID},#{applyDate},'IN',#{cpnyId}) INDOOR_TIME,
          GET_AR_TIME_BY_CPNYID(#{adminID},#{applyDate},'OUT',#{cpnyId}) OUTDOOR_TIME,
          GET_AR_OT_TOTAIL(#{applyDate},#{cpnyId},#{adminID},'30') OT_TOTAIL_MONTH, --Tổng tăng ca tháng này
          GET_AR_OT_TOTAIL(#{applyDate},#{cpnyId},#{adminID},'200') OT_TOTAIL, --Tổng tăng ca năm này
          GET_AR_OT_TOTAIL(#{applyDate},#{cpnyId},#{adminID},'141444') WEEKDAY_OT_TOTAIL, --Tăng ca ngày thường
                    GET_AR_OT_TOTAIL(#{applyDate},#{cpnyId},#{adminID},'141445')  WEEKEND_OT_TOTAIL, --Tăng ca ngày cuối tuần
                    GET_AR_OT_TOTAIL(#{applyDate},#{cpnyId},#{adminID},'141446') HOILDAY_OT_TOTAIL, --Tăng ca ngày lễ
          (SELECT OT_LIMIT FROM HR_EMPLOYEE WHERE PERSON_ID = #{adminID}) OT_LIMIT,
          (SELECT OT_LIMIT_100 FROM HR_EMPLOYEE WHERE PERSON_ID = #{adminID}) OT_LIMIT_100 FROM DUAL.
Đồng thời hiển thị danh sách line phê duyệt của người dùng đó (Thông tin người phê duyệt tham khảo hình ảnh). việc lấy ra người phê duyệt cũng như logic tạo đơn xin nghỉ phép tương tự như viewApplyOtManagentByAnyApproverList.html. 

Tham khảo theo file viewApplyAttendanceInfoList.html. Tạo cho tôi một file viewPOtApplyInfoList.html - Chi tiết xin tăng ca nằm trong module /ess/infoApply. giao diện tham khảo từ hình ảnh. Loại tăng ca - OT_TYPE_CODE (dữ liệu lấy lấy thông qua data-parent-code="31"),  Trạng thái duyệt - AFFIRM_FLAG (dữ liệu lấy lấy thông qua data-parent-code="14014304"). với dữ liệu được lấy từ bảng ESS_APPLY_OT. Khi bấm vào 1 dòng dữ liệu thì sẽ hiện ra thông tin phê duyệt của dòng đó. modal hiển thị thông tin phê duyệt tham khảo từ dòng 75 đến dòng 164 ở file viewApplyOtManagentByAnyApproverList.html


tương tự như file viewSSTApplyAttendance.html. Tạo cho tôi một file viewShowCwaAbnormalApply.html - Nghỉ bất thường nằm trong module /ess/infoApply. giao diện tham khảo từ hình ảnh. Dữ liệu được lấy thông qua câu lệnh: SELECT 
              AR_DETAIL.PK_NO,
              AR_DETAIL.PERSON_ID,
              GET_EMPID(AR_DETAIL.PERSON_ID) EMPID,
              AR_DETAIL.ITEM_NO,
              get_global_name(AR_DETAIL.ITEM_NO,#{lang}) ITEM_NAME,
              TO_CHAR(AR_DETAIL.FROM_TIME,'DD/MM/YYYY HH24:mi:SS') FROM_TIME,
              TO_CHAR(AR_DETAIL.TO_TIME,'DD/MM/YYYY HH24:mi:SS') TO_TIME,
          TO_CHAR(TO_DATE(AR_DETAIL.AR_DATE_STR,'YYYY/MM/DD'),'DD/MM/YYYY') AR_DATE_STR,
          REPLACE(TO_CHAR(TO_DATE(AR_DETAIL.AR_DATE_STR,'YYYY/MM/DD'),'DD/MM/YYYY'),'/','.') DATE_STR,
          GET_AR_MAC_TIME(AR_DETAIL.PERSON_ID,AR_DATE_STR,'IN') INDOOR_TIME,
          GET_AR_MAC_TIME(AR_DETAIL.PERSON_ID,AR_DATE_STR,'OUT') OUTDOOR_TIME,
          TO_CHAR(TO_DATE(get_ar_shift_start_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'DD/MM/YYYY')shift_start_yyyy,
          TO_CHAR(TO_DATE(get_ar_shift_start_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'HH24')shift_start_hh,
          TO_CHAR(TO_DATE(get_ar_shift_start_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'MI')shift_start_mi,
          TO_CHAR(TO_DATE(get_ar_shift_end_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'DD/MM/YYYY')shift_end_yyyy,
          TO_CHAR(TO_DATE(get_ar_shift_end_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'HH24')shift_end_hh,
          TO_CHAR(TO_DATE(get_ar_shift_end_time(AR_DETAIL.PERSON_ID,AR_DATE_STR,#{cpnyId}),'YYYY/MM/DD HH24:MI'),'MI')shift_end_mi,
          LOCK_YN
        FROM AR_DETAIL_HAE AR_DETAIL 
        WHERE AR_DETAIL.PERSON_ID=#{adminID}  
          AND AR_DETAIL.ITEM_NO IN ('141443','141441','141442','14015448')
          AND AR_DETAIL.AR_DATE_STR < TO_CHAR(SYSDATE,'YYYY/MM/DD')
          AND AR_DETAIL.AR_DATE_STR NOT IN
       (SELECT AR_DATE_STR
          FROM ESS_CARD_APPLY_TB CARD
         WHERE AFFIRM_FLAG IN ('14014306','14014307','14014308') AND CONFIRM_FLAG <> 2 AND PERSON_ID = #{adminID})
           AND AR_DETAIL.AR_DATE_STR >= TO_CHAR(TO_DATE(#{startDate},'DD/MM/YYYY'),'YYYY/MM/DD')
           AND AR_DETAIL.AR_DATE_STR <= TO_CHAR(TO_DATE(#{endDate},'DD/MM/YYYY'),'YYYY/MM/DD')
        ORDER BY AR_DETAIL.AR_DATE_STR DESC.
Đồng thời hiển thị danh sách line phê duyệt của người dùng đó trên mỗi dòng dữ liệu (Thông tin người phê duyệt tham khảo hình ảnh).

Tham khảo theo file viewPOtApplyInfoList.html. Tạo cho tôi một file viewApplyLeaveInfoList.html - Chi tiết nghỉ bất thường nằm trong module /ess/infoApplyLeave. giao diện tham khảo từ hình ảnh. Trạng thái duyệt - AFFIRM_FLAG (dữ liệu lấy lấy thông qua data-parent-code="14014304"). với dữ liệu được lấy từ bảng ESS_CARD_APPLY_TB. Khi bấm vào 1 dòng dữ liệu thì sẽ hiện ra thông tin phê duyệt của dòng đó. modal hiển thị thông tin phê duyệt tham khảo từ dòng 90 đến dòng 179 ở file viewCheckAttencetanceExForBatchList.html

Tham khảo theo file viewApplyAttendanceInfoList.html. Tạo cho tôi một file viewAttendancePersonalInfoList.html - Tra cứu chấm công nằm trong module /ess/infoApplyAttendance. giao diện tham khảo từ hình ảnh. Phân loại - ITEM_NO (dữ liệu lấy lấy thông qua câu lệnh: select AIP.ITEM_NO, get_global_name(AIP.ITEM_NO, #{lang}) as ITEM_NAME from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE != '1433' --Không lấy tăng ca;). với dữ liệu được lấy từ bảng AR_DETAIL_HAE kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. Dữ liệu được truy xuất ra theo tháng hiện tại, với điều kiện AR_DETAIL_HAE.ITEM_NO NOT IN (select AIP.ITEM_NO from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE = '1433')

Dựa vào file viewEmpCalendar.html ở module /ar/attendanceSettings. Tạo cho tôi một file viewEmpCalendar.html - Lịch làm việc nằm trong module /ess/viewDept. Dữ liệu được truy xuất ra theo tháng hiện tại. Nếu có thể tái sử dụng luôn được file viewEmpCalendar.html ở module /ar/attendanceSettings để hiển thị thì càng tốt.


hãy xem lại cách lấy dữ liệu từ giao diện ManageEmpPositionInfoList.html. hãy thêm cho tôi điều kiện tìm kiếm để chọn ngày cụ thể, sau đó chọn mep_empOffice là đang làm, thì sẽ lấy ra những nhân viên đang làm việc vào ngày đó. tức là nếu nhân viên mà nghỉ việc sau ngày hôm đó hoặc nghỉ việc mà không có ngày nghỉ việc thì sẽ được hiển thị ra, còn những nhân viên nghỉ việc trước ngày đó thì sẽ không được hiển thị ra. hoặc nhân viên có ngày vào làm sau ngày hôm đó cũng không hiện ra. 

Căn cứ và file viewAttendancePersonalInfoList.html. hãy tạo cho tôi một file viewArPersonalSelfList.html - Tình hình chấm công nằm trong module /ess/viewDept. giao diện tham khảo từ hình ảnh. dữ liệu được lấy ra khác với viewAttendancePersonalInfoList là ở giao diện này lại hiển thị theo chiều ngang (tính tổng các loại chấm công), với các loại chấm công được lấy từ câu lệnh : select get_global_name(AIP.ITEM_NO, #{lang}) as ITEM_NAME from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE != '1433' --Không lấy tăng ca;). với dữ liệu được lấy từ bảng AR_DETAIL_HAE kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. Dữ liệu được truy xuất ra theo tháng hiện tại, với điều kiện AR_DETAIL_HAE.ITEM_NO NOT IN (select AIP.ITEM_NO from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE = '1433'. Khi bấm vào từng con số sẽ hiển thị ra chi tiết của loại chấm công đó trong Khoảng thời gian ngày bắt đầu và ngày kết thúc, phần chi tiết này tham khảo giao diện hình ảnh.


Căn cứ và file viewArPersonalSelfList.html. hãy tạo cho tôi một file viewOtApplyPersonalSelfList.html - Tình hình tăng ca nằm trong module /ess/viewDept. giao diện tham khảo từ hình ảnh. dữ liệu giao diện này lại hiển thị theo chiều ngang (tính tổng các loại tăng ca), với các loại tăng ca được lấy từ câu lệnh : select get_global_name(AIP.ITEM_NO, #{lang}) as ITEM_NAME from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE = '1433';). với dữ liệu được lấy từ bảng AR_DETAIL_HAE kết hợp với bảng HR_EMPLOYEE thông qua trường PERSON_ID để lấy ra EMPID - Mã nhân viên, LOCAL_NAME - Tên nhân viên. Dữ liệu được truy xuất ra theo tháng hiện tại, với điều kiện AR_DETAIL_HAE.ITEM_NO IN (select AIP.ITEM_NO from AR_ITEM_PARAM AIP, AR_ITEM AI WHERE AIP.ITEM_NO = AI.ITEM_NO AND AIP.CPNY_ID = #{cpnyId} and AI.ITEM_GROUP_CODE = '1433'). Khi bấm vào từng con số sẽ hiển thị ra chi tiết của loại tăng ca đó trong Khoảng thời gian ngày bắt đầu và ngày kết thúc, phần chi tiết này tham khảo giao diện hình ảnh.


Căn cứ và file viewPersonOtApplyInfoList.html. hãy tạo cho tôi một file yearUseInfo.html - Nghỉ phép năm nằm trong module /ess/viewDept. giao diện tham khảo từ hình ảnh. Thông tin nghỉ phép năm được lấy theo năm hiện tại, với dữ liệu được lấy từ essLeaveApplymapper.selectMyVacationInfo
Tình trạng sử dụng phép năm được lấy từ bảng ESS_LEAVE_APPLY_TB với điều kiện LEAVE_TYPE_CODE = 26


Căn cứ và file viewSearchApplyOtInfoList.html. hãy tạo cho tôi một file viewResumeList.html - Tổng hợp đánh giá nằm trong module /evs/manage/. dữ liệu lấy từ bảng EVS_RESUME_INFO với các trường tham khảo từ hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết của đánh giá đó để chỉnh sửa, phần chi tiết này tham khảo giao diện hình ảnh.

Khi bấm vào nút lưu, nếu ở phần Sao chép đối tượng có chọn giá trị thì  sẽ thực hiện procedure PKG_EVS_PROCESS.PR_INIT_EVS_PARAM(
            #{seq, mode=IN, jdbcType=VARCHAR},
            #{adminID, mode=IN, jdbcType=VARCHAR},
            #{adminIP, mode=IN, jdbcType=VARCHAR},
            #{cpnyId, mode=IN, jdbcType=VARCHAR},
            #{message, mode=OUT, jdbcType=VARCHAR}
            ).

Căn cú vào file viewResumeList.html. hãy tạo cho tôi một file viewEvsSchedulePanel.html - Quy trình đánh giá nằm trong module /evs/manage/. Giao diện thao khảo hình ảnh. Danh sách Tên đánh giá được lấy từ /api/resume/evsResumeList. dữ liệu lấy từ bảng EVS_SCHEDULE với các trường tham khảo từ hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu có thể trực tiếp chỉnh sửa. trong giao diện chia làm 3 tab: Tab Công ty - SCHEDULE_TYPE = CPNY, Tab Phòng ban - SCHEDULE_TYPE = DEPT, Tab Cá nhân - SCHEDULE_TYPE = EMP.


Căn cứ vào file viewEvsSchedulePanel.html. hãy tạo cho tôi một file viewEvsParamPanel.html - Tiêu chuẩn đánh giá nằm trong module /evs/manage/. Giao diện thao khảo hình ảnh. Danh sách Tên đánh giá được lấy từ /api/resume/evsResumeList. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu có thể trực tiếp chỉnh sửa. trong giao diện chia làm 7 tab: 
Tab Cấp đánh giá - Dữ liệu lấy từ bảng EVS_GRADE với các trường tham khảo hình ảnh.
Tab Cấp hạng mục đánh giá - Dữ liệu lấy từ bảng EVS_PARAM với các trường tham khảo hình ảnh với PARAM_TYPE = 'ITEM'.
Tab Đối tượng đánh giá - Dữ liệu lấy từ bảng EVS_PARAM_OBJECT với các trường tham khảo hình ảnh.
Tab Bảng đánh giá - Dữ liệu lấy từ bảng EVS_PARAM với các trường tham khảo hình ảnh với PARAM_TYPE = 'LIST'.
Tab Nhóm nhân viên - Dữ liệu lấy từ bảng EVS_PARAM với các trường tham khảo hình ảnh với PARAM_TYPE = 'GROUP'.
Tab Nhóm chức vụ - Dữ liệu lấy từ bảng EVS_PARAM với các trường tham khảo hình ảnh với PARAM_TYPE = 'FAMILY'.
Tab Người đánh giá - Dữ liệu lấy từ bảng EVS_AFFIRM_RULE với các trường tham khảo hình ảnh.


Căn cứ và file viewResumeList.html. hãy tạo cho tôi một file viewEvsFormulaList.html - Nhóm đánh giá nằm trong module /evs/manage/. dữ liệu lấy từ bảng EVS_FORMULA với các trường tham khảo từ hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết để chỉnh sửa.

Căn cứ và file viewEvsFormulaList.html. hãy tạo cho tôi một file viewEvsDistributionRatePanel.html - Thiết lập tỷ lệ nằm trong module /evs/manage/. dữ liệu lấy từ bảng EVS_SCORE với các trường tham khảo từ hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết để chỉnh sửa. Giá trị cột SUM được tính bằng cách lấy giá trị của cột A + B + C + D + E + N + O + S, GIÁ TRỊ PHẢI BẰNG 100. Nếu giá trị cột SUM không bằng 100 thì sẽ hiển thị cảnh báo và không cho phép lưu dữ liệu.

danh sách vedr_resumeSeq lấy ra thì dùng luôn giá trị đầu tiên để làm điều kiện tìm kiếm mặc định khi click vào giao diện. khi vedr_scoreType được chọn giá trị CPNY thì vedr_no và vedr_name đồng thời điền giá trị là 'CPNY'. Hiện tại chỉ hiển thị 5 giá trị của A, B, C, D và E. ngoài ra khi hiển thị thì hãy chuyển đổi A thành EX, B thành VG, C thành GD, D thành NI, E thành UN. Khi lưu dữ liệu thì sẽ lưu ngược lại giá trị gốc A, B, C, D và E vào database.

Căn cứ và file viewEvsDistributionRatePanel.html. hãy tạo cho tôi một file viewEvsAffirmorSetup.html - Đối tượng đánh giá và người đánh giá nằm trong module /evs/manage/. Dữ liệu lấy từ câu lệnh sql sau: SELECT SEQ,
       RESUME_SEQ,
       PERSON_ID,
       EMPID,
       LOCAL_NAME,
       DEPTNO,
       GET_DEPT_NAME(DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
       POST_GRADE_NO,
       POST_GRADE_NAME,
       MAIN_BUSINESS,
       GET_GLOBAL_NAME(MAIN_BUSINESS, #{lang, jdbcType=VARCHAR}) MAIN_BUSINESS_NAME,
       OBJECT_TYPE,
       OBJECT_TYPE_NAME,
       TO_CHAR(DATE_STARTED, 'DD/MM/YYYY') DATE_STARTED,
       LIST_TYPE_NAME,
       EVS_GROUP_NAME,
       EVS_OCC_GROUP,
       EVS_OCC_GROUP_NAME,
       TO_CHAR(UPDATE_DATE, 'DD/MM/YYYY HH24:MI') UPDATE_DATE,
       GET_UPDATED_INFO(UPDATED_BY) || ' ' || UPDATED_IP UPDATED_BY,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'LOCAL_NAME') LOCAL_NAME0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'LOCAL_NAME') LOCAL_NAME1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'LOCAL_NAME') LOCAL_NAME2,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'LOCAL_NAME') LOCAL_NAME3,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'LOCAL_NAME') LOCAL_NAME4,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'POST_GRADE_NAME') POST_GRADE_NAME0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'POST_GRADE_NAME') POST_GRADE_NAME1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'POST_GRADE_NAME') POST_GRADE_NAME2,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'POST_GRADE_NAME') POST_GRADE_NAME3,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'POST_GRADE_NAME') POST_GRADE_NAME4,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'AFFIRMOR_ID') PERSON_ID1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'AFFIRMOR_ID') PERSON_ID2,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'AFFIRMOR_ID') PERSON_ID3,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'AFFIRMOR_ID') PERSON_ID4
  FROM EVS_OBJECT A
 WHERE A.RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
 ORDER BY A.PERSON_ID ASC. Giao diện tham khảo hình ảnh


 Thêm  cho tôi nút thêm mới. Khi bấm sẽ hiện ra popup để nhập Đối tượng đánh giá, Người đánh giá lần 1 và người đánh giá lần 2. Khi nhập thì sử dụng sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên. khi lưu thì sẽ gọi pakage PKG_EVS_PROCESS.PR_ADD_EVS_OBJECT(
						#RESUME_SEQ:VARCHAR#,
						#PERSON_ID:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#) để lưu thông tin Đối tượng đánh giá. 
            
            gọi palkage PKG_EVS_PROCESS.PR_MODIFY_AFFIRM_INFO(
						#RESUME_SEQ:VARCHAR#,
						#EVS_OBJECT_SEQ:VARCHAR#,
						#PERSON_ID_AFFIRM_ID:VARCHAR#,
						#AFFIRM_LEVEL:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#) để lưu thông tin Người đánh giá. AFFIRM_LEVEL sẽ có giá trị lần lượt là 1, 2, 3, 4 tương ứng với Người đánh giá lần 1, Người đánh giá lần 2, Người đánh giá lần 3 và Người đánh giá lần 4.

Thêm  cho tôi nút Tạo mục tiêu. khi bấm vào sẽ gọi pakage PKG_EVS_PROCESS.PR_CREATE_EVS_TARGET(
						#RESUME_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#CpnyID:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#), 

Tương tự thêm  cho tôi nút Bắt đầu đánh giá. khi bấm vào sẽ gọi pakagePKG_EVS_PROCESS.PR_EVS_START(
						#RESUME_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#)

hãy sửa lại logic Lưu tất cả này. đầu tiên sẽ cập nhật người đánh gái cấp 1 và 2 thông qua việc gọi pakage KG_EVS_PROCESS.PR_MODIFY_AFFIRM_INFO(
            #{resumeSeq,      jdbcType=VARCHAR, mode=IN},
            #{seq,            jdbcType=VARCHAR, mode=IN},
            #{personIdAffirm, jdbcType=VARCHAR, mode=IN},
            #{affirmLevel,    jdbcType=VARCHAR, mode=IN},
            #{adminID,        jdbcType=VARCHAR, mode=IN},
            #{adminIP,        jdbcType=VARCHAR, mode=IN},
            #{message,        jdbcType=VARCHAR, mode=OUT}
        ) với affirmLevel sẽ có giá trị lần lượt là 1, 2 tương ứng với Người đánh giá lần 1 và Người đánh giá lần 2. sau đó mới gọi hàm cạp nhật bảng EVS_OBJECT với câu SQL: UPDATE EVS_OBJECT
		   SET LIST_TYPE = GET_CODE_NO(#LIST_TYPE_NAME:VARCHAR#,#RESUME_SEQ:VARCHAR#,'LIST','EVS_PARAM'),
		       LIST_TYPE_NAME = #LIST_TYPE_NAME:VARCHAR#,
		       EVS_GROUP = GET_CODE_NO(#EVS_GROUP_NAME:VARCHAR#,#RESUME_SEQ:VARCHAR#,'GROUP','EVS_PARAM'),
		       EVS_GROUP_NAME = #EVS_GROUP_NAME:VARCHAR#,
		       EVS_OCC_GROUP = GET_CODE_NO(#EVS_OCC_GROUP_NAME:VARCHAR#,#RESUME_SEQ:VARCHAR#,'FAMILY','EVS_PARAM'),
		       EVS_OCC_GROUP_NAME = #EVS_OCC_GROUP_NAME:VARCHAR#,
		       UPDATE_DATE = SYSDATE,
		       UPDATED_BY = #adminID:VARCHAR#,
		       UPDATED_IP = #adminIP:VARCHAR#
		 WHERE SEQ = #seq:VARCHAR# để lưu thông tin Đối tượng đánh giá. Nếu lưu người đánh giá thành công nhưng lưu đối tượng đánh giá thất bại thì sẽ hiển thị cảnh báo và không cho phép lưu dữ liệu.

Căn cứ và file viewEvsAffirmorSetup.html. hãy tạo cho tôi một file viewEvsResult.html - Kết quả đánh giá nằm trong module /evs/manage/. Dữ liệu lấy từ câu lệnh sql sau: SELECT SEQ,
             RESUME_SEQ,
             PERSON_ID,
             EMPID,
             LOCAL_NAME,
             DEPTNO,
             GET_DEPT_NAME(DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
             POST_GRADE_NO,
             POST_GRADE_NAME,
             MAIN_BUSINESS,
             GET_GLOBAL_NAME(MAIN_BUSINESS, #{lang, jdbcType=VARCHAR}) MAIN_BUSINESS_NAME,
             OBJECT_TYPE,
             OBJECT_TYPE_NAME,
             DATE_STARTED,
             ACTIVITY,
             GET_CODE_NAME(ACTIVITY, #{lang, jdbcType=VARCHAR}) ACTIVITY_NAME,
             DECODE(FINAL_GRADE,'A','EX','B','VG','C','GD','D','NI','E','UN') FINAL_GRADE,
             FINAL_GRADE  FINAL_GRADE_OR,
             FINAL_AFFIRM_CONTENT,
             
             TO_CHAR(UPDATE_DATE,'DD/MM/YYYY HH24:MI') UPDATE_DATE,
             GET_UPDATED_INFO(UPDATED_BY) || ' ' || UPDATED_IP UPDATED_BY,
             ORDERNO,
             
             DECODE(PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'AFFIRM_FLAG'),1,'Evaluated',0,'Not_Evaluated') AFFIRM_FLAG_NAME0,
             DECODE(PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'AFFIRM_FLAG'),1,'Evaluated',0,'Not_Evaluated') AFFIRM_FLAG_NAME1,
             DECODE(PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'AFFIRM_FLAG'),1,'Evaluated',0,'Not_Evaluated') AFFIRM_FLAG_NAME2,
             DECODE(PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'AFFIRM_FLAG'),1,'Evaluated',0,'Not_Evaluated') AFFIRM_FLAG_NAME3,
             DECODE(PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'AFFIRM_FLAG'),1,'Evaluated',0,'Not_Evaluated') AFFIRM_FLAG_NAME4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'LOCAL_NAME') LOCAL_NAME0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'LOCAL_NAME') LOCAL_NAME1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'LOCAL_NAME') LOCAL_NAME2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'LOCAL_NAME') LOCAL_NAME3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'LOCAL_NAME') LOCAL_NAME4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'POST_GRADE_NAME') POST_GRADE_NAME0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'POST_GRADE_NAME') POST_GRADE_NAME1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'POST_GRADE_NAME') POST_GRADE_NAME2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'POST_GRADE_NAME') POST_GRADE_NAME3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'POST_GRADE_NAME') POST_GRADE_NAME4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'SEQ') SEQ0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'SEQ') SEQ1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'SEQ') SEQ2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'SEQ') SEQ3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'SEQ') SEQ4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'EVS_POINT') EVS_POINT0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'EVS_POINT') EVS_POINT1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'EVS_POINT') EVS_POINT2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'EVS_POINT') EVS_POINT3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'EVS_POINT') EVS_POINT4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'EVS_GRADE') EVS_GRADE0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'EVS_GRADE') EVS_GRADE1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'EVS_GRADE') EVS_GRADE2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'EVS_GRADE') EVS_GRADE3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'EVS_GRADE') EVS_GRADE4,
             
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'AFFIRM_CONTENT') || '<br>' ||
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 0, 'AFFIRM_CONTENT2') AFFIRM_CONTENT0,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 1, 'AFFIRM_CONTENT') AFFIRM_CONTENT1,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 2, 'AFFIRM_CONTENT') AFFIRM_CONTENT2,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 3, 'AFFIRM_CONTENT') AFFIRM_CONTENT3,
             PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(SEQ, 4, 'AFFIRM_CONTENT') AFFIRM_CONTENT4
        FROM EVS_OBJECT A
       WHERE A.RESUME_SEQ = #RESUME_SEQ:VARCHAR#. Giao diện tham khảo hình ảnh

       gọi đến một procedure PKG_EVS_PROCESS.PR_CONFIRM_FINAL_GRADE(
            #{resumeSeq, jdbcType=VARCHAR, mode=IN},
            #{adminID,   jdbcType=VARCHAR, mode=IN},
            #{adminIP,   jdbcType=VARCHAR, mode=IN},
            #{cpnyId,    jdbcType=VARCHAR, mode=IN},
            #{message,   jdbcType=VARCHAR, mode=OUT})

Căn cứ vào file viewEvsParamPanel.html. hãy tạo cho tôi một file viewEvsItemPanel.html - Chỉ tiêu đánh giá nằm trong module /evs/manage/. giao diện gồm 2 tab Chỉ tiêu đánh giá và Hạng mục chỉ tiêu chỉ định. Giao diện tham khảo hình ảnh. Tab Chỉ tiêu đánh giá lấy dữ liệu từ câu lệnh SQL: SELECT SEQ,
       RESUME_SEQ,
       GROUP_NO,
       GET_CODE_NAME(GROUP_NO, #{lang, jdbcType=VARCHAR}) GROUP_NAME,
       ITEM_CODE,
       ITEM_NAME,
       ITEM_NAME_KO,
       REMARK,
       REMARK_KO,
       ACTIVITY,
       TO_CHAR(UPDATE_DATE, 'DD/MM/YYYY HH24:MI') UPDATE_DATE,
       GET_UPDATED_INFO(UPDATED_BY) || ' ' || UPDATED_IP UPDATED_BY
  FROM EVS_ITEM A
 WHERE ACTIVITY <> 2
   AND RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
 ORDER BY TO_NUMBER(SEQ)
Tab Hạng mục chỉ tiêu chỉ định lấy dữ liệu từ câu lệnh SQL: SELECT PARAM.SEQ,
       PARAM.RESUME_SEQ,
       ITEM.ITEM_NAME,
       ITEM.ITEM_CODE ITEM_CODE_ITEM,
       ITEM.REMARK ITEM_REMARK,
       get_code_name(ITEM.GROUP_NO, #{lang, jdbcType=VARCHAR}) GROUP_NAME,
       PKG_EVS_PROCESS.GET_EVS_PARAM_NAME(PARAM.RESUME_SEQ,
                                          'GROUP',
                                          PARAM.EVS_GROUP) EVS_GROUP_NAME,
       PKG_EVS_PROCESS.GET_EVS_PARAM_NAME(PARAM.RESUME_SEQ,
                                          'FAMILY',
                                          PARAM.EVS_OCC_GROUP) EVS_OCC_GROUP_NAME,
       PARAM.ITEM_CODE,
       PARAM.EVS_GROUP,
       PARAM.EVS_OCC_GROUP,
       PARAM.REMARK,
       PARAM.ITEM_SCORE,
       PARAM.ACTIVITY,
       TO_CHAR(PARAM.UPDATE_DATE, 'DD/MM/YYYY HH24:MI') UPDATE_DATE,
       GET_UPDATED_INFO(PARAM.UPDATED_BY) || ' ' || PARAM.UPDATED_IP UPDATED_BY
  FROM EVS_ITEM_PARAM PARAM, EVS_ITEM ITEM
 WHERE PARAM.RESUME_SEQ = ITEM.RESUME_SEQ(+)
   AND PARAM.ITEM_CODE = ITEM.ITEM_CODE(+)
   AND PARAM.ACTIVITY <> 2
   AND PARAM.RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
 ORDER BY TO_NUMBER(PARAM.SEQ)
với 2 bảng EVS_ITEM và EVS_ITEM_PARAM có liên kết với nhau thông qua trường ITEM_CODE và RESUME_SEQ. với các trường tham khảo hình ảnh


Dựa vào file educationSearch.html. Hãy tạo cho tôi một file viewPaPaySchedule.html - Kế hoạch trả lương nằm trong module /pa/workManagement. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_PAY_SCHEDULE với các trường tham khảo hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Khi bấm vào từng dòng dữ liệu sẽ hiển thị thông tin chi tiết của kế hoạch trả lương đó để chỉnh sửa, Khi thêm mới thì PAY_SCHEDULE_NO sẽ được sinh ra theo PA_PAY_SCHEDULE_SEQ.NEXTVAL. Phân loại lương SALARY_DISTIN_NO (dữ liệu lấy lấy thông qua data-parent-code="14013797")

Dựa vào file viewPaPaySchedule.html. Hãy tạo cho tôi một file viewPaPayObj.html - Đối tượng nhận lương nằm trong module /pa/workManagement. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_PAY_OBJECT với các trường tham khảo hình ảnh, kết hợp cùng bảng HR_EMPLOYEE. có đầy đủ chức năng thêm mới, sửa, xóa. Có thể sửa trực tiếp  giá trị Phân biệt - INCLUDE_TYPE đối với từng dòng dữ liệu, khi sửa thì dòng dữ liệu sẽ tự động được tính, để phục vụ cho việc bấm Lưu, Phân loại lương SALARY_DISTIN_NO (dữ liệu lấy lấy thông qua data-parent-code="14013797"), danh sách Kế hoạch trả lương PAY_SCHEDULE_NO (dữ liệu lấy từ bảng PA_PAY_SCHEDULE). Phân biệt - INCLUDE_TYPE dữ liệu lấy với giá trị 1 là Tham gia, giá trị 0 là Không tham gia. Trạng thái - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118") 

Tạo cho tôi một giao diện Quy trình tình lương - viewPaWorkFlow.html nằm trong module /pa/workManagement. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_WORK_FLOW với các trường tham khảo hình ảnh. Thông tin lấy ra gia diện sử dụng câu lệnh SQL sau: SELECT PWF.PA_WORK_FLOW_NO,
       PPS.PAY_SCHEDULE_NO,
       TO_CHAR(PPS.HR_START_DATE, 'DD-MM-YYYY') HR_START_DATE,
       TO_CHAR(PPS.HR_END_DATE, 'DD-MM-YYYY') HR_END_DATE,
       TO_CHAR(PPS.AR_START_DATE, 'DD-MM-YYYY') AR_START_DATE,
       TO_CHAR(PPS.AR_END_DATE, 'DD-MM-YYYY') AR_END_DATE,
       OBJ_CREATE_FLAG,
       AR_MONTH_CAL_FLAG,
       PA_CAL_FLAG,
       PA_CONFIRM_FLAG,
       PA_OPEN_FLAG,
       PPS.AR_LOCK_FLAG
  FROM PA_PAY_SCHEDULE PPS, PA_WORK_FLOW PWF
 WHERE PPS.PAY_SCHEDULE_NO = PWF.PAY_SCHEDULE_NO
   AND PPS.CPNY_ID = #{cpnyId,  jdbcType=VARCHAR}
   AND PPS.ACTIVITY = 1
   AND PPS.PAY_SCHEDULE_NO = #{payScheduleNo, jdbcType=VARCHAR}


  Khi tick chọn vào Tạo đối tượng sau đó bấm thực hiện thì sẽ chạy pakage PKG_PA_WORK_FLOW.PA_WORKFLOW_EXECUTE(
            #{payScheduleNo, jdbcType=VARCHAR, mode=IN},
            #{adminID, jdbcType=VARCHAR, mode=IN},
            #{adminIP, jdbcType=VARCHAR, mode=IN},
            #{cpnyId, jdbcType=VARCHAR, mode=IN},
            #{type, jdbcType=VARCHAR, mode=IN},
            #{message, jdbcType=VARCHAR, mode=OUT}
        ) với type = 'createPaObj' để tạo mới đối tượng nhận lương.

hãy sửa lại chõ này, khi bấm vào sẽ hiện ra popup chứ thông tin lịch sử những lần thao tác, dữ liệu trong popup sẽ lấy từ bảng PA_WORK_FLOW_RECORDS với các trường tham khảo hình ảnh, với giao diện tham khảo hình ảnh. Dữ liệu lấy ở bảng PA_WORK_FLOW_RECORDS kết hợp với bảng PA_WORK_FLOW

Dựa vào file viewPaPayObj.html. Hãy tạo cho tôi một file viewSalaryCodeList.html - Hạng mục lương lương nằm trong module /pa/salarycode. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_PARAM_ITEM và PA_ITEM với các trường tham khảo hình ảnh. có đầy đủ chức năng thêm mới, sửa, xóa. Dữ liệu được lấy ra thông qua câu lệnh SQL: SELECT P.ITEM_TYPE,
                               .
Loại hạng mục - ITEM_TYPE (lấy ra danh sách ITEM_TYPE gồm 
	<option value="">Tất cả</option>
	<option value="1">Hạng mục tiêu chuẩn</option>
	<option value="2">Điều chỉnh trả lương</option>
	<option value="3">Trả lương ngoại lệ</option>
	<option value="4">Điều chỉnh khoản trừ</option>
	<option value="5">Khoản trừ ngoại lệ</option>
	<option value="6">Hạng mục tính toán</option>)


  lưu ý trường ROLE_GROUP_NO và ROLE_GROUP_ID khi tạo mới là tự động tăng với giá trị trường SEQ của bảng sy_global_name. Tức là khi nhập tên của nhóm quyền sẽ 4 tên tiếng việt, tiếng anh, tiếng trung, tiếng hàn. và sinh ra tương ứng trong bảng sy_global_name.

  - DATA_TYPE (lấy ra danh sách DATA_TYPE gồm <option value="NUMBER(14,4)" selected="">Dạng số</option>
						<option value="VARCHAR(100)">Dạng ký tự</option>)

Dựa vào file viewSalaryCodeList.html. Hãy tạo cho tôi một file viewPaInputItemParam.html - Thông số mục nhập nằm trong module /pa/salary. Giao diện tham khảo hình ảnh.  Dữ liệu được lấy ra thông qua câu lệnh SQL: SELECT .
Loại hạng mục - ITEM_TYPE (lấy ra danh sách ITEM_TYPE gồm 
	<option value="">Tất cả</option>
	<option value="1">Hạng mục tiêu chuẩn</option>
	<option value="2">Điều chỉnh trả lương</option>
	<option value="3">Trả lương ngoại lệ</option>
	<option value="4">Điều chỉnh khoản trừ</option>
	<option value="5">Khoản trừ ngoại lệ</option>
	<option value="6">Hạng mục tính toán</option>)
bảng PA_PARAM_ITEM và PA_ITEM với các trường tham khảo hình ảnh. chỉ cần chức năng sửa và xóa.

Dựa vào file viewPaInputItemParam.html. Hãy tạo cho tôi một file viewPaComputeItemParamList.html - Thông số mục nhập nằm trong module /pa/salary. Giao diện tham khảo hình ảnh.  Dữ liệu được lấy ra thông qua câu lệnh SQL: SELECT T.PARAM_NO,
       T.ITEM_NO,
       PI.ITEM_ID,
       SY.CONTENT ALIAS_NAME,
       T.CALCU_ORDER,
       T.PRICISION,
       T.CARRY_BIT,
       T.CPNY_ID,
       SY0.CONTENT CPNY_NAME,
       T.APPLY_TYPE,
       SY1.CONTENT APPLY_TYPE_NAME,
       PI.SHOW_YN,
       PI.SHOW_ORDER,
       GET_ITEM_GLAG(PI.ITEM_ID, T.CPNY_ID) ITEM_FLAG,
       GET_ITEM_NUMBER(PI.ITEM_ID, T.CPNY_ID) ITEM_NUMBER
  FROM PA_ITEM_PARAM  T,
       PA_ITEM        PI,
       SY_GLOBAL_NAME SY,
       HR_COMPANY     HR,
       SY_GLOBAL_NAME SY0,
       SY_GLOBAL_NAME SY1
 WHERE T.ITEM_NO = PI.ITEM_NO
   AND T.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND T.CPNY_ID = HR.CPNY_ID
   AND HR.CPNY_NO = SY0.NO(+)
   AND SY0.LANGUAGE = #{lang, jdbcType=VARCHAR}
   AND T.APPLY_TYPE = SY1.NO(+)
   AND SY1.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY CALCU_ORDER. Có đầy đủ chức năng thêm mới, sửa, xóa. Khi thêm mới thì phần Tên hạng mục chỉ lấy những item trong danh sách lấy từ câu lệnh SQL: SELECT T.ITEM_NO, SY.CONTENT ITEM_NAME, T.DESCR, T.DATATYPE, T.ITEM_ID
  FROM PA_ITEM T, SY_GLOBAL_NAME SY
 WHERE T.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND T.ACTIVITY IN (1, 11)
   AND T.ITEM_NO NOT IN (SELECT P.ITEM_NO
                           FROM PA_ITEM_PARAM P
                          WHERE P.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
                            AND P.ITEM_NO IS NOT NULL)
 ORDER BY ITEM_NO. Khi thêm mới và sửa chỉ cần nhập các trường sau: Tên hạng mục - ITEM_NO, Độ chính xác - PRICISION, Số chữ số sau dấu phẩy - CARRY_BIT, Loại áp dụng. Khi Sửa thì không cho phép sửa trường Tên hạng mục - ITEM_NO.


 Dựa vào file viewSalaryCodeList.html. Hãy tạo cho tôi một file viewPaSupervisor.html - Người phụ trách lương lương nằm trong module /pa/wagebase. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_SUPERVISOR với các trường tham khảo hình ảnh kết hợp cùng bảng HR_EMPLOYEE để lấy ra dữ liệu. có đầy đủ chức năng thêm mới, sửa, xóa. Khi thêm mới thì phần Tên người phụ trách sẽ sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên.
sử dụng veas_deptSearch như của viewEvsAffirmorSetup.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban, Trạng thái làm việc - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118" không có data-default-text) . Khi sửa thì không cho phép sửa trường Tên người phụ trách.

 Dựa vào file viewPaSupervisor.html. Hãy tạo cho tôi một file viewPaEmpAccount.html - Người phụ trách lương lương nằm trong module /pa/workManagement. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng PA_EMP_ACCOUNT với các trường tham khảo hình ảnh. trường PA_EMP_ACCOUNT_NO khi thêm mới thì sử dụng PA_EMP_ACCOUNT_SEQ.NEXTVAL, kết hợp cùng bảng HR_EMPLOYEE để lấy ra dữ liệu. có đầy đủ chức năng thêm mới, sửa, xóa. Khi thêm mới thì phần Tên người phụ trách sẽ sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên.
sử dụng veas_deptSearch như của viewEvsAffirmorSetup.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban, Trạng thái làm việc - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118" không có data-default-text), Ngân hàng - ACCOUNT_TYPE (ữ liệu lấy lấy thông qua data-parent-code="14015883") . Khi sửa thì không cho phép sửa trường Tên người phụ trách.

căn cứ vào cấu trúc của viewAttendanceKeeper.html hãy sửa lại file viewPaSupervisor.html - Người phụ trách lương nằm trong module /pa/wagebase, mục đích của giao diện này để phân quyền cho các PERSON_ID của bảng PA_SUPERVISOR thông qua trường PERSON_ID, với điều kiện ACTIVITY = 1. bên trái là dữ liệu thông tin nhân viên lấy từ bảng PA_SUPERVISOR, khi click vào tên nhân viên ở bên trái, thì sẽ xuất hiện cơ cấu sơ đồ tổ chức ở bên phải (dữ liệu lấy từ bảng HR_DEPARTMENT), thêm điều kiện nếu trong bảng PA_SUPERVISOR_INFO có giá trị của trường PERSON_ID tương ứng với giá trị của trường PERSON_ID trong bảng PA_SUPERVISOR, tương ứng với PERSON_ID đó có giá trị DEPTNO  = DEPTNO trong bảng HR_DEPARTMENT thì sẽ xuất hiện nút chọn, cấu trúc 2 bảng PA_SUPERVISOR và PA_SUPERVISOR_INFO tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa. và chức năng thêm, sửa, xóa sẽ tác động vào bảng PA_SUPERVISOR và PA_SUPERVISOR_INFO, việc thêm dữ liệu vào bảng PA_SUPERVISOR tức lấy thông tin nhân viên để thêm vào. lưu ý trường PA_SUPERVISOR_NO của bảng PA_SUPERVISOR_INFO khi tạo mới là tự động tăng với giá trị PA_SUPERVISOR_SEQ.NEXTVAL. Khi thêm mới thì phần Tên người phụ trách sẽ sử dụng onclick="openEmployeeSearchPopup()"> như của educationSearch.html để tìm nhân viên.

căn cứ vào cấu trúc của viewSummaryFormula.html hãy Tạo cho tôi một file viewPaFormula.html - Công thức tính toán nằm trong module /pa/salary. Giao diện tham khảo hình ảnh. Mục đích của giao diện này để cấu hình công thức cho các ITEM_NO của bảng PA_ITEM_PARAM thông qua trường ITEM_NO, với điều kiện ACTIVITY = 1. Dữ liệu các ITEM được lấy ra sử dụng câu lệnh SQL: SELECT PI.ITEM_NO, SY.CONTENT ITEM_NAME
  FROM PA_ITEM PI, PA_ITEM_PARAM PIP, SY_GLOBAL_NAME SY
 WHERE PI.ITEM_NO = PIP.ITEM_NO
   AND PIP.CPNY_ID = #{lang, jdbcType=VARCHAR}
   AND PI.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{cpnyId, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
 ORDER BY PIP.CALCU_ORDER. khi click vào tên ở bên trái (tức là click vào ITEM_NAME), thì sẽ xuất hiện danh sách các node con ở bên phải (dữ liệu lấy từ bảng PA_FORMULAR thông qua trường ITEM_NO, sửu dụng câu lệnh SQL để lấy dữ liệu: SELECT FORMULAR_NO,
       ITEM_NO,
       CONDITION,
       FORMULAR,
       CONDITION_SEQ,
       DESCRIPTION,
       CPNY_ID
  FROM PA_FORMULAR T
 WHERE ITEM_NO = #{itemNo, jdbcType=VARCHAR}
   AND CPNY_ID = #{cnpyId, jdbcType=VARCHAR}
 ORDER BY CONDITION_SEQ DESC), cấu trúc bảng PA_FORMULAR tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa. và chức năng thêm, sửa, xóa sẽ tác động vào bảng PA_FORMULAR. lưu ý trường FORMULAR_NO của bảng PA_FORMULAR khi tạo mới là tự động tăng với giá trị PA_FORMULAR_SEQ.NEXTVAL. khi thêm mới vào bảng PA_FORMULAR thì sẽ lấy giá trị của trường ITEM_NO đang được chọn ở bên trái để thêm vào trường ITEM_NO của bảng PA_FORMULAR, CONDITION_SEQ = (SELECT NVL(MAX(CONDITION_SEQ), 0) + 1  FROM PA_FORMULAR WHERE ITEM_NO = #{itemNo, jdbcType=VARCHAR} AND CPNY_ID = #{cnpyId, jdbcType=VARCHAR}). Cột trình tự tính làm giống như Trình tụ tính của viewPaComputeItemParamList.html, khi bấm vào mũi tên thì thay đổi giá trị của trường CONDITION_SEQ chho nhau.

 khi bấm vào thêm mới hoặc chỉnh sửa công thức, sẽ hiện thêm phần công cụ ở bên dưới, thông tin tham khảo ở hình ảnh. với "Danh sách mục nhập" lấy dữ liệu từ câu lệnh: SELECT PI.PARAM_ITEM_ID  AS ITEM_ID,
       SY.CONTENT        AS ITEM_NAME
  FROM PA_PARAM_ITEM_PARAM T,
       PA_PARAM_ITEM       PI,
       SY_GLOBAL_NAME      SY
 WHERE T.PARAM_ITEM_NO = PI.PARAM_ITEM_NO
   AND T.PARAM_ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY PI.ORDER_NO; 
 với "Danh sách hạng mục lương" lấy dữ liệu từ câu lệnh: SELECT PI.ITEM_ID  AS ITEM_ID,
       SY.CONTENT  AS ITEM_NAME
  FROM PA_ITEM_PARAM  T,
       PA_ITEM        PI,
       SY_GLOBAL_NAME SY
 WHERE T.ITEM_NO = PI.ITEM_NO
   AND T.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY CALCU_ORDER;
 "Hạng mục chấm công" lấy dữ liệu từ câu lệnh: SELECT COLUMN_NAME  AS ITEM_ID,
       SY_GLOBAL_NAME.CONTENT  AS ITEM_NAME
  FROM USER_TAB_COLUMNS, AR_STA_ITEM, AR_STA_ITEM_PARAM, SY_GLOBAL_NAME
 WHERE TABLE_NAME = 'AR_SUMMARY_HAE'
   AND DATA_TYPE = 'NUMBER'
   AND COLUMN_NAME = STA_ITEM_ID
   AND AR_STA_ITEM.ITEM_NO = AR_STA_ITEM_PARAM.ITEM_NO
   AND AR_STA_ITEM_PARAM.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND AR_STA_ITEM.ITEM_NO = SY_GLOBAL_NAME.NO(+)
   AND SY_GLOBAL_NAME.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND AR_STA_ITEM.ACTIVITY = 1
   AND NOT EXISTS (SELECT *
          FROM PA_DISTINCT_LIST
         WHERE COLUMN_NAME = DISTINCT_FIELD
           AND TABLE_NAME = 'PA_HR_V'
           AND CPNY_ID = #{cpnyId, jdbcType=VARCHAR})
 ORDER BY AR_STA_ITEM_PARAM.CAL_ORDER

 "Tham số cố định" lấy dữ liệu từ câu lệnh: SELECT T.DISTINCT_FIELD AS ITEM_ID, SY.CONTENT AS ITEM_NAME
  FROM PA_DISTINCT_LIST T, SY_GLOBAL_NAME SY
 WHERE T.ID = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND T.TABLE_NAME = 'PA_HR_V'
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY T.ORDERNO, T.ID

 khi bấm vào từng tên của các hạng mục trong phần công cụ, sẽ lấy ra ITEM_ID của hạng mục đó và điền vào ô Công thức (Formular) trong form thêm mới hoặc chỉnh sửa công thức.

 Về mặt hiện thị, ở cột Điều kiện và Công thức đang hiển thị các ITEM_ID, khi hiển thị thì sẽ lấy giá trị của ITEM_ID đó để đi so sánh với các ITEM_ID lấy ra từ các câu lệnh SQL: SELECT II.ITEM_ID AS ITEM_ID, SY.CONTENT AS ITEM_NAME
  FROM IS_ITEM II, SY_GLOBAL_NAME SY
 WHERE II.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT DISTINCT IPI.PARAM_ID, SY.CONTENT
  FROM IS_PARAM_ITEM IPI, SY_GLOBAL_NAME SY
 WHERE IPI.PARAM_ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT PDL.DISTINCT_FIELD, SY.CONTENT
  FROM PA_DISTINCT_LIST PDL, SY_GLOBAL_NAME SY
 WHERE PDL.ID = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT PBI.ITEM_ID, SY.CONTENT
  FROM PA_BASIC_ITEM PBI, SY_GLOBAL_NAME SY
 WHERE PBI.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT PI.ITEM_ID AS ID, SY.CONTENT AS NAME
  FROM PA_ITEM PI, SY_GLOBAL_NAME SY
 WHERE PI.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT DISTINCT PPI.PARAM_ITEM_ID, SY.CONTENT
  FROM PA_PARAM_ITEM PPI, SY_GLOBAL_NAME SY
 WHERE PPI.PARAM_ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
UNION
SELECT ASI.STA_ITEM_ID, SY.CONTENT
  FROM AR_STA_ITEM ASI, SY_GLOBAL_NAME SY
 WHERE ASI.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
 để hiển thị thành ITEM_NAME cho dễ nhìn.

 căn cứ vào cấu trúc của viewPaFormula.html hãy Tạo cho tôi một file viewPaInputItemData.html - Hạng mục tiêu chuẩn nằm trong module /pa/salary. Giao diện tham khảo hình ảnh. Mục đích của giao diện này để thêm thông tin tiền lương liên quan đến từng PARAM_NO của bảng PA_PARAM_ITEM_PARAM thông qua trường PARAM_NO. Dữ liệu các ITEM được lấy ra sử dụng câu lệnh SQL: SELECT T.PARAM_NO,
       T.PARAM_ITEM_NO,
       T.DEFAULT_VAL,
       PI.PARAM_ITEM_ID,
       SY.CONTENT   AS PARAM_NAME
  FROM PA_PARAM_ITEM_PARAM T,
       PA_PARAM_ITEM       PI,
       SY_GLOBAL_NAME      SY
 WHERE T.PARAM_ITEM_NO = PI.PARAM_ITEM_NO
   AND T.PARAM_ITEM_NO = SY.NO
   AND SY.LANGUAGE = {#lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND PI.ITEM_TYPE = {#itemType, jdbcType=VARCHAR}
   AND T.ACTIVITY = '1'
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY PI.ORDER_NO. khi click vào tên ở bên trái (tức là click vào PARAM_NAME), thì sẽ xuất hiện danh sách các node con ở bên phải (dữ liệu lấy từ bảng PA_PARAM_DATA thông qua trường PARAM_NO, sửu dụng câu lệnh SQL để lấy dữ liệu: SELECT A.PARAM_DATA_NO,
                       A.PARAM_NO,
                       A.RETURN_VALUE,
                       BP.DISTINCT_FIELD,
                       BP.DISTINCT_FIELD_2ND,
                       SY0.CONTENT DISTINCT_FIELD_NAME,
                       SY1.CONTENT DISTINCT_FIELD_2ND_NAME,
                       D.EMPID,
                       D.LOCAL_NAME,
                       get_dept_name(D.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPT_NAME,
                       SY2.CONTENT POST_GRADE_NAME,
                       GET_GLOBAL_NAME(D.EMP_OFFICE, #{lang, jdbcType=VARCHAR}) EMP_OFFICE,
                       TO_CHAR(D.DATE_STARTED, 'YYYY-MM-DD') DATE_STARTED,
                       TO_CHAR(D.DATE_LEFT, 'YYYY-MM-DD') DATE_LEFT,
                       A.START_MONTH,
                       A.END_MONTH,
                       A.CPNY_ID,
                       SY4.CONTENT CPNY_NAME,
                       NVL(A.IS_APPLY, 'N') IS_APPLY,
                       A.REMARK
                  FROM PA_PARAM_DATA       A,
                       PA_PARAM_ITEM_PARAM BP,
                       HR_EMPLOYEE         D,
                       HR_COMPANY          HR,
                       SY_GLOBAL_NAME      SY0,
                       SY_GLOBAL_NAME      SY1,
                       SY_GLOBAL_NAME      SY2,
                       SY_GLOBAL_NAME      SY4,
                       PA_DISTINCT_LIST    PA1,
                       PA_DISTINCT_LIST    PA2
                 WHERE A.PARAM_NO = #{lang, jdbcType=VARCHAR}
                   AND A.PARAM_NO = BP.PARAM_NO
                   AND BP.DISTINCT_FIELD = PA1.DISTINCT_FIELD(+)
                   AND BP.CPNY_ID = PA1.CPNY_ID(+)
                   AND PA1.ID = SY0.NO(+)
                   AND SY0.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
                   AND BP.DISTINCT_FIELD_2ND = PA2.DISTINCT_FIELD(+)
                   AND BP.CPNY_ID = PA2.CPNY_ID(+)
                   AND PA2.ID = SY1.NO(+)
                   AND SY1.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
                   AND A.PERSON_ID = d.person_id
                   AND D.POST_GRADE_NO = SY2.NO(+)
                   AND SY2.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
                   AND A.CPNY_ID = HR.CPNY_ID
                   AND HR.CPNY_NO = SY4.NO(+)
                   AND SY4.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
                   AND A.ACTIVITY = 1
                   AND TO_DATE(#{payMonth, jdbcType=VARCHAR}, 'YYYYMM') >= TO_DATE(A.START_MONTH, 'MMYYYY')
                   AND TO_DATE(#{payMonth, jdbcType=VARCHAR}, 'YYYYMM') <= TO_DATE(NVL(A.END_MONTH, '129999'), 'MMYYYY')
                   AND (D.DATE_LEFT IS NULL OR TO_CHAR(D.DATE_LEFT, 'YYYYMM') >= to_char(add_months(to_date(#{payMonth, jdbcType=VARCHAR}, 'yyyymm'), -2), 'yyyymm'))
                 order by D.PERSON_ID, cấu trúc bảng PA_PARAM_DATA tham khảo hình ảnh, có đầy đủ chức năng thêm mới, sửa, xóa. và chức năng thêm, sửa, xóa sẽ tác động vào bảng PA_PARAM_DATA. lưu ý trường PARAM_DATA_NO của bảng PA_PARAM_DATA khi tạo mới là tự động tăng với giá trị PA_PARAM_DATA_SEQ.NEXTVAL. khi thêm mới vào bảng PA_PARAM_DATA thì sẽ lấy giá trị của trường PARAM_NO đang được chọn ở bên trái để thêm vào trường PARAM_NO của bảng PA_PARAM_DATA. Thêm các điều kiện tìm kiếm theo các trường khác như: Trạng thái làm việc - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"), Phòng ban, Họ tên/Mã nhân viên, payMonth (tháng trả lương) để dễ dàng tìm kiếm và quản lý dữ liệu.

Tương tự như chức năng upload file excel attNewOpenImportModal của viewApplyAttManagentByAnyApproverList.html, hãy tạo cho tôi một chức năng upload file excel (nội dung file excel tham khảo hình ảnh) để nhập dữ liệu vào bảng PA_PARAM_DATA_TEMP có trường tham khảo hình ảnh. Khi bấm vào nút Upload Excel thì sẽ hiện ra popup để chọn file excel cần upload, sau khi chọn file và bấm Upload & Import thì  thực hiện import dữ liệu từ file excel vào bảng PA_PARAM_DATA_TEMP (lưu ý lấy giá trị PARAM_NO của ITEM để đưa vào PARAM_NO của bảng PA_PARAM_DATA_TEMP). nếu nhập thành công thì hiển thị giao diện viewImportExcelTempPaParamList giao diện tham khảo hình ảnh. Sau khi bấm Lưu thì sẽ gọi đến pakage PKG_WAGEBASE_EXCEL_TEMP.PR_IMPORT_PAPARAM_DATA(
						 #adminID:VARCHAR#,#cpnyId:VARCHAR#,#distinctField:VARCHAR#
						,#message,jdbcType=VARCHAR,mode=OUT#) để thực hiện import dữ liệu . Nếu có lỗi trong quá trình import thì sẽ hiển thị lỗi đó ra giao diện để người dùng biết và chỉnh sửa lại file excel cho đúng rồi mới thực hiện import lại.


dựa vào cấu trúc của viewPaFormula.html hãy Tạo cho tôi một file viewPaResult.html - Kết quả tính toán nằm trong module /pa/salary. Giao diện tham khảo hình ảnh. Mục đích của giao diện này để thêm thông tin các hạng mục lương vào bảng PA_ITEM_INPUT với các trường tham khảo hình ảnh.
Hạng mục tích chọn - IS_USE lấy dữ liệu thông qua <option value="1">Đối chiếu chi tiết </option>
						<option value="2">Báo cáo chênh lệch lương</option>
						<option value="3">Các khoản trợ cấp - khấu trừ - bảo hiểm</option>
						<option value="4">Đối chiếu hạng mục-Đối chiếu kết quả-Đối chiếu chi trả-Đối chiếu bảo hiểm</option>
						<option value="5">Lương tháng/năm chi tiết</option>
						<option value="6">Phiếu lương</option>.
Phân biệt hạng mục - ITEM_TYPE lấy dữ liệu thông qua <option value="1">Khoản trả (chi tiết chấm công trong phiếu lương)</option>
						<option value="2">Khoản trừ (chi tiết tiền lương trong phiếu lương)</option>
						<option value="3">BH (chi tiết khoản trừ trong phiếu lương)</option>
						<option value="4">Các mục tiêu chuẩn (các mục tiêu chuẩn trong phiếu lương)</option>.
Hạng mục nhân sự lấy ra thông qua câu lệnh SQL: SELECT T.ID AS ITEM_NO, T.DISTINCT_FIELD AS ITEM_ID, SY.CONTENT ITEM_NAME, T.TABLE_NAME
  FROM PA_DISTINCT_LIST T, SY_GLOBAL_NAME SY
 WHERE T.ID = SY.NO(+)
   AND SY.LANGUAGE(+) = {lang, jdbcType=VARCHAR}
   AND T.TABLE_NAME = 'PA_HR_V'
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY T.ORDERNO, T.ID.
 Hạng mục chấm công lấy ra thông qua câu lệnh SQL: SELECT AR_STA_ITEM.ITEM_NO AS ITEM_NO,
COLUMN_NAME  AS ITEM_ID,
       SY_GLOBAL_NAME.CONTENT  AS ITEM_NAME
  FROM USER_TAB_COLUMNS, AR_STA_ITEM, AR_STA_ITEM_PARAM, SY_GLOBAL_NAME
 WHERE TABLE_NAME = 'AR_SUMMARY_HAE'
   AND DATA_TYPE = 'NUMBER'
   AND COLUMN_NAME = STA_ITEM_ID
   AND AR_STA_ITEM.ITEM_NO = AR_STA_ITEM_PARAM.ITEM_NO
   AND AR_STA_ITEM_PARAM.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND AR_STA_ITEM.ITEM_NO = SY_GLOBAL_NAME.NO(+)
   AND SY_GLOBAL_NAME.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND AR_STA_ITEM.ACTIVITY = 1
   AND NOT EXISTS (SELECT *
          FROM PA_DISTINCT_LIST
         WHERE COLUMN_NAME = DISTINCT_FIELD
           AND TABLE_NAME = 'PA_HR_V'
           AND CPNY_ID = #{cpnyId, jdbcType=VARCHAR})
 ORDER BY AR_STA_ITEM_PARAM.CAL_ORDER.
Hạng mục nhập lấy ra thông qua câu lệnh SQL: SELECT PI.PARAM_ITEM_NO AS ITEM_NO,
PI.PARAM_ITEM_ID  AS ITEM_ID,
       SY.CONTENT        AS ITEM_NAME
  FROM PA_PARAM_ITEM_PARAM T,
       PA_PARAM_ITEM       PI,
       SY_GLOBAL_NAME      SY
 WHERE T.PARAM_ITEM_NO = PI.PARAM_ITEM_NO
   AND T.PARAM_ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY PI.ORDER_NO; .
 Hạng mục tính lấy ra thông qua câu lệnh SQL: SELECT T.ITEM_NO AS ITEM_NO,
       PI.ITEM_ID AS ITEM_ID,
       SY.CONTENT AS ITEM_NAME
  FROM PA_ITEM_PARAM  T,
       PA_ITEM        PI,
       SY_GLOBAL_NAME SY
 WHERE T.ITEM_NO = PI.ITEM_NO
   AND T.ITEM_NO = SY.NO(+)
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}
   AND PI.ACTIVITY = 1
   AND T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
 ORDER BY CALCU_ORDER.
Khi tick chọn vào các hạng mục - item, thì sẽ lấy giá trị ITEM_NO, ITEM_NAME, ITEM_ID và thứ tự điền vào ở bên cạnh - ORDERNO, cùng với IS_USE và ITEM_TYPE để thêm vào bảng PA_ITEM_INPUT. INPUT_NO của bảng PA_ITEM_INPUT khi thêm mới sẽ được sinh ra tự động theo PA_ITEM_INPUT_SEQ.NEXTVAL
   AND SY.LANGUAGE(+) = #{lang, jdbcType=VARCHAR}

   thêm cho tôi điều kiện tìm kiếm sử dụng vpid_deptSearch như của viewPaInputItemData.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban. sử dụng vpwf_payScheduleNo như của viewPaWorkFlow.html để lấy ra danh sách kế hoạch trả lương làm điều kiện tìm kiếm. mục đích để khi chọn phòng ban và kế hoạch trả lương, sau đó tick chọn các hạng mục bên dưới thì Khi click vào nút xuất excel thì sẽ xuất ra file excel dữ liệu được lọc theo phòng ban và kế hoạch trả lương đã chọn để láy trong bảng PA_SUMMARY_HAE với các trường được lấy ra chính là các ITEM_ID đã được tick 
   chọn.

dựa vào cấu trúc của viewPaResult.html hãy Tạo cho tôi một file payStub.html - Phiếu lương nằm trong module /pa/workManagement. Giao diện tham khảo hình ảnh. điều kiện tìm kiếm sử dụng vpid_deptSearch như của viewPaInputItemData.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban. sử dụng vpwf_payScheduleNo như của viewPaWorkFlow.html để lấy ra danh sách kế hoạch trả lương làm điều kiện tìm kiếm, sử dụng cách tìm kiếm Họ tên / Mã NV như của viewPaInputItemData.html để tìm nhân viên. Trạng thái làm việc - EMP_OFFICE (dữ liệu lấy lấy thông qua data-parent-code="15118"). Thoogn tin phiếu lương sẽ được lấy ra từ bảng PA_SUMMARY_HAE với các trường tham khảo hình ảnh. với điều  kiện tìm kiếm sẽ tìm ra được 1 hoặc nhiều phiếu lương của nhân viên, nếu ra nhiều phiếu lương thì các phiếu lương sẽ được cách nhau và mỗi phiếu lương sẽ được giới hạn trong một khổ giấy A4 để dễ dàng in ấn. tương ứng với số lượng nhân viên tìm được sẽ chạy vòng lặp để chạy pakage PA_FOR_EMP_SALARY_PAGE_P(#{cpnyId, jdbcType=VARCHAR}, #{payScheduleNo, jdbcType=VARCHAR}, #{personId, jdbcType=VARCHAR}, #{adminID, jdbcType=VARCHAR}). sau đó sử dụng câu lệnh SQL sau để hiển thị dữ liệu vào phiếu lương: SELECT T.CPNY_ID,
       T.PERSON_ID,
       T.ITEM_TYPE,
       T.ITEM_NO,
       GET_GLOBAL_NAME(T.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NAME,
       T.ITEM_VALUE,
       T.ORDERNO,
       T.CREATE_BY,
       TO_CHAR(T.CREATE_DATE, 'DD-MM-YYYY') CREATE_DATE
  FROM PA_EMP_SALARY_PAGE_DATA T
 WHERE T.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND T.PERSON_ID = #{personId, jdbcType=VARCHAR}. 
sau khi lấy đựo dữ liệu từ bảng PA_EMP_SALARY_PAGE_DATA thì sẽ hiển thị vào phiếu lương, tương ứng với từng ITEM_TYPE sẽ hiển thị ở từng phần khác nhau trong phiếu lương, cụ thể như sau:
ITEM_TYPE = 1 sẽ hiển thị ở phần Chấm công chi tiết
ITEM_TYPE = 2 sẽ hiển thị ở phần Lương chi tiết
ITEM_TYPE = 3 sẽ hiển thị ở phần Khoản trừ chi tiết
ITEM_TYPE = 4 sẽ hiển thị ở phần Hạng mục tiêu chuẩn
phần Hạng mục khác sẽ hiển thị dữ liệu từ câu lệnh SQL: SELECT TO_NUMBER(NVL(C.RETURN_VALUE, 0)) RETURN_VALUE, C.REMARK
  FROM PA_PARAM_ITEM_PARAM B, PA_PARAM_DATA C, PA_SUMMARY_HAE PA
 WHERE B.PARAM_NO = C.PARAM_NO
   AND C.PERSON_ID = PA.PERSON_ID
   AND B.PARAM_ITEM_NO IN
       ('540099', '90000496', '90000495', '90000494', '90000493')
   AND C.ACTIVITY = '1'
   AND B.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND PA.PAY_SCHEDULE_NO = #{payScheduleNo, jdbcType=VARCHAR}
   AND PA.PERSON_ID = #{personId, jdbcType=VARCHAR}
   AND TO_DATE(TO_CHAR(TO_DATE(PA.PAY_DATE, 'YYYY-MM-DD'), 'MMYYYY'),
               'MMYYYY') BETWEEN TO_DATE(C.START_MONTH, 'MMYYYY') AND
       NVL(TO_DATE(C.END_MONTH, 'MMYYYY'), TO_DATE('129999', 'MMYYYY'))
 ORDER BY C.CREATE_DATE.

Căn cứ vào payStub.html hãy Tạo cho tôi một file viewPaMonthPersonInfoEssList.html - Phiếu lương cá nhân nằm trong module /pa/salary. viewPaMonthPersonInfoEssList sẽ giống hệt như payStub.html về mặt giao diện và cách lấy dữ liệu, chỉ khác ở chỗ viewPaMonthPersonInfoEssList chỉ có điều kiện tìm kiếm là Kế hoạch trả lương. Mục đích của viewPaMonthPersonInfoEssList là để hiển thị phiếu lương của cá nhân đó khi họ đăng nhập vào hệ thống để xem phiếu lương của mình. Khi lấy ra Kế hoạc trả lương cần lưu ý trường PA_OPEN_FLAG của bảng PA_WORK_FLOW, chỉ lấy ra những kế hoạch trả lương có PA_OPEN_FLAG = 1 để hiển thị trong điều kiện tìm kiếm, vì chỉ những kế hoạch trả lương có PA_OPEN_FLAG = 1 thì nhân viên mới được xem phiếu lương của mình.

Căn cứ vào viewPaMonthPersonInfoEssList.html hãy Tạo cho tôi một file changeUser.html - Thay đổi người dùng nằm trong module /ess/change. Giao diện tham khảo hình ảnh. sử dụng vppoOpenEmpSearch như của viewPaPayObj.html để tìm 1 nhân viên. sau khi tìm được, bấm vào Thay đổi người dùng thì sẽ thay người đăng nhập hệ thống bằng PERSON_ID của nhân viên vừa tìm được, sau khi thay đổi người dùng thành công thì sẽ tự động load lại hệ thống. và bay giờ người đăng nhập hệ thống chính là người vừa được thay đổi. Mục đích của chức năng này là để người phụ trách lương có thể thay đổi người dùng sang một nhân viên khác để xem phiếu lương của nhân viên đó mà không cần phải đăng nhập lại bằng tài khoản của nhân viên đó.

căn cứ vào viewEvsSchedulePanel.html hãy Tạo cho tôi một file viewRegPersonalTarget.html - Đăng ký mục tiêu cá nhân nằm trong module /evs/manage. Giao diện tham khảo hình ảnh. Danh sách Tên đánh giá được lấy từ /api/resume/evsResumeList. Dữ liệu THông tin cá nhân lấy từ câu lệnh SQL: SELECT OBJECT.SEQ,
       RESUME.EVS_YEAR,
       OBJECT.RESUME_SEQ,
       OBJECT.LOCAL_NAME,
       OBJECT.POST_GRADE_NAME,
       OBJECT.MAIN_BUSINESS,
       GET_GLOBAL_NAME(OBJECT.MAIN_BUSINESS, #{lang, jdbcType=VARCHAR}) MAIN_BUSINESS_NAME,
       OBJECT.OBJECT_TYPE,
       OBJECT.OBJECT_TYPE_NAME,
       GET_DEPT_NAME(OBJECT.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
       TO_CHAR(OBJECT.DATE_STARTED, 'DD/MM/YYYY') DATE_STARTED,
       OBJECT.ACTIVITY,
       TO_CHAR(TO_DATE(RESUME.EVS_START_DATE, 'DD/MM/YYYY'), 'DD/MM/YYYY') EVS_START_DATE,
       TO_CHAR(TO_DATE(RESUME.EVS_END_DATE, 'DD/MM/YYYY'), 'DD/MM/YYYY') EVS_END_DATE,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'LOCAL_NAME') LOCAL_NAME0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'LOCAL_NAME') LOCAL_NAME1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'LOCAL_NAME') LOCAL_NAME2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'SEQ') SEQ0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'SEQ') SEQ1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'SEQ') SEQ2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'EVS_POINT') EVS_POINT0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'EVS_POINT') EVS_POINT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'EVS_POINT') EVS_POINT2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'EVS_GRADE') EVS_GRADE0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'EVS_GRADE') EVS_GRADE1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'EVS_GRADE') EVS_GRADE2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'AFFIRM_CONTENT') ||
       '<br>' ||
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'AFFIRM_CONTENT2') AFFIRM_CONTENT0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'AFFIRM_CONTENT') AFFIRM_CONTENT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'AFFIRM_CONTENT') AFFIRM_CONTENT2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'AFFIRM_COMMENT') AFFIRM_COMMENT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'AFFIRM_COMMENT') AFFIRM_COMMENT2
  FROM EVS_RESUME_INFO RESUME, EVS_OBJECT OBJECT
 WHERE RESUME.SEQ = OBJECT.RESUME_SEQ
   AND RESUME.SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND OBJECT.PERSON_ID = #{adminID, jdbcType=VARCHAR}
 ORDER BY OBJECT.PERSON_ID ASC.
Dữ liệu Objective Confirm láy ra từ câu lệnh SQL: SELECT SEQ,
       RESUME_SEQ,
       EVS_OBJECT_SEQ,
       ITEM_NAME,
       ITEM_CONTENT,
       ITEM_CONTENT ITEM_CONTENT_TEXT,
       NVL(ITEM_SCORE, 0) ITEM_SCORE,
       NVL(EVS_SCORE, 0) EVS_SCORE,
       NVL(EVS_SCORE1, 0) EVS_SCORE1,
       NVL(EVS_SCORE2, 0) EVS_SCORE2,
       NVL(AFFIRM_SCORE, 0) AFFIRM_SCORE,
       TO_CHAR(START_DATE, 'DD/MM/YYYY') START_DATE,
       TO_CHAR(END_DATE, 'DD/MM/YYYY') END_DATE,
       CREATE_DATE,
       CREATED_BY,
       CREATED_IP,
       UPDATE_DATE,
       UPDATED_BY,
       UPDATED_IP,
       ACTIVITY
  FROM EVS_ITEM_SST
 WHERE EVS_OBJECT_SEQ = #{evsObjectSeq, jdbcType=VARCHAR}
 ORDER BY TO_NUMBER(SEQ).
 Ở Phần 2 ý kiến của người đánh giá cấp 1 và cấp 2 lấy đx liệu từ PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'AFFIRM_COMMENT') AFFIRM_COMMENT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'AFFIRM_COMMENT') AFFIRM_COMMENT2 ở trên.
Ở phần Objective Confirm có nút (+) để thêm mới mục tiêu, khi bấm vào sẽ hiện ra form để nhập thông tin mục tiêu, khi bấm và Lưu tạm thời (FLAG = 0) sẽ thêm dữ liệu vào bảng EVS_ITEM_SST (có các trường tham khảo hình ảnh) với trường EVS_OBJECT_SEQ lấy giá trị từ OBJECT.SEQ của câu lệnh SQL trên. trường SEQ của bảng EVS_ITEM_SST khi thêm mới sẽ được sinh ra tự động theo EVS_PARAM_SEQ.NEXTVAL. Hạng mục đánh giá lưu vào trường ITEM_NAME, nội dung mục tiêu lưu vào trường ITEM_CONTENT, điểm mục tiêu lưu vào trường ITEM_SCORE. Khi bấm vào Thục hiện (FLAG = 1) thì ngoài việc lưu lại giống chức năng của Lưu tạm thời thì sẽ gọi thêm pakage PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
						#EVS_OBJECT_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#FLAG:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#).

Trường ACTIVITY của bảng EVS_OBJECT sẽ có giá trị tương ứng với các giai đoạn của quá trình đánh giá: 14015361 - Kết thúc
14015362 - Từ chối
14015365 - Xác nhận mục tiêu (lần 2)
14015364 - Xác nhận mục tiêu (lần 1)
14015354 - Đăng ký đánh giá
14015356 - Đánh giá bản thân
14015352 - Not started
14015357 - Đánh giá lần 1
14015358 - Đánh giá lần 2
14015363 - Hoàn thành
.

căn cứ vào viewRegPersonalTarget.html hãy Tạo cho tôi một file viewConfirmTarget1.html - Xác nhận mục tiêu (lần 1) nằm trong module /evs/manage. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       RESUME_SEQ,
       PERSON_ID,
       EMPID,
       LOCAL_NAME,
       DEPTNO,
       GET_DEPT_NAME(DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
       POST_GRADE_NO,
       POST_GRADE_NAME,
       MAIN_BUSINESS,
       GET_GLOBAL_NAME(MAIN_BUSINESS, #{lang, jdbcType=VARCHAR}) MAIN_BUSINESS_NAME,
       OBJECT_TYPE,
       OBJECT_TYPE_NAME,
       DATE_STARTED,
       ACTIVITY,
       GET_CODE_NAME(ACTIVITY, #{lang, jdbcType=VARCHAR}) ACTIVITY_NAME,
       CREATE_DATE,
       CREATED_IP,
       CREATED_BY,
       UPDATE_DATE,
       UPDATED_IP,
       UPDATED_BY,
       ORDERNO
  FROM EVS_OBJECT A
 WHERE SEQ IN (SELECT AFF.EVS_OBJECT_SEQ
                 FROM EVS_AFFIRM AFF
                WHERE AFF.RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
                  AND AFF.AFFIRMOR_ID = #{adminID, jdbcType=VARCHAR}
                  AND AFF.AFFIRM_LEVEL = #{affirmLevel, jdbcType=VARCHAR})
 ORDER BY A.ORDERNO_DEPT, A.ORDERNO, A.DATE_STARTED.
Dữ liệu lấy ra chính là danh sách những nhân viên mà người đánh giá cấp 1 cần phải xác nhận mục tiêu cho họ, khi dòng dữ liệu cảu nhân viên đó có ACTIVITY = 14015364 (Xác nhận mục tiêu (lần 1)), thì tên sẽ hiển thị màu xanh và click vào thì sẽ hiển thị ra các mục tiêu của nhân viên đó ở phần Objective Confirm giống như ở viewRegPersonalTarget.html (tham khảo hình ảnh).
Khi bấm Xác nhận (flag = '1') hoặc từ chối (flag = '0'), sẽ gọi stored procedure PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
						#EVS_OBJECT_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#flag:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#), đồng thời cũng cập nhật lại trường AFFIRM_COMMENT của bảng EVS_AFFIRM thông qua câu lệnh UPDATE EVS_AFFIRM
			   SET AFFIRM_COMMENT = #AFFIRM_COMMENT:VARCHAR#
			 WHERE AFFIRM_LEVEL = #affirmLevel:VARCHAR#
			   AND EVS_OBJECT_SEQ = #EVS_OBJECT_SEQ:VARCHAR#. Bảng EVS_AFFIRM có các trường tham khảo hình ảnh, trong đó trường AFFIRM_COMMENT sẽ lưu lại ý kiến của người đánh giá khi họ xác nhận hoặc từ chối mục tiêu của nhân viên đó. Khi xác nhận hoặc từ chối xong thì sẽ tự động load lại trang viewConfirmTarget1.html để cập nhật lại danh sách những nhân viên cần phải xác nhận mục tiêu.

Giống như viewConfirmTarget1.html, hãy tạo cho tôi một file viewConfirmTarget2.html - Xác nhận mục tiêu (lần 2) nằm trong module /evs/manage. Giao diện và cách lấy dữ liệu tương tự như viewConfirmTarget1.html, chỉ khác ở chỗ viewConfirmTarget2.html sẽ hiển thị danh sách những nhân viên mà người đánh giá cấp 2 cần phải xác nhận mục tiêu cho họ, khi dòng dữ liệu của nhân viên đó có ACTIVITY = 14015365 (Xác nhận mục tiêu (lần 2)), thì tên sẽ hiển thị màu xanh và click vào thì sẽ hiển thị ra các mục tiêu của nhân viên đó ở phần Objective Confirm giống như ở viewRegPersonalTarget.html (tham khảo hình ảnh). Khi bấm Xác nhận (flag = '1') hoặc từ chối (flag = '0'), sẽ gọi stored procedure PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
            #EVS_OBJECT_SEQ:VARCHAR#,
            #adminID:VARCHAR#,
            #adminIP:VARCHAR#,
            #flag:VARCHAR#,
            #message,jdbcType=VARCHAR,mode=OUT#), đồng thời cũng cập nhật lại trường AFFIRM_COMMENT của bảng EVS_AFFIRM tương tự như ở viewConfirmTarget1.html. Khi xác nhận hoặc từ chối xong thì sẽ tự động load lại trang viewConfirmTarget2.html để cập nhật lại danh sách những nhân viên cần phải xác nhận mục tiêu lần 2.

Giống như viewRegPersonalTarget.html, hãy tạo cho tôi một file viewEvsBySelfHAE.html - Đánh giá bản thân nằm trong module /evs/manage. Giao diện và cách lấy dữ liệu tương tự như viewConfirmTarget1.html, chỉ khác ở chỗ viewEvsBySelfHAE.html sẽ thêm một cột mới là Điểm đánh giá bản thân, cột này sẽ lấy dữ liệu từ trường EVS_SCORE của bảng EVS_ITEM_SST. Người dùng không thể sửa dữ liệu ở các cột khác mà chỉ có thể nhập điểm ở cột Điểm đánh giá bản thân này. điểm này chính là tỷ lệ của cột Tỷ lệ(%) tương ứng. sau khi nhập thì sẽ tính toán điểm tổng. khi bấm vào nút Lưu tạm thời (flag = '0') hoặc thực hiện (flag = '1') thì sẽ cập nhật lại trường EVS_SCORE của bảng EVS_ITEM_SST với điểm mà nhân viên vừa nhập vào. Khi bấm vào Thục hiện (FLAG = 1) thì ngoài việc lưu lại giống chức năng của Lưu tạm thời thì sẽ gọi thêm pakage PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
						#EVS_OBJECT_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#FLAG:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#).

ở đây thì phần 2 là Thành tích và Hạn chế của bản thân, phần này sẽ lấy dữ liệu từ trường AFFIRM_CONTENT và AFFIRM_CONTENT2 của bảng EVS_AFFIRM, trong đó AFFIRM_LEVEL = 0 sẽ là ý kiến của nhân viên về thành tích và hạn chế của bản thân, AFFIRM_LEVEL = 1 sẽ là ý kiến của người đánh giá cấp 1 về thành tích và hạn chế của nhân viên đó, AFFIRM_LEVEL = 2 sẽ là ý kiến của người đánh giá cấp 2 về thành tích và hạn chế của nhân viên đó. Thêm cho tôi ô tính Tổng với Điểm ĐGBT. Tổng sẽ được tính toán dựa vào công thức: (Điểm ĐGBT * Tỷ lệ(%)) / 100 của từng mục tiêu. Khi nhân viên nhập điểm ĐGBT xong thì sẽ tự động tính toán lại điểm tổng của từng mục tiêu và điểm tổng chung của tất cả các mục tiêu để nhân viên có thể biết được điểm tổng đánh giá bản thân của mình là bao nhiêu.


căn cứ vào viewConfirmTarget1.html, hãy tạo cho tôi một file viewAffirmTarget1.html - Đánh gái lần 1 nằm trong module /evs/manage. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT OBJECT.SEQ,
       RESUME.EVS_YEAR,
       OBJECT.RESUME_SEQ,
       OBJECT.LOCAL_NAME,
       OBJECT.POST_GRADE_NAME,
       OBJECT.MAIN_BUSINESS,
       GET_GLOBAL_NAME(OBJECT.MAIN_BUSINESS, #{lang, jdbcType=VARCHAR}) MAIN_BUSINESS_NAME,
       OBJECT.OBJECT_TYPE,
       OBJECT.OBJECT_TYPE_NAME,
       GET_DEPT_NAME(OBJECT.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
       TO_CHAR(OBJECT.DATE_STARTED, 'DD/MM/YYYY') DATE_STARTED,
       OBJECT.ACTIVITY,
       TO_CHAR(TO_DATE(RESUME.EVS_START_DATE, 'DD/MM/YYYY'), 'DD/MM/YYYY') EVS_START_DATE,
       TO_CHAR(TO_DATE(RESUME.EVS_END_DATE, 'DD/MM/YYYY'), 'DD/MM/YYYY') EVS_END_DATE,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'LOCAL_NAME') LOCAL_NAME0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'LOCAL_NAME') LOCAL_NAME1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'LOCAL_NAME') LOCAL_NAME2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'SEQ') SEQ0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'SEQ') SEQ1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'SEQ') SEQ2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'EVS_POINT') EVS_POINT0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'EVS_POINT') EVS_POINT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'EVS_POINT') EVS_POINT2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'EVS_GRADE') EVS_GRADE0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'EVS_GRADE') EVS_GRADE1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'EVS_GRADE') EVS_GRADE2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'AFFIRM_CONTENT') ||
       '<br>' ||
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 0, 'AFFIRM_CONTENT2') AFFIRM_CONTENT0,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'AFFIRM_CONTENT') AFFIRM_CONTENT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'AFFIRM_CONTENT') AFFIRM_CONTENT2,

       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 1, 'AFFIRM_COMMENT') AFFIRM_COMMENT1,
       PKG_EVS_PROCESS.GET_EVS_AFFIRM_INFO(OBJECT.SEQ, 2, 'AFFIRM_COMMENT') AFFIRM_COMMENT2
  FROM EVS_RESUME_INFO RESUME, EVS_OBJECT OBJECT
 WHERE RESUME.SEQ = OBJECT.RESUME_SEQ
   AND RESUME.SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND OBJECT.SEQ  IN (SELECT AFF.EVS_OBJECT_SEQ
                 FROM EVS_AFFIRM AFF
                WHERE AFF.RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
                  AND AFF.AFFIRMOR_ID = #{adminID, jdbcType=VARCHAR}
                  AND AFF.AFFIRM_LEVEL = #{affirmLevel, jdbcType=VARCHAR})
 ORDER BY OBJECT.ORDERNO_DEPT, OBJECT.ORDERNO, OBJECT.DATE_STARTED.
 Phần Phân bổ cấp đánh giá sẽ lấy dữ liệu và hiển thị giống như phần Tiêu chuẩn cơ bản của viewEvsResult.html. Phần Cấp đánh giá với Điểm nhỏ nhất và Điểm lớn nhất là lấy từ câu lệnh SQL: SELECT SEQ,
       RESUME_SEQ,
       EVS_TYPE,
       GET_CODE_NAME(EVS_TYPE, #{lang, jdbcType=VARCHAR}) EVS_TYPE_NAME,
       EVS_GRADE,
       GET_CODE_NAME(EVS_GRADE, #{lang, jdbcType=VARCHAR}) EVS_GRADE_ORIGINAL,
       DECODE(GET_CODE_NAME(EVS_GRADE, #{lang, jdbcType=VARCHAR}),
              'A',
              'EX',
              'B',
              'VG',
              'C',
              'GD',
              'D',
              'NI',
              'E',
              'UN') EVS_GRADE_NAME,
       IS_INCLUDE,
       START_SCORE,
       END_SCORE,
       SCORE,
       REMARK,
       ACTIVITY,
       DISTRIBUTION_RATE,
       TO_CHAR(UPDATE_DATE, 'DD/MM/YYYY HH24:MI') UPDATE_DATE,
       GET_UPDATED_INFO(UPDATED_BY) || ' ' || UPDATED_IP UPDATED_BY
  FROM EVS_GRADE
 WHERE ACTIVITY <> 2
   AND RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
 ORDER BY TO_NUMBER(SEQ)

 Ở phần tỷ lệ tiêu chuẩn lấy dữ liệu từ các trường A, B, C, D, E tương ứng với các cấp đánh giá EX, VG, GD, NI, UN của bảng EVS_SCORE tương ứng với RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}. để tính tỷ lệ tương ứng với Số nhân viên viên đánh giá.


 Khi tất cả nhân viên trong danh sách có Điểm số và Cấp ĐG (đã bấm lưu tạm thời xong) thì nút Thực hiện (flag = '1') sẽ hiện ra. Khi bấm vào Thục hiện (FLAG = 1) thì ngoài việc lưu lại giống chức năng của Lưu tạm thời thì sẽ gọi thêm pakage PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
						#EVS_OBJECT_SEQ:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#FLAG:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#).


Giống như viewAffirmTarget1.html, hãy tạo cho tôi một file viewAffirmTarget2.html - Đánh giá lần 2 nằm trong module /evs/manage. Giao diện và cách lấy dữ liệu tương tự như viewAffirmTarget1.html, chỉ khác ở chỗ viewAffirmTarget2.html sẽ hiển thị danh sách những nhân viên mà người đánh giá lần 2 cần phải đánh giá cho họ. Hiển thị thêm 3 cột Lần 2(Điểm số - EVS_POINT2, Cấp ĐG - EVS_GRADE2, Ý kiến - AFFIRM_CONTENT2), nhập điểm thì cũng tự tính ra cấp đánh giá tương ứng, giống như viewAffirmTarget1.html. Cũng có nút Lưu tạm thời (flag = '0') và Thực hiện (flag = '1') chức năng giống như viewAffirmTarget1.html. Khi click vào tên nhân viên  thì cũng hiện ra modal hiển thị chi tiết các mục tiêu của nhân viên đó giống như viewAffirmTarget1.html. Thêm cột Đánh giá lần 2 để điền điểm (%) do người đánh giá lần 2 nhập vào, khi nhập điểm xong thì tự động tính ra cấp đánh giá tương ứng và hiển thị ở cột Cấp ĐG lần 2. Thêm một dòng Ý kiến, Điểm số, Cấp ĐG của người đánh giá lần 2 giống như lần 1. Khi nhập điểm thì cũng tự tính toán điểm tổng dựa vào công thức: (Điểm ĐG lần 2 * Tỷ lệ(%)) / 100 của từng mục tiêu, và cũng hiện ở cột Điểm số của người đánh giá lần 2. cũng tự tính ra Cấp đánh giá giống như lần 1. Cũng có chức năng, Lưu tạm thời ('draft') và Thực hiện ('confirm') và Từ chối (flag = '0') chức năng giống như viewAffirmTarget1.html. Chỉ khác là những giá trị nhập điểm của người đánh giá lần 2 sẽ lưu vào trường EVS_SCORE2 của bảng EVS_ITEM_SST.

Giống như viewRegPersonalTarget.html, hãy tạo cho tôi một file viewEvsBySelfSSTAbility.html - Đánh giá năng lực bản thân nằm trong module /evs/manage. Giao diện tham khảo hình ảnh. Dữ liệu phần SECTION 1 lấy ra dựa vào câu lệnh SQL: SELECT ITEM.SEQ,
       GET_CODE_NAME(ITEM.GROUP_NO, #{lang, jdbcType=VARCHAR}) GROUP_NAME,
       ITEM.ITEM_CODE,
       ITEM.ITEM_NAME,
       ITEM.REMARK,
       ITEM.ITEM_NAME_KO,
       ITEM.REMARK_KO,
       PARAM.ITEM_SCORE,
       EVS.EVS_OCC_GROUP_NAME,
       (SELECT SCORE.EVS_SCORE
          FROM EVS_ITEM_SCORE SCORE, EVS_AFFIRM AFFIRM
         WHERE SCORE.AFFIRM_SEQ = AFFIRM.SEQ
           AND SCORE.ITEM_SEQ = ITEM.SEQ
           AND AFFIRM.EVS_OBJECT_SEQ = EVS.SEQ
           AND AFFIRM.AFFIRM_LEVEL = 0) EVS_SCORE0,
       (SELECT SCORE.EVS_SCORE
          FROM EVS_ITEM_SCORE SCORE, EVS_AFFIRM AFFIRM
         WHERE SCORE.AFFIRM_SEQ = AFFIRM.SEQ
           AND SCORE.ITEM_SEQ = ITEM.SEQ
           AND AFFIRM.EVS_OBJECT_SEQ = EVS.SEQ
           AND AFFIRM.AFFIRM_LEVEL = 1) EVS_SCORE1,
       (SELECT SCORE.EVS_SCORE
          FROM EVS_ITEM_SCORE SCORE, EVS_AFFIRM AFFIRM
         WHERE SCORE.AFFIRM_SEQ = AFFIRM.SEQ
           AND SCORE.ITEM_SEQ = ITEM.SEQ
           AND AFFIRM.EVS_OBJECT_SEQ = EVS.SEQ
           AND AFFIRM.AFFIRM_LEVEL = 2) EVS_SCORE2
  FROM EVS_OBJECT EVS, EVS_ITEM ITEM, EVS_ITEM_PARAM PARAM
 WHERE ITEM.RESUME_SEQ = PARAM.RESUME_SEQ
   AND ITEM.ITEM_CODE = PARAM.ITEM_CODE
   AND PARAM.RESUME_SEQ = EVS.RESUME_SEQ
   AND PARAM.EVS_OCC_GROUP = EVS.EVS_OCC_GROUP
   AND PARAM.EVS_GROUP = EVS.EVS_GROUP
   AND EVS.RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND PARAM.ACTIVITY <> 2
   AND EVS.PERSON_ID = #{adminID, jdbcType=VARCHAR}
 ORDER BY TO_NUMBER(ITEM.SEQ). Cột Tự đánh giá (EVS_SCORE0) sẽ là cột để nhân viên nhập điểm tự đánh giá năng lực của bản thân, các giá trị nhập được lấy từ cấu lệnh SQL: SELECT SEQ,
       PARAM_TYPE,
       RESUME_SEQ,
       CODE_NO,
       CODE_NAME,
       FORMULA,
       REMARK,
       ACTIVITY,
       ORDERNO,
       START_STEP,
       LIST_TYPE,
       EVS_SCORE
  FROM EVS_PARAM A
 WHERE ACTIVITY <> 2
   AND RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND PARAM_TYPE = 'ITEM'
 ORDER BY TO_NUMBER(SEQ). Cũng có chức năng Lưu tạm thời (flag = '0') và Thực hiện (flag = '1') giống như viewRegPersonalTarget.html, khi Lưu thì sẽ Thêm mới hoặc cập nhật lại trường EVS_SCORE của bảng EVS_ITEM_SCORE với điểm mà nhân viên vừa nhập vào, các trường của bảng EVS_ITEM_SCORE tham khảo hình anh. khi thêm mới vào bảng EVS_ITEM_SCORE thì giá trị của trường SEQ sẽ được tăng dần dựa vào EVS_PARAM_SEQ.NEXTVAL. Khi bấm vào Thục hiện (FLAG = 1) thì ngoài việc lưu lại giống chức năng của Lưu tạm thời thì sẽ gọi thêm pakage PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY(
            #EVS_OBJECT_SEQ:VARCHAR#,
            #adminID:VARCHAR#,
            #adminIP:VARCHAR#,
            #FLAG:VARCHAR#,
            #message,jdbcType=VARCHAR,mode=OUT#). 

Hãy chỉnh sửa lại cách tính tổng điểm. Tổng điểm sẽ được tính dựa vào công thức: Điểm Tự đánh giá * Điểm chỉ tiêu / (Điểm tối đa) của từng mục tiêu, . Ví dụ, trong dánh sách điểm được lấy ra có 1,2,3,4,5. thì nếu người dùng nhập điểm là 3 thì điểm được tính sẽ là 3 * Điểm chỉ tiêu / 5, sau đó cộng tổng điểm của tất cả các mục tiêu lại với nhau để ra được tổng điểm đánh giá của nhân viên đó.


Giống như viewAffirmTarget1.html, hãy tạo cho tôi một file viewAffirmTarget1Ability.html - Đánh giá năng lực lần 1 nằm trong module /evs/manage. Có 1 điểm khác là khi bấm vào tên nhân viên sẽ hiển thị ra modal hiển thị chi tiết các năng lực của nhân viên đó nhưng cột Đánh giá lần 1 sẽ là ác giá trị nhập được lấy từ cấu lệnh SQL: SELECT SEQ,
       PARAM_TYPE,
       RESUME_SEQ,
       CODE_NO,
       CODE_NAME,
       FORMULA,
       REMARK,
       ACTIVITY,
       ORDERNO,
       START_STEP,
       LIST_TYPE,
       EVS_SCORE
  FROM EVS_PARAM A
 WHERE ACTIVITY <> 2
   AND RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND PARAM_TYPE = 'ITEM'
 ORDER BY TO_NUMBER(SEQ). và cách tính ra tổng điểm cũng giống như viewEvsBySelfSSTAbility.html.


 Giống như viewAffirmTarget2.html, hãy tạo cho tôi một file viewAffirmTarget2Ability.html - Đánh giá năng lực lần 2 nằm trong module /evs/manage. Có 1 điểm khác là khi bấm vào tên nhân viên sẽ hiển thị ra modal hiển thị chi tiết các năng lực của nhân viên đó nhưng cột Đánh giá lần 2 sẽ là ác giá trị nhập được lấy từ cấu lệnh SQL: SELECT SEQ,
       PARAM_TYPE,
       RESUME_SEQ,
       CODE_NO,
       CODE_NAME,
       FORMULA,
       REMARK,
       ACTIVITY,
       ORDERNO,
       START_STEP,
       LIST_TYPE,
       EVS_SCORE
  FROM EVS_PARAM A
 WHERE ACTIVITY <> 2
   AND RESUME_SEQ = #{resumeSeq, jdbcType=VARCHAR}
   AND PARAM_TYPE = 'ITEM'
 ORDER BY TO_NUMBER(SEQ). và cách tính ra tổng điểm cũng giống như viewEvsBySelfSSTAbility.html.

 ở đây hãy thêm cho tôi 3 dòng liên quan đến Nghỉ phép, Tăng ca và Nghỉ bất thường của người dùng. 
 Phần Nghỉ phép sẽ hiện ra số lượng đơn nghỉ phép mà nhân viên đó đã đăng ký trong khoảng thời gian của tháng hiện tại, dữ liệu lấy ra dựa vào viewApplyAttendanceInfoList.html với điều kiện tìm kiếm là Thời gian bắt đầu và kết thúc của đơn nằm trong khoảng thời gian của tháng hiện tại.
 phần Tăng ca sẽ hiện ra số lượng đơn tăng ca mà nhân viên đó đã đăng ký trong khoảng thời gian của tháng hiện tại, dữ liệu lấy ra dựa vào viewPOtApplyInfoList.html với điều kiện tìm kiếm là Thời gian bắt đầu và kết thúc của đơn nằm trong khoảng thời gian của tháng hiện tại.
 phần Nghỉ bất thường sẽ hiện ra số lượng Nghỉ bất thường mà nhân viên đó trong khoảng thời gian của tháng hiện tại. Dữ liệu lấy ra dựa vào viewShowCwaAbnormalApply.html với điều kiện tìm kiếm là Thời gian bắt đầu và kết thúc của đơn nằm trong khoảng thời gian của tháng hiện tại.


 Ở đây hãy thể hiện tình hình chấm công và tăng ca theo từng ngày từ ngày 25 tháng trước đến 24 tháng này. Ở trên cũng có ô input để nhập giá trị ngày giống như vrl_standardDate của /evs/manage/viewResumeList.html. Dữ liệu chấm công lấy ra dựa vào viewAttendancePersonalInfoList, Dữ liệu tăng ca lấy ra dựa vào viewPersonOtApplyInfoList. hãy thể hiện bàng dạng biểu đồ cột hoặc một dạng nào đó để nhìn vào trực quan nhất.

 Ở trong bảng HR_EMPLOYEE có trường DATE_STARTED là ngày nhân viên vào công ty nhận việc, DATE_LEFT là ngày nhân viên nghỉ việc. dựa vòa đó hãy làm cho tôi một biểu đồ dạng cột kết hợp với biểu đồ dạng đường, thể hiện số lượng nhân viên làm việc trong từng tháng (tính đến ngày cuối tháng) của năm hiện tại.

Giống như viewApplyAttManagentByAnyApproverList.html, hãy tạo cho tôi một file viewApplyAttenanceBatchInfoList.html - Xin nghỉ phép nằm trong module /ess/infoApplyAttendance. 

Khi chọn ra được nhân việc thì sẽ tự động điền luôn Phòng ban sau đó sử dụng person_id của nhân viên đó cùng với ngày hiện tại (dạng YYYY-MM-DD) để điền các thông tin của nhân viên đó vào các trường tương ứng như:
Thời gian bắt đầu sử dụng function get_ar_shift_start_time(#{personId, jdbcType=VARCHAR}, TO_CHAR(SYSDATE, 'YYYY-MM-DD'), #{interCpnyID, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{personId, jdbcType=VARCHAR}, TO_CHAR(SYSDATE, 'YYYY-MM-DD'), #{interCpnyID, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Phép năm còn lại sử dụng function GET_VAC_COUNT(#{personId, jdbcType=VARCHAR}, #{interCpnyID, jdbcType=VARCHAR}, TO_CHAR(Thời gian bắt đầu, 'YYYY-MM-DD'), TO_CHAR(Thời gian kết thúc, 'YYYY-MM-DD'))
Ca làm việc sử dụng function GET_GLOBAL_NAME(GET_AR_SHIFTNO(#{personId, jdbcType=VARCHAR},TO_CHAR(SYSDATE, 'YYYY-MM-DD'),#{interCpnyID, jdbcType=VARCHAR}),#{lang, jdbcType=VARCHAR})

Khi Lưu check thêm cho tôi 1 điều kiện, sử dụng câu lệnh SQL: SELECT AR_GET_LEAVE_CLASH('',#{personId, jdbcType=VARCHAR}, #{fromTime, jdbcType=VARCHAR}, #{toTime, jdbcType=VARCHAR}) FROM DUAL; 
Nếu kết quả trả về là > 0 thì báo lỗi: "Trùng với chấm công trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!"
Nếu kết quả trả về = -1 thì báo lỗi: "Ngày công đã chốt, xin kiểm tra lại!"
Nếu kết quả trả về = -2 thì báo lỗi: "Thời gian đã khóa, xin kiểm tra lại!"

Thêm ô checkbox để chọn có hủy đơn hay không, Sau khi tick chọn và bấm vào nút Hủy đơn ở bên cạnh nút Lưu thì sẽ cập nhật lại trường ACTIVITY của bảng ESS_LEAVE_APPLY_TB thành 1, đồng thời cập nhật lại trường AFFIRM_FLAG thành 14014310. Sau đó gọi thêm package PKG_AFFIRM_EMAIL.PR_DELETE_LEAVE_CONFIRM(
            #{applyNo, jdbcType=VARCHAR, mode=IN},
            #{message, jdbcType=VARCHAR, mode=OUT}
        ). tiếp theo sử dụng câu lệnh SQL: SELECT SY.APPLY_NO, SY.APPLY_TYPE, SY.APPLY_FLAG
          FROM SY_AFFIRM_EMAIL SY
         WHERE EXISTS (SELECT 1
                  FROM SY_AFFIRM_EMAIL SY2
                 WHERE SY.APPLY_NO = SY2.APPLY_NO
                   AND SY.APPLY_TYPE = SY2.APPLY_TYPE
                   AND SY.APPLY_FLAG = SY2.APPLY_FLAG
                   AND SY2.SEQ = (SELECT MAX(SEQ)
                                    FROM SY_AFFIRM_EMAIL
                                   WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}))
                                   AND ROWNUM < 2. để lấy ra 3 giá trị APPLY_NO, APPLY_TYPE, APPLY_FLAG của đơn nghỉ phép vừa bị hủy, sau đó gọi tiếp package PKG_AFFIRM_EMAIL.PR_AFFIRM_CANCEL( #APPLY_NO#,
                         #APPLY_TYPE#,
                         #APPLY_FLAG#,
                         #adminID#,
                         #adminIP#,
						 #message,jdbcType=VARCHAR,mode=OUT#), để thực hiện hủy đơn nghỉ phép.

Thêm cho tôi điều kiện tìm kiếm  với trường Trạng thái đơn nghỉ phép - AFFIRM_FLAG của bảng ESS_LEAVE_APPLY_TB, có các giá trị sau:
14014309 - Chờ duyệt
14014308 - Đã duyệt
14014307 - Đang duyệt
14014306 - Gửi
14014310 - Đã hủy. 
Điều kiện tìm kiếm Trạng thái xác nhận - CONFIRM_FLAG của bảng ESS_LEAVE_APPLY_TB, có các giá trị sau: 0 - Chưa xác nhận
1 - Đã xác nhận
2 - Từ chối.
Điều kiện tìm kiếm Loại đơn nghỉ phép - LEAVE_TYPE_CODE của bảng ESS_LEAVE_APPLY_TB, dữ liệu lấy lấy thông qua data-parent-code="21"

Ở cột Thao tác này, nếu dòng dữ liệu có AFFIRM_FLAG = 14014308, thì hiển thị nút Lưu. Khi bấm váo tức là sẽ xóa đơn này khỏi bảng ESS_LEAVE_APPLY_TB, đồng thời cũng xóa luôn các dữ liệu liên quan đến đơn nghỉ phép này trong bảng SY_AFFIRM_EMAIL thông qua câu lệnh SQL: DELETE FROM SY_AFFIRM_EMAIL WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}. và trong bảng AR_APPLY_RESULT thông qua câu lệnh SQL: DELETE FROM AR_APPLY_RESULT WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}. Sau khi xóa xong thì sẽ Thêm mới lại một đơn mới theo những thông tin đã được chỉnh sửa của đơn nghỉ phép đó.

Khi load dữ liệu ra chỉ những đơn nào có AFFIRM_FLAG = 14014308 (Đã duyệt) thì mới hiển thị checkbox. Và nút Lưu chỉ thực hiện với những đơn có trạng thái Đã duyệt. sau khi người dùng sửa thông tin của những đơn đã duyệt và tick vào ô checkbox, Khi bấm nút Lưu thì cũng thực hiện việc xóa đơn cũ và thêm đơn mới, giống như trên, nhưng khác là cái này thực hiện với nhiều đơn.

ở phần thời lượng này, hãy áp dụng cách tính và hiển thị ra giống như lv_modalLeaveLength.

Căn cứ vào fiel viewEvsAffirmorSetup.html, hãy tạo cho tôi một file viewEvsResultEmp.html - Kết quả đánh giá nằm trong module /evs/manage. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT EVS_YEAR,
       MAX(EVS_MONTH12) EVS_performance,
       MAX(EVS_MONTH13) EVS_ability
  FROM (SELECT EVS_YEAR,
               DECODE(EVS_MONTH, '14015057', MAX(FINAL_GRADE)) EVS_performance,
               DECODE(EVS_MONTH, 'ability', MAX(FINAL_GRADE)) EVS_ability
          FROM (SELECT EVS.EVS_YEAR,
                       DECODE(EVS.EVS_TYPE,
                              'ability',
                              'ability',
                              DECODE(EVS.EVS_MONTH,
                                     '14015058',
                                     '14015050',
                                     '14015059',
                                     '14015057',
                                     EVS.EVS_MONTH)) EVS_MONTH,
                       CASE
                         WHEN EVS.FINAL_GRADE = 'A' THEN
                          'EX'
                         WHEN EVS.FINAL_GRADE = 'B' THEN
                          'VG'
                         WHEN EVS.FINAL_GRADE = 'C' THEN
                          'GD'
                         WHEN EVS.FINAL_GRADE = 'D' THEN
                          'NI'
                         WHEN EVS.FINAL_GRADE = 'E' THEN
                          'UN'
                         ELSE
                          EVS.FINAL_GRADE
                       END FINAL_GRADE
                  FROM EVS_OBJECT EVS
                 WHERE PERSON_ID = #{personId, jdbcType=VARCHAR}
                   AND PKG_EVS_PROCESS.GET_EVS_FEEDBACK(EVS.RESUME_SEQ, '14015077') = 1
                   AND ACTIVITY = '14015361')
         GROUP BY EVS_YEAR, EVS_MONTH)
 GROUP BY EVS_YEAR
 ORDER BY EVS_YEAR.

 Căn cứ vào file viewEvsAffirmorSetup.html, hãy tạo cho tôi một file viewApprovalEmail.html - Thoogn tin phê duyệt (Chưa duyệt) nằm trong module /ess/infoApply. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       AFFIRM_TYPE,
       APPLY_NO,
       APPLY_TYPE,
       APPLY_PERSON_ID,
       AFFIRM_PERSON_ID,
       TITLE,
       AFFIRM_LEVEL,
       AFFIRM_FLAG,
       AFFIRM_URL,
       APPLY_FLAG,
       APPLY_TYPE_CODE,
       APPLY_PERSON_INFO,
       GET_CODE_NAME(APPLY_AFFIRM_FLAG, 'vi') APPLY_AFFIRM_FLAG,
       TO_CHAR(UPDATE_DATE, 'YYYY.MM.DD HH24:MI:SS') UPDATE_DATE,
       ACTIVITY,
       READ_FLAG
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY = 0
   AND AFFIRM_PERSON_ID = #{adminID, jdbcType=VARCHAR}
   AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2)
 ORDER BY CREATE_DATE DESC. Khi tick vào các dòng dữ liệu và bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package PKG_AFFIRM_EMAIL.PR_AFFIRM_EXECUTE(
						 #APPLY_NO#,
                         #APPLY_TYPE#,
                         #APPLY_FLAG#,
                         #FLAG#,
                         #AFFIRM_CONTENT#,
                         #adminID#,
                         #adminIP#,
                         #AFFIRM_LEVEL#,
						 #message,jdbcType=VARCHAR,mode=OUT#), để thực hiện việc duyệt hoặc từ chối đơn. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewApprovalEmail.html để cập nhật lại danh sách những đơn cần phê duyệt.

vì modal này sẽ sử dụng nhiều lần ở nhiều file khác nhau nên tôi sẽ tạo một file riêng để chứa modal này, tên là viewApprovaledLeave.html. nằm trong module /ess/infoApply. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       AFFIRM_TYPE,
       APPLY_NO,
       APPLY_TYPE,
       APPLY_PERSON_ID,
       AFFIRM_PERSON_ID,
       TITLE,
       AFFIRM_LEVEL,
       AFFIRM_FLAG,
       AFFIRM_URL,
       APPLY_FLAG,
       APPLY_TYPE_CODE,
       APPLY_PERSON_INFO,
       GET_CODE_NAME(APPLY_AFFIRM_FLAG, 'vi') APPLY_AFFIRM_FLAG,
       TO_CHAR(UPDATE_DATE, 'YYYY.MM.DD HH24:MI:SS') UPDATE_DATE,
       ACTIVITY,
       READ_FLAG
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY = 0
   AND AFFIRM_PERSON_ID = #{adminID, jdbcType=VARCHAR}
   AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2)
 ORDER BY CREATE_DATE DESC. Khi tick vào các dòng dữ liệu và bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package PKG_AFFIRM_EMAIL.PR_AFFIRM_EXECUTE(
						 #APPLY_NO#,
                         #APPLY_TYPE#,
                         #APPLY_FLAG#,
                         #FLAG#,
                         #AFFIRM_CONTENT#,
                         #adminID#,
                         #adminIP#,
                         #AFFIRM_LEVEL#,
						 #message,jdbcType=VARCHAR,mode=OUT#), để thực hiện việc duyệt hoặc từ chối đơn. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewApprovalEmail.html để cập nhật lại danh sách những đơn cần phê duyệt.

vì modal này sẽ sử dụng nhiều lần ở nhiều file khác nhau nên tôi sẽ tạo một file riêng để chứa modal này, tên là viewApprovaledLeave.html. nằm trong module /ess/infoApply. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       AFFIRM_TYPE,
       APPLY_NO,
       APPLY_TYPE,
       APPLY_PERSON_ID,
       AFFIRM_PERSON_ID,
       TITLE,
       AFFIRM_LEVEL,
       AFFIRM_FLAG,
       AFFIRM_URL,
       APPLY_FLAG,
       APPLY_TYPE_CODE,
       APPLY_PERSON_INFO,
       GET_CODE_NAME(APPLY_AFFIRM_FLAG, 'vi') APPLY_AFFIRM_FLAG,
       TO_CHAR(UPDATE_DATE, 'YYYY.MM.DD HH24:MI:SS') UPDATE_DATE,
       ACTIVITY,
       READ_FLAG
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY = 0
   AND AFFIRM_PERSON_ID = #{adminID, jdbcType=VARCHAR}
   AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2)
 ORDER BY CREATE_DATE DESC. Khi tick vào các dòng dữ liệu và bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package PKG_AFFIRM_EMAIL.PR_AFFIRM_EXECUTE(
						 #APPLY_NO#,
                         #APPLY_TYPE#,
                         #APPLY_FLAG#,
                         #FLAG#,
                         #AFFIRM_CONTENT#,
                         #adminID#,
                         #adminIP#,
                         #AFFIRM_LEVEL#,
						 #message,jdbcType=VARCHAR,mode=OUT#), để thực hiện việc duyệt hoặc từ chối đơn. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewApprovalEmail.html để cập nhật lại danh sách những đơn cần phê duyệt.

vì modal này sẽ sử dụng nhiều lần ở nhiều file khác nhau nên hãy giúp tôi tạo một file riêng để chứa modal này, tên là viewApprovaledLeave.html. nằm trong module /ess/infoApply., khi bấm vào tên nhân viên sẽ hiển thị modal này như bình thường

vì modal - ck_applyDetailModal này sẽ sử dụng nhiều lần ở nhiều file khác nhau nên hãy giúp tôi tạo một file riêng để chứa modal này, tên là viewAttendanceEx.html. nằm trong module /ess/infoApply. Tham khảo cách làm của viewApprovaledLeave của viewApplyAttManagentByAnyApproverList.html khi bấm vào tên nhân viên sẽ hiển thị modal này như bình thường

vì modal - otf_applyDetailModal này sẽ sử dụng nhiều lần ở nhiều file khác nhau nên hãy giúp tôi tạo một file riêng để chứa modal này, tên là viewApprovaledOt.html. nằm trong module /ess/infoApply. Tham khảo cách làm của viewApprovaledLeave của viewApplyAttManagentByAnyApproverList.html khi bấm vào tên nhân viên sẽ hiển thị modal này như bình thường.

link này là những đưòng dẫn /ess/infoApply/viewApprovaledOt và /ess/infoApply/viewApprovaledLeave và /ess/infoApply/viewAttendanceEx sẽ được gọi trong các file khác nhau khi click vào tên nhân viên để hiển thị modal tương ứng.tôi muốn khi bấm vào thì sẽ mở các modal tương ứng viewApprovaledOt hoặc viewApprovaledLeave hoặc viewAttendanceEx chứ không phải là mở một trang mới, nên tôi sẽ tạo 3 file riêng để chứa 3 modal này, khi bấm vào tên nhân viên sẽ hiện ra modal tương ứng.

khi mở ra modal viewApprovaledLeave hoặc viewAttendanceEx hoặc viewApprovaledOt từ viewApprovalEmail.html. nếu AFFIRM_FLAG = 0 và AFFIRM_PERSON_ID = #{adminID}  thì ô Ý kiến sẽ hiển thị kiểu input để người dúng nhập Ý kiến, đồn thời hiện ra 2 nút Duyệt và Từ chối. nêu bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package
 PKG_AFFIRM_EMAIL.PR_AFFIRM_EXECUTE(
            #{applyNo,       jdbcType=VARCHAR, mode=IN},
            #{applyType,     jdbcType=VARCHAR, mode=IN},
            #{applyFlag,     jdbcType=VARCHAR, mode=IN},
            #{flag,          jdbcType=INTEGER, mode=IN},
            #{affirmContent, jdbcType=VARCHAR, mode=IN},
            #{adminID,       jdbcType=VARCHAR, mode=IN},
            #{adminIP,       jdbcType=VARCHAR, mode=IN},
            #{affirmLevel,   jdbcType=VARCHAR, mode=IN},
            #{message,       jdbcType=VARCHAR, mode=OUT}
        ). Lưu ý chỉ khi mở modal từ viewApprovalEmail.html thì mới có chức năng duyệt hoặc từ chối, còn khi mở modal này từ những file khác thì sẽ chỉ hiển thị thông tin mà không có chức năng duyệt hoặc từ chối. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewApprovalEmail.html để cập nhật lại danh sách những đơn cần phê duyệt.

ở đây hãy hiển thị số lượng đơn nghỉ phép, đơn tăng ca và đơn nghỉ bất thường của nhân viên mà người dùng chưa duyệt, dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT COUNT(1)
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY = 0
   AND AFFIRM_PERSON_ID = '35448370'
   AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2).
khi bấm vào thì hiện ra 3 dòng tương ứng với số lượng đơn nghỉ phép, đơn tăng ca và đơn nghỉ bất thường của nhân viên mà người dùng chưa duyệt
Dòng Nghỉ phép sẽ hiện ra số lượng đơn nghỉ phép dùng câu lệnh SQL: SELECT COUNT(1)
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY = 0
   AND AFFIRM_PERSON_ID = '35448370'
   AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
   AND APPLY_TYPE_CODE = '21'
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2).
Dòng Tăng ca sẽ hiện ra số lượng đơn tăng ca dùng câu lệnh SQL: SELECT COUNT(1)
  FROM SY_AFFIRM_EMAIL EM
  WHERE ACTIVITY = 0
    AND AFFIRM_PERSON_ID = '35448370'
    AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
    AND APPLY_TYPE_CODE = '31'
    AND NOT EXISTS (SELECT 1
            FROM ESS_LEAVE_APPLY_TB TB
          WHERE TB.APPLY_NO = EM.APPLY_NO
            AND TB.BATCH_YN = 2)
    AND NOT EXISTS (SELECT 1
            FROM ESS_APPLY_OT OT
          WHERE OT.APPLY_NO = EM.APPLY_NO
            AND OT.BATCH_YN = 2).
Dòng Nghỉ bất thường sẽ hiện ra số lượng đơn nghỉ bất thường dùng câu lệnh SQL: SELECT COUNT(1)
  FROM SY_AFFIRM_EMAIL EM
  WHERE ACTIVITY = 0
    AND AFFIRM_PERSON_ID = '35448370'
    AND APPLY_AFFIRM_FLAG NOT IN ('14014310', '14014309', '14014308')
    AND APPLY_TYPE_CODE = '218197'
    AND NOT EXISTS (SELECT 1
            FROM ESS_LEAVE_APPLY_TB TB
          WHERE TB.APPLY_NO = EM.APPLY_NO
            AND TB.BATCH_YN = 2)
    AND NOT EXISTS (SELECT 1
            FROM ESS_APPLY_OT OT
          WHERE OT.APPLY_NO = EM.APPLY_NO
            AND OT.BATCH_YN = 2).
Khi bấm vào từng dòng sẽ mở ra tab viewApprovalEmail.html để hiển thị danh sách những đơn tương ứng với điều kiện tìm kiếm loại đơn Nghỉ phép - APPLY_TYPE_CODE = '21', Tăng ca - APPLY_TYPE_CODE = '31', Nghỉ bất thường - APPLY_TYPE_CODE = '218197'.
Bám vào Xem tất cả thông báo sẽ mở ra tab viewApprovalEmail.html để hiển thị tất cả.

Thêm cho tôi điều kiện tìm kiếm: Loại đơn phê duyệt - APPLY_TYPE_CODE của bảng SY_AFFIRM_EMAIL, dữ liệu lấy lấy thông qua 
<option value="">Lựa chọn</option>
				<option value="31">Tăng ca</option>
				<option value="21">Nghỉ phép</option>
				<option value="218197">Nghỉ bất thường</option>.

dựa vào viewApplyAttManagentByAnyApproverList.html hãy tạo cho tôi một file viewLeaveConfirmList.html - Xác nhận nghỉ phép nằm trong module /ess/arConfirm. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT EL.APPLY_NO,
       TO_CHAR(EL.APPLY_TIME, 'DD-MM-YYYY') APPLY_TIME,
       EL.PERSON_ID,
       AR_GET_DAY_HOURS(EL.PERSON_ID,
                        TO_CHAR(EL.LEAVE_FROM_TIME, 'YYYY/MM/DD')) DAY_HOURS,
       TO_CHAR(EL.LEAVE_FROM_TIME, 'DD-MM-YYYY HH24:MI') LEAVE_FROM_TIME,
       TO_CHAR(EL.LEAVE_TO_TIME, 'DD-MM-YYYY HH24:MI') LEAVE_TO_TIME,
       trunc(EL.LEAVE_TO_TIME - SYSDATE) OVER_DAY,
       trunc(((EL.LEAVE_TO_TIME - SYSDATE) - trunc(LEAVE_TO_TIME - SYSDATE)) * 24) OVER_HOUR,
       EL.LEAVE_REASON,
       EL.LEAVE_TYPE_CODE,
       get_global_name(EL.LEAVE_TYPE_CODE, #{lang, jdbcType=VARCHAR}) LEAVE_TYPE_CODE_NAME,
       EL.HR_COMMENT,
       EL.APPLY_LENGTH,
       EL.CONFIRM_FLAG,
       EL.ACTIVITY,
       EL.CREATED_BY,
       GET_UPDATED_INFO(EL.CREATED_BY) CREATED_NAME,
       HR.LOCAL_NAME,
       HR.DEPTNO,
       HR.EMPID,
       get_dept_name(HR.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPT_NAME,
       HR.POST_GRADE_NO,
       get_global_name(HR.POST_GRADE_NO, #{lang, jdbcType=VARCHAR}) POST_GRADE_NAME,
       HR.POST_FAMILY,
       get_global_name(HR.POST_FAMILY, #{lang, jdbcType=VARCHAR}) POST_FAMILY_NAME,
       GET_UPDATED_INFO(EL.CONFIRM_BY) CONFIRM_BY
  FROM ess_leave_apply_tb EL, HR_EMPLOYEE HR
 WHERE EL.PERSON_ID = HR.PERSON_ID
   AND EL.AFFIRM_FLAG = 14014308
   AND EL.PERSON_ID NOT LIKE '111111%'
   AND EL.ACTIVITY = '1'
   AND EL.CPNY_ID = #{interCpnyID, jdbcType=VARCHAR}
   AND EL.CONFIRM_FLAG = '0'
 ORDER BY EL.APPLY_TIME DESC. Khi tick vào các dòng dữ liệu và bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package PKG_AFFIRM_EMAIL.PR_LEAVE_CONFIRM(
						#APPLY_NO:VARCHAR#,	
						#FLAG:VARCHAR#,
						#HR_COMMENT:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#), để thực hiện việc duyệt hoặc từ chối đơn. Hoặc người dùng có thể nhập trự tiếp Ý kiến sau đó bấm vào Duyệt hoặc Từ chối ở cột Nhân sự xác nhận. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewLeaveConfirmList.html để cập nhật lại danh sách những đơn cần phê duyệt.

Thêm cho tôi điều kiện tìm kiếm Trạng thái xác nhận - CONFIRM_FLAG của bảng ess_leave_apply_tb, có các giá trị sau: 0 - Chưa xác nhận, 1 - Đã xác nhận, 2 - Từ chối.

Giống như viewLeaveConfirmList.html, hãy tạo cho tôi một file viewAttendanceExConfirm.html - Xác nhận nghỉ bất thường nằm trong module /ess/arConfirm. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT EC.SEQ,
       EC.APPLY_NO,
       EC.PERSON_ID,
       EC.APPLY_REASON,
       EC.AFFIRM_FLAG,
       TO_CHAR(EC.APPLY_TIME, 'DD-MM-YYYY') APPLY_TIME,
       get_global_name(EC.AFFIRM_FLAG, #{lang, jdbcType=VARCHAR}) AFFIRM_FLAG_NAME,
       get_global_name(get_ar_shiftno(EC.PERSON_ID, EC.AR_DATE_STR, #{cpnyId, jdbcType=VARCHAR}), #{lang, jdbcType=VARCHAR}) SHIFT_NAME,
       EC.ITEM_NO,
       get_global_name(EC.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NAME,
       TO_CHAR(TO_DATE(REPLACE(EC.AR_DATE_STR, '/', '-'), 'YYYY-MM-DD'),
               'DD-MM-YYYY') AR_DATE_STR,
       TO_CHAR(EC.IN_TIME, 'DD-MM-YYYY HH24:MI') IN_TIME,
       TO_CHAR(EC.OUT_TIME, 'DD-MM-YYYY HH24:MI') OUT_TIME,
       TO_CHAR(EC.FROM_TIME, 'DD-MM-YYYY HH24:MI') FROM_TIME,
       TO_CHAR(EC.TO_TIME, 'DD-MM-YYYY HH24:MI') TO_TIME,
       EC.CONFIRM_FLAG,
       EC.HR_COMMENT,
       HR.LOCAL_NAME,
       HR.EMPID,
       HR.DEPTNO,
       get_dept_name(HR.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPT_NAME,
       HR.POST_GRADE_NO,
       get_global_name(HR.POST_GRADE_NO, #{lang, jdbcType=VARCHAR}) POST_GRADE_NAME,
       HR.POST_FAMILY,
       get_global_name(HR.POST_FAMILY, #{lang, jdbcType=VARCHAR}) POST_FAMILY_NAME,
       EC.ACTIVITY,
       GET_UPDATED_INFO(EC.CONFIRM_BY) CONFIRM_BY,
       GET_AR_TIME_BY_CPNYID(EC.PERSON_ID, EC.AR_DATE_STR, 'IN', #{cpnyId, jdbcType=VARCHAR}) INDOOR_TIME,
       GET_AR_TIME_BY_CPNYID(EC.PERSON_ID, EC.AR_DATE_STR, 'OUT', #{cpnyId, jdbcType=VARCHAR}) OUTDOOR_TIME
  FROM ESS_CARD_APPLY_TB EC, HR_EMPLOYEE HR
 WHERE EC.PERSON_ID = HR.PERSON_ID
   AND EC.AFFIRM_FLAG = '14014308'
   AND EC.ACTIVITY = '1'
   AND HR.PERSON_ID NOT LIKE '111111%'
   AND EC.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND EC.CONFIRM_FLAG = '0'
 ORDER BY EC.AR_DATE_STR DESC. Khi tick vào các dòng dữ liệu và bấm Duyệt (FLAG = 1) hoặc Từ chối (FLAG = 2) thì sẽ gọi package PKG_AFFIRM_EMAIL.PR_ATTENDANCEEX_CONFIRM(
						#APPLY_NO:VARCHAR#,	
						#FLAG:VARCHAR#,
						#HR_COMMENT:VARCHAR#,
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#), để thực hiện việc duyệt hoặc từ chối đơn. Hoặc người dùng có thể nhập trự tiếp Ý kiến sau đó bấm vào Duyệt hoặc Từ chối ở cột Nhân sự xác nhận. Sau khi duyệt hoặc từ chối xong thì sẽ tự động load lại trang viewAttendanceExConfirm.html để cập nhật lại danh sách những đơn cần phê duyệt.


ở đây hãy hiển thị số lượng đơn nghỉ phép và đơn nghỉ bất thường của nhân viên mà cần xác nhận, dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT COUNT(1)
  FROM ess_leave_apply_tb EL
 WHERE EL.AFFIRM_FLAG = 14014308
   AND EL.PERSON_ID NOT LIKE '111111%'
   AND EL.ACTIVITY = '1'
   AND EL.CPNY_ID = #{interCpnyID, jdbcType=VARCHAR}
   AND EL.CONFIRM_FLAG = '0'.
   và SELECT COUNT(1) FROM ESS_CARD_APPLY_TB EC
 WHERE EC.AFFIRM_FLAG = '14014308'
   AND EC.ACTIVITY = '1'
   AND EC.PERSON_ID NOT LIKE '111111%'
   AND EC.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND EC.CONFIRM_FLAG = '0'.
khi bấm vào thì hiện ra 2 dòng tương ứng với số lượng đơn nghỉ phép, và đơn nghỉ bất thường của nhân viên mà chưa xác nhận
Dòng Nghỉ phép sẽ hiện ra số lượng đơn nghỉ phép dùng câu lệnh SQL: SELECT COUNT(1)
  WHERE EL.AFFIRM_FLAG = 14014308
   AND EL.PERSON_ID NOT LIKE '111111%'
   AND EL.ACTIVITY = '1'
   AND EL.CPNY_ID = #{interCpnyID, jdbcType=VARCHAR}
   AND EL.CONFIRM_FLAG = '0'. Khi bấm vào thì sẽ mở ra tab viewLeaveConfirmList.html để hiển thị danh sách những đơn nghỉ phép cần xác nhận.
Dòng Nghỉ bất thường sẽ hiện ra số lượng đơn nghỉ bất thường dùng câu lệnh SQL: SELECT COUNT(1)
  FROM ESS_CARD_APPLY_TB EC
 WHERE EC.AFFIRM_FLAG = '14014308'
   AND EC.ACTIVITY = '1'
   AND EC.PERSON_ID NOT LIKE '111111%'
   AND EC.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
   AND EC.CONFIRM_FLAG = '0'. Khi bấm vào thì sẽ mở ra tab viewAttendanceExConfirm.html để hiển thị danh sách những đơn nghỉ bất thường cần xác nhận.


Giống như viewApprovalEmail.html, hãy tạo cho tôi một file viewApprovaledEmail.html - Đơn đã duyệt nằm trong module /ess/infoApply. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       AFFIRM_TYPE,
       APPLY_NO,
       APPLY_TYPE,
       APPLY_PERSON_ID,
       AFFIRM_PERSON_ID,
       TITLE,
       AFFIRM_LEVEL,
       AFFIRM_FLAG,
       AFFIRM_URL,
       APPLY_FLAG,
       APPLY_TYPE_CODE,
       APPLY_PERSON_INFO,
       GET_CODE_NAME(APPLY_AFFIRM_FLAG, 'vi') APPLY_AFFIRM_FLAG,
       TO_CHAR(UPDATE_DATE, 'DD.MM.YYYY HH24:MI:SS') UPDATE_DATE,
       ACTIVITY,
       READ_FLAG
  FROM SY_AFFIRM_EMAIL EM
 WHERE ACTIVITY IN ('0', '1')
   AND AFFIRM_PERSON_ID = '35448370'
   AND AFFIRM_TYPE NOT IN (3, 4)
   AND APPLY_AFFIRM_FLAG IN ('14014308', '14014309', '14014310')
   AND NOT EXISTS (SELECT 1
          FROM ESS_LEAVE_APPLY_TB TB
         WHERE TB.APPLY_NO = EM.APPLY_NO
           AND TB.BATCH_YN = 2)
   AND NOT EXISTS
 (SELECT 1
          FROM ESS_APPLY_OT OT
         WHERE OT.APPLY_NO = EM.APPLY_NO
           AND OT.BATCH_YN = 2)
   AND CREATE_DATE >=
       TO_DATE(TO_CHAR(SYSDATE, 'YYYY.MM') || '.01', 'YYYY.MM.DD')
 ORDER BY CREATE_DATE DESC.

 Giống như viewApprovalEmail.html, hãy tạo cho tôi một file viewNoticeedEmail.html - Đơn đã duyệt nằm trong module /ess/infoApply. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT SEQ,
       AFFIRM_TYPE,
       APPLY_NO,
       APPLY_TYPE,
       APPLY_PERSON_ID,
       AFFIRM_PERSON_ID,
       TITLE,
       AFFIRM_LEVEL,
       AFFIRM_FLAG,
       AFFIRM_URL,
       APPLY_FLAG,
       APPLY_TYPE_CODE,
       APPLY_PERSON_INFO,
       GET_CODE_NAME(APPLY_AFFIRM_FLAG, 'vi') APPLY_AFFIRM_FLAG,
       TO_CHAR(UPDATE_DATE, 'DD.MM.YYYY HH24:MI:SS') UPDATE_DATE,
       ACTIVITY,
       READ_FLAG
  FROM SY_AFFIRM_EMAIL
 WHERE AFFIRM_PERSON_ID = #{adminID, jdbcType=VARCHAR}
   AND AFFIRM_TYPE IN (3, 4)
   AND CREATE_DATE >=
       ADD_MONTHS(TO_DATE(TO_CHAR(SYSDATE, 'YYYY.MM') || '.01',
                          'YYYY.MM.DD'),
                  -1)
 ORDER BY CREATE_DATE DESC


 Giống như viewApplyAttManagentByAnyApproverList.html, hãy tạo cho tôi một file viewApplyAttenanceBatchInfoList.html - Xin nghỉ phép nằm trong module /ess/infoApplyAttendance. vì giao diện viewApplyAttenanceBatchInfoList là dùng cho người quản lý, vậy nên hãy sao chép lại giống như viewApplyAttManagentByAnyApproverList.html, cả về giao diện và chức năng.

 
Khi chọn ra được nhân việc thì sẽ tự động điền luôn Phòng ban sau đó sử dụng person_id của nhân viên đó cùng với ngày hiện tại (dạng YYYY-MM-DD) để điền các thông tin của nhân viên đó vào các trường tương ứng như:
Thời gian bắt đầu sử dụng function get_ar_shift_start_time(#{personId, jdbcType=VARCHAR}, TO_CHAR(SYSDATE, 'YYYY-MM-DD'), #{interCpnyID, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{personId, jdbcType=VARCHAR}, TO_CHAR(SYSDATE, 'YYYY-MM-DD'), #{interCpnyID, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Phép năm còn lại sử dụng function GET_VAC_COUNT(#{personId, jdbcType=VARCHAR}, #{interCpnyID, jdbcType=VARCHAR}, TO_CHAR(Thời gian bắt đầu, 'YYYY-MM-DD'), TO_CHAR(Thời gian kết thúc, 'YYYY-MM-DD'))
Ca làm việc sử dụng function GET_GLOBAL_NAME(GET_AR_SHIFTNO(#{personId, jdbcType=VARCHAR},TO_CHAR(SYSDATE, 'YYYY-MM-DD'),#{interCpnyID, jdbcType=VARCHAR}),#{lang, jdbcType=VARCHAR})

Khi Lưu check thêm cho tôi 1 điều kiện, sử dụng câu lệnh SQL: SELECT AR_GET_LEAVE_CLASH('',#{personId, jdbcType=VARCHAR}, #{fromTime, jdbcType=VARCHAR}, #{toTime, jdbcType=VARCHAR}) FROM DUAL; 
Nếu kết quả trả về là > 0 thì báo lỗi: "Trùng với chấm công trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!"
Nếu kết quả trả về = -1 thì báo lỗi: "Ngày công đã chốt, xin kiểm tra lại!"
Nếu kết quả trả về = -2 thì báo lỗi: "Thời gian đã khóa, xin kiểm tra lại!"

Thêm ô checkbox để chọn có hủy đơn hay không, Sau khi tick chọn và bấm vào nút Hủy đơn ở bên cạnh nút Lưu thì sẽ cập nhật lại trường ACTIVITY của bảng ESS_APPLY_OT thành 1, đồng thời cập nhật lại trường AFFIRM_FLAG thành 14014310. Sau đó gọi thêm package PKG_AFFIRM_EMAIL.PR_DELETE_OT_CONFIRM(
            #{applyNo, jdbcType=VARCHAR, mode=IN},
            #{message, jdbcType=VARCHAR, mode=OUT}
        ). tiếp theo sử dụng câu lệnh SQL: SELECT SY.APPLY_NO, SY.APPLY_TYPE, SY.APPLY_FLAG
          FROM SY_AFFIRM_EMAIL SY
         WHERE EXISTS (SELECT 1
                  FROM SY_AFFIRM_EMAIL SY2
                 WHERE SY.APPLY_NO = SY2.APPLY_NO
                   AND SY.APPLY_TYPE = SY2.APPLY_TYPE
                   AND SY.APPLY_FLAG = SY2.APPLY_FLAG
                   AND SY2.SEQ = (SELECT MAX(SEQ)
                                    FROM SY_AFFIRM_EMAIL
                                   WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}))
                                   AND ROWNUM < 2. để lấy ra 3 giá trị APPLY_NO, APPLY_TYPE, APPLY_FLAG của đơn tăng ca vừa bị hủy, sau đó gọi tiếp package PKG_AFFIRM_EMAIL.PR_AFFIRM_CANCEL( #APPLY_NO#,
                         #APPLY_TYPE#,
                         #APPLY_FLAG#,
                         #adminID#,
                         #adminIP#,
						 #message,jdbcType=VARCHAR,mode=OUT#), để thực hiện hủy đơn tăng ca.

Thêm cho tôi điều kiện tìm kiếm  với trường Trạng thái đơn tăng ca - AFFIRM_FLAG của bảng ESS_LEAVE_APPLY_TB, có các giá trị sau:
14014309 - Chờ duyệt
14014308 - Đã duyệt
14014307 - Đang duyệt
14014306 - Gửi
14014310 - Đã hủy. 
Điều kiện tìm kiếm Trạng thái xác nhận - CONFIRM_FLAG của bảng ESS_LEAVE_APPLY_TB, có các giá trị sau: 0 - Chưa xác nhận
1 - Đã xác nhận
2 - Từ chối.


Ở cột Thao tác này, nếu dòng dữ liệu có AFFIRM_FLAG = 14014308, thì hiển thị nút Lưu. Khi bấm váo tức là sẽ xóa đơn này khỏi bảng ESS_APPLY_OT, đồng thời cũng xóa luôn các dữ liệu liên quan đến đơn tăng ca này trong bảng SY_AFFIRM_EMAIL thông qua câu lệnh SQL: DELETE FROM SY_AFFIRM_EMAIL WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}. và trong bảng AR_APPLY_RESULT thông qua câu lệnh SQL: DELETE FROM AR_APPLY_RESULT WHERE APPLY_NO = #{applyNo, jdbcType=VARCHAR}. Sau khi xóa xong thì sẽ Thêm mới lại một đơn mới theo những thông tin đã được chỉnh sửa của đơn tăng ca đó.

Khi load dữ liệu ra chỉ những đơn nào có AFFIRM_FLAG = 14014308 (Đã duyệt) thì mới hiển thị checkbox. Và nút Lưu chỉ thực hiện với những đơn có trạng thái Đã duyệt. sau khi người dùng sửa thông tin của những đơn đã duyệt và tick vào ô checkbox, Khi bấm nút Lưu thì cũng thực hiện việc xóa đơn cũ và thêm đơn mới, giống như trên, nhưng khác là cái này thực hiện với nhiều đơn.

ở phần thời lượng này, hãy áp dụng cách tính và hiển thị ra giống như lv_modalLeaveLength.

Khi chọn ra được nhân viên thì sẽ tự động điền luôn Phòng ban sau đó sử dụng person_id của nhân viên đó cùng với ngày tăng ca - applyOtDate (dạng YYYY-MM-DD) để điền các thông tin của nhân viên đó vào các trường tương ứng như:
Loại tăng ca sử dụng function GET_GLOBAL_NAME(GET_OT_TYPE_CODE(#{personId, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0), #{lang, jdbcType=VARCHAR})

Nếu GET_OT_TYPE_CODE(#{personId, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0) = '32'
thì Thời gian bắt đầu sử dụng function get_ar_shift_end_time(#{personId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{personId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) + 2h (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)

Nếu GET_OT_TYPE_CODE(#{personId, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0) != '32'
thì Thời gian bắt đầu sử dụng function get_ar_shift_start_time(#{personId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{personId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)

Thời lượng sử dụng function GET_OT_LENGTH_SPC(#personId#,#cpnyId#,#applyOtDate#,GET_OT_TYPE_CODE(#{personId, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0),TO_CHAR(Thời gian bắt đầu, 'HH24:MI'), TO_CHAR(Thời gian kết thúc, 'HH24:MI'),#DEDUCT_YN#).

Khi Lưu check thêm cho tôi 1 điều kiện, sử dụng câu lệnh SQL: SELECT AR_GET_LEAVE_CLASH('',#{personId, jdbcType=VARCHAR}, #{fromTime, jdbcType=VARCHAR}, #{toTime, jdbcType=VARCHAR}) FROM DUAL; 
Nếu kết quả trả về là > 0 thì báo lỗi: "Trùng với chấm công trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!"
Nếu kết quả trả về = -1 thì báo lỗi: "Ngày công đã chốt, xin kiểm tra lại!"
Nếu kết quả trả về = -2 thì báo lỗi: "Thời gian đã khóa, xin kiểm tra lại!"

Khi Lưu thông tin tăng ca hãy kiểm tra việc có trùng hoặc chồng chéo với đơn tăng ca nào khác của nhân viên đó hay không, Kiểm tra Thời gian bắt đầu và Thời gian kết thúc của đơn đã tồn tại trước đó trong bảng ESS_APPLY_OT với điều kiện AFFIRM_FLAG NOT IN ('14014309','14014310') và CONFIRM_FLAG <> '2' và ACTIVITY = '1' thì báo lỗi: "Trùng với đơn tăng ca khác của nhân viên này vào cùng ngày, xin kiểm tra lại!"

Khi Lưu check thêm cho tôi 1 điều kiện, sử dụng câu lệnh SQL: SELECT AR_GET_OT_CLASH('',#{personId, jdbcType=VARCHAR}, #{otFromTime, jdbcType=VARCHAR}, #{otToTime, jdbcType=VARCHAR}, '') FROM DUAL; 
Nếu kết quả trả về là > 0 thì báo lỗi: "Trùng với tăng ca trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!"
Nếu kết quả trả về = -1 thì báo lỗi: "Ngày công đã chốt, xin kiểm tra lại!"
Nếu kết quả trả về = -2 thì báo lỗi: "Thời gian đã khóa, xin kiểm tra lại!"
Nếu kết quả trả về = -3 thì báo lỗi: "Bạn đã tăng ca quá thời gian quy định trong tháng, xin liên hệ phòng nhân sự!"
Nếu kết quả trả về = -4 thì báo lỗi: "Đang trong thời gian mang thai hoặc nuôi con nhỏ. Không thể tăng ca!"

Khi Lưu cùng lúc nhiều dòng cũng cần phải check trùng hoặc chồng chéo giờ Bắt đầu và kết thúc với những dòng khác trong cùng một lần lưu, Nếu có trùng thì báo lỗi: "Các dòng dữ liệu bị trùng nhau về thời gian, xin kiểm tra lại!"

Thêm 2 cột Tổng tăng ca tháng này và Tổng tăng ca năm này, dữ liệu lấy ra dựa vào function GET_AR_OT_TOTAIL(replace(#{applyOtDate, jdbcType=VARCHAR},'-','/'), #{cpnyId, jdbcType=VARCHAR},#{personId, jdbcType=VARCHAR},'30') cho Tổng tăng ca tháng này và GET_AR_OT_TOTAIL(replace(#{applyOtDate, jdbcType=VARCHAR},'-','/'), #{cpnyId, jdbcType=VARCHAR},#{personId, jdbcType=VARCHAR},'200') cho Tổng tăng ca năm này. 2 cột này thêm sau cột Lý do và trước cột Trạng thái. khi chọn nhân viên hoặc ngày tăng ca thì sẽ tự động lấy dữ liệu và hiển thị ra 2 cột này để người dùng nắm được tổng số giờ tăng ca của nhân viên đó trong tháng và trong năm, từ đó có thể cân nhắc việc duyệt đơn tăng ca hay không.

Khi Lưu check thêm cho tôi 1 điều kiện. nếu số giờ tăng ca của đơn này cộng với tổng số giờ tăng ca của nhân viên đó trong tháng vượt quá 40h thì sẽ báo lỗi: "Tổng số giờ tăng ca trong tháng vượt quá 40h, xin kiểm tra lại!". nếu người dùng xin nhiều đơn tăng ca thì sẽ lấy tổng số giờ tăng ca của tất cả các đơn tăng ca đó cộng với tổng số giờ tăng ca của nhân viên đó trong tháng để kiểm tra có vượt quá 40h hay không. Tương tụ nếu số giờ tăng ca của đơn này cộng với tổng số giờ tăng ca của nhân viên đó trong năm vượt quá 300h thì sẽ báo lỗi: "Tổng số giờ tăng ca trong năm vượt quá 300h, xin kiểm tra lại!". nếu người dùng xin nhiều đơn tăng ca thì sẽ lấy tổng số giờ tăng ca của tất cả các đơn tăng ca đó cộng với tổng số giờ tăng ca của nhân viên đó trong năm để kiểm tra có vượt quá 300h hay không.

Khi mở tab viewSSTOtApplyInfo.html sẽ tự động điền luôn Ngày tăng ca - applyOtDate (dạng YYYY-MM-DD) sau đó điền vào các trường tương ứng như:
Hình thức tăng ca sử dụng function GET_GLOBAL_NAME(GET_OT_TYPE_CODE(#{adminID, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0), #{lang, jdbcType=VARCHAR})

Nếu GET_OT_TYPE_CODE(#{adminID, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0) = '32'
thì Thời gian bắt đầu sử dụng function get_ar_shift_end_time(#{adminID, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{adminID, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) + 2h (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)

Nếu GET_OT_TYPE_CODE(#{adminID, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0) != '32'
thì Thời gian bắt đầu sử dụng function get_ar_shift_start_time(#{adminID, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
Thời gian kết thúc sử dụng function get_ar_shift_end_time(#{adminID, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) (function này khi get dữ liệu ra sẽ có định dạng là YYYY-MM-DD HH24:MI)
CHỗ checkbox Báo cơm / Nghỉ ngời (30') chính là DEDUCT_YN, nếu checkbox này được tick thì sẽ truyền giá trị 1 vào function GET_OT_LENGTH_SPC, nếu không được tick thì sẽ truyền giá trị 0 vào function GET_OT_LENGTH_SPC.
Thời lượng sử dụng function GET_OT_LENGTH_SPC(#adminID#,#cpnyId#,#applyOtDate#,GET_OT_TYPE_CODE(#{adminID, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}, #{applyOtDate, jdbcType=VARCHAR}, 0, 0),TO_CHAR(Thời gian bắt đầu, 'HH24:MI'), TO_CHAR(Thời gian kết thúc, 'HH24:MI'),#DEDUCT_YN#).

Chỉ khi nào Trạng thái đơn nghỉ phép - AFFIRM_FLAG, có các giá trị sau:
14014308 - Đã duyệt
14014307 - Đang duyệt
14014306 - Gửi
14014310 - Đã hủy. 
Điều kiện tìm kiếm Trạng thái xác nhận - CONFIRM_FLAG, có các giá trị sau: 0 - Chưa xác nhận
1 - Đã xác nhận
2 - Từ chối.

Ngoài ra, khi bấm Hủy bỏ, check 2 điều kiện SQL như sau:SELECT COUNT(1) FROM AR_DETAIL_HAE D
        JOIN ESS_LEAVE_APPLY_TB ESS ON ESS.PERSON_ID = D.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.APPLY_TIME, 'YYYY/MM/DD') = D.AR_DATE_STR
        AND D.LOCK_YN = 'Y';
SELECT COUNT(1) FROM AR_DEPARTMENT_MANAGE AD
        JOIN HR_EMPLOYEE HE ON HE.DEPTNO = AD.DEPTNO 
        JOIN ESS_LEAVE_APPLY_TB ESS ON ESS.PERSON_ID = HE.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.APPLY_TIME, 'YYYY-MM-DD') = AD.LOCK_DATE
        AND (AD.LOCK_ATTEN_FLAG = '1' OR AD.LOCK_ATTEN_ANNUAL_FLAG  = '1' OR AD.LOCK_ATTEN_ANNUAL_NIGHT_FLAG  = '1' OR AD.LOCK_ATTEN_NIGHT_FLAG = '1'); nếu 1 trong 2 điều kiện trả về > 0 thì sẽ báo lỗi: "Đơn nghỉ phép này đã bị khóa, không thể hủy bỏ!".


Ngoài ra, khi bấm Hủy bỏ, check 2 điều kiện SQL như sau:SELECT COUNT(1) FROM AR_DETAIL_HAE D
        JOIN ess_apply_ot ESS ON ESS.PERSON_ID = D.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.OT_FROM_TIME, 'YYYY/MM/DD') = D.AR_DATE_STR
        AND D.LOCK_YN = 'Y';
SELECT COUNT(1) FROM AR_DEPARTMENT_MANAGE AD
        JOIN HR_EMPLOYEE HE ON HE.DEPTNO = AD.DEPTNO 
        JOIN ess_apply_ot ESS ON ESS.PERSON_ID = HE.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.OT_FROM_TIME, 'YYYY-MM-DD') = AD.LOCK_DATE
        AND (AD.LOCK_OT_FLAG = '1' OR AD.LOCK_OT_NIGHT_FLAG  = '1'); nếu 1 trong 2 điều kiện trả về > 0 thì sẽ báo lỗi: "Đơn nghỉ phép này đã bị khóa, không thể hủy bỏ!".


        checkbox ali_rowCheck chỉ hiển thị khi đơn xin phép có Trạng thái đơn nghỉ phép - AFFIRM_FLAG, có 1 trong các giá trị sau:
14014308 - Đã duyệt
14014307 - Đang duyệt
14014306 - Gửi. còn lại thì không hiện checkbox đối với dòng dữ liệu đó

khi bấm Hủy bỏ, check 2 điều kiện SQL như sau:
SELECT COUNT(1) FROM AR_DETAIL_HAE D
        JOIN ESS_CARD_APPLY_TB ESS ON ESS.PERSON_ID = D.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.APPLY_TIME, 'YYYY/MM/DD') = D.AR_DATE_STR
        AND D.LOCK_YN = 'Y';
        
SELECT * FROM AR_DEPARTMENT_MANAGE AD
        JOIN HR_EMPLOYEE HE ON HE.DEPTNO = AD.DEPT_NO 
        JOIN ESS_CARD_APPLY_TB ESS ON ESS.PERSON_ID = HE.PERSON_ID
        WHERE ESS.APPLY_NO = #{applyNo, jdbcType=VARCHAR}
        AND TO_CHAR(ESS.APPLY_TIME, 'YYYY-MM-DD') = AD.LOCK_DATE
        AND (AD.LOCK_ATTEN_EX_FLAG = '1' OR AD.LOCK_ATTEN_EX_NIGHT_FLAG = '1'); nếu 1 trong 2 điều kiện trả về > 0 thì sẽ báo lỗi: "Đơn nghỉ phép này đã bị khóa, không thể hủy bỏ!".

Khi Lưu check thêm cho tôi 1 điều kiện, sử dụng câu lệnh SQL: SELECT AR_GET_ATT_EX_CLASH(#{personId, jdbcType=VARCHAR}, #{arDateStr, jdbcType=VARCHAR}, #{cpnyId, jdbcType=VARCHAR}) FROM DUAL; 
Nếu kết quả trả về = 1 thì báo lỗi: "Ngày công đã chốt, xin kiểm tra lại!"
Nếu kết quả trả về = -2 thì báo lỗi: "Thời gian đã khóa, xin kiểm tra lại!"

 Giống như viewApplyAttManagentByAnyApproverList.html, hãy tạo cho tôi một file viewApplyAttenanceBatchInfoList.html - Xin nghỉ phép nằm trong module /ess/infoApplyAttendance. vì giao diện viewApplyAttenanceBatchInfoList là dùng cho người quản lý, vậy nên hãy sao chép lại giống như viewApplyAttManagentByAnyApproverList.html, cả về giao diện và chức năng.


  Giống như viewApplyOtManagentByAnyApproverList.html, hãy tạo cho tôi một file viewPiciOtAffirmLBatchList.html - Xin nghỉ phép nằm trong module /ess/infoApply. vì giao diện viewPiciOtAffirmLBatchList là dùng cho người quản lý, vậy nên hãy sao chép lại giống như viewApplyOtManagentByAnyApproverList.html, cả về giao diện và chức năng.

    Giống như viewCheckAttencetanceExForBatchList.html, hãy tạo cho tôi một file viewCheckAttencetanceExForBatchList.html - Xin nghỉ phép nằm trong module /ess/infoApplyAttendance. vì giao diện viewCheckAttencetanceExForBatchList là dùng cho người quản lý, vậy nên hãy sao chép lại giống như viewCheckAttencetanceExForBatchList.html, cả về giao diện và chức năng.

Dựa vào viewAttendanceExForBatchInfoList.html hãy tạo cho tôi một file viewCoordApplyAttendanceInfoList.html - Tra cứu chấm công nằm trong module /ess/infoApplyAttendance. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT HE.EMPID,
       HE.LOCAL_NAME,
       ESS.ITEM_NO ITEM_NO_NO,
       GET_DEPT_NAME(HE.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPT_NAME,
       GET_GLOBAL_NAME(ESS.SHIFT_NO, #{lang, jdbcType=VARCHAR}) SHIFT_NAME,
       HE.POST_GRADE_NO,
       GET_GLOBAL_NAME(HE.POST_GRADE_NO, #{lang, jdbcType=VARCHAR}) POST_GRADE_NAME,
       GET_GLOBAL_NAME(ESS.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NAME,
       ESS.AR_DATE_STR,
       TO_CHAR(ESS.FROM_TIME, 'YYYY/MM/DD HH24:MI') FROM_DATE,
       TO_CHAR(ESS.TO_TIME, 'YYYY/MM/DD HH24:MI') TO_TIME,,
       ESS.QUANTITY,
       ESS.UNIT,
       ESS.REMARK,
       HE.EMPID,
       GET_GLOBAL_NAME(ESS.STATUS_CODE, #{lang, jdbcType=VARCHAR}) STATUS_CODE,
       GET_GLOBAL_NAME(ESS.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NO,
       ESS.REMARK,
       ESS.LOCK_YN
  FROM AR_DETAIL_HAE ESS, HR_EMPLOYEE HE
 WHERE ESS.PERSON_ID = HE.PERSON_ID
   AND ESS.PERSON_ID NOT LIKE '111111%'
   AND ESS.ITEM_NO NOT IN ('90000295',
                           '90000296',
                           '90000297',
                           '90000298',
                           '90000299',
                           '90000300',
                           '90000301')
   AND ESS.AR_DATE_STR >= TO_DATE(#{startDate, jdbcType=VARCHAR}, 'YYYY/MM/DD')
   AND ESS.AR_DATE_STR <= TO_DATE(#{endDate, jdbcType=VARCHAR}, 'YYYY/MM/DD')
   AND EXISTS (SELECT B1.DEPTID
          FROM HR_DEPARTMENT B1
         WHERE B1.DEPTNO = HE.DEPTNO
         START WITH B1.DEPTNO in
                    (SELECT HRD.DEPTID
                       FROM HR_DEPARTMENT HRD
                      WHERE HRD.MANAGER_EMP_ID = #{adminID, jdbcType=VARCHAR})
        CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO
        UNION
        SELECT AR_SUPERVISOR_INFO.DEPTNO
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HE.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID, jdbcType=VARCHAR})
 ORDER BY ESS.AR_DATE_STR ASC, ESS.CREATE_DATE DESC, HE.DEPTNO, HE.EMPID;
 ĐỊnh dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày bắt đầu là ngày trước 1 ngày hiện tại
.


Dựa vào viewCoordApplyAttendanceInfoList.html hãy tạo cho tôi một file viewCoordApplyOtInfoList.html - Tra cứu tăng ca nằm trong module /ess/infoApply. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào câu lệnh SQL: SELECT HE.EMPID,
       HE.LOCAL_NAME,
       ESS.ITEM_NO ITEM_NO_NO,
       GET_DEPT_NAME(HE.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPT_NAME,
       GET_GLOBAL_NAME(ESS.SHIFT_NO, #{lang, jdbcType=VARCHAR}) SHIFT_NAME,
       HE.POST_GRADE_NO,
       GET_GLOBAL_NAME(HE.POST_GRADE_NO, #{lang, jdbcType=VARCHAR}) POST_GRADE_NAME,
       GET_GLOBAL_NAME(ESS.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NAME,
       ESS.AR_DATE_STR,
       TO_CHAR(ESS.FROM_TIME, 'YYYY/MM/DD HH24:MI') FROM_DATE,
       TO_CHAR(ESS.TO_TIME, 'YYYY/MM/DD HH24:MI') TO_TIME,,
       ESS.QUANTITY,
       ESS.UNIT,
       ESS.REMARK,
       HE.EMPID,
       GET_GLOBAL_NAME(ESS.STATUS_CODE, #{lang, jdbcType=VARCHAR}) STATUS_CODE,
       GET_GLOBAL_NAME(ESS.ITEM_NO, #{lang, jdbcType=VARCHAR}) ITEM_NO,
       GET_AR_TIME_BY_CPNYID(ESS.PERSON_ID, ESS.AR_DATE_STR, 'IN', #{cpnyId, jdbcType=VARCHAR}) INDOOR_TIME,
       GET_AR_TIME_BY_CPNYID(ESS.PERSON_ID, ESS.AR_DATE_STR, 'OUT', #{cpnyId, jdbcType=VARCHAR}) OUTDOOR_TIME
  FROM AR_DETAIL_HAE ESS, HR_EMPLOYEE HE
 WHERE ESS.PERSON_ID = HE.PERSON_ID
   AND ESS.PERSON_ID NOT LIKE '111111%'
   AND ESS.ITEM_NO NOT IN ('90000295',
                       '90000296',
                       '90000297',
                       '90000298',
                       '90000299',
                       '90000300',
                       '90000301')
   AND ESS.AR_DATE_STR >= TO_DATE(#{startDate, jdbcType=VARCHAR}, 'YYYY/MM/DD')
   AND ESS.AR_DATE_STR <= TO_DATE(#{endDate, jdbcType=VARCHAR}, 'YYYY/MM/DD')
   AND EXISTS (SELECT B1.DEPTID
          FROM HR_DEPARTMENT B1
         WHERE B1.DEPTNO = HE.DEPTNO
         START WITH B1.DEPTNO in
                    (SELECT HRD.DEPTID
                       FROM HR_DEPARTMENT HRD
                      WHERE HRD.MANAGER_EMP_ID = #{adminID, jdbcType=VARCHAR})
        CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO
        UNION
        SELECT AR_SUPERVISOR_INFO.DEPTNO
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HE.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID, jdbcType=VARCHAR})
 ORDER BY ESS.AR_DATE_STR ASC, ESS.CREATE_DATE DESC, HE.DEPTNO, HE.EMPID;
 ĐỊnh dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày bắt đầu là ngày trước 1 ngày hiện tại.

 Dựa vào viewCoordApplyAttendanceInfoList.html, hãy tạo cho tôi một file viewArPersonalList.html - Tình hình chấm công nằm trong module /ess/viewDept. Giao diện tham khảo hình ảnh. Dữ liệu lấy ra dựa vào bảng ar_emp_day_total với các trường tham khảo hình ảnh. định dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày 25 tháng trước đến ngày 24 tháng này. bảng ar_emp_day_total chứa thông tin chấm công của từng nhân viên trong từng ngày. các trường liên quan đến chấm công như EARLY_LEAVE, ABSENTEEISM, PERSONAL_LEAVE, ... thực chất được lấy từ ITEM_ID tương ứng trong bảng ar_item, thoogn qua câu lệnh SQL: SELECT ITEM_ID FROM ar_item WHERE ITEM_ID IS NOT NULL AND ACTIVITY = 1. sau đó hiển thị ra tên của ITEM_ID đó thông qua function GET_GLOBAL_NAME(ITEM_ID, #{lang, jdbcType=VARCHAR}). hãy viết cấu lệnh tính tổng các cột của bảng ar_emp_day_total (danh sách tên cột được lấy từ ITEM_ID của bảng ar_item) với từng PERSON_ID, lấy dữ liệu dựa vào Ngày bắt đầu và ngày kết thúc mà người dùng chọn, sau đó join với bảng hr_employee để lấy ra tên nhân viên và phòng ban, đồng thời join với bảng ar_item để lấy ra tên của các loại chấm công (lấy ra danh sách các cột của ar_emp_day_total), cuối cùng hiển thị ra giao diện dưới dạng cột tương ứng với từng loại chấm công. Ngoài ra, cũng cần phải tính tổng số giờ làm việc của từng nhân viên trong khoảng thời gian đó thông qua 

Giống như viewArPersonalList.html, hãy tạo cho tôi một file viewOtApplyPersonalList.html - Chi tiết tăng ca nằm trong module /ess/viewDept. giống như viewArPersonalList.html, chỉ khác prefix và itemGroup ở đây sẽ là '1433'


Dựa vào viewSearchApplyOtInfoList.html hãy tạo cho tôi file viewArCardRecord.html - Lịch sử ra vào nằm trong module /ar/attendanceMintenance. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng AR_MAC_RECORDS_HAE với các trường tham khảo hình ảnh, kết hợp với bảng HR_EMPLOYEE để lấy thông tin nhân viên. Định dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày hiện tại. ở cột Nguồn dữ liệu sẽ hiển thị từ trường INSERT_BY của bảng AR_MAC_RECORDS_HAE, với điều kiện nếu INSERT_BY = 'M' thì hiển thị là "Tự động", nếu INSERT_BY = 'A' thì hiển thị là "Xin phép", Cột Loại hiển thị dữ liệu từ trường DOOR_TYPE còn lại sẽ hiển thị là Thủ công. khi lấy dữ liệu thì gài thêm điều kiện cuối EXISTS (SELECT B1.DEPTID
          FROM HR_DEPARTMENT B1
         WHERE B1.DEPTNO = HE.DEPTNO
         START WITH B1.DEPTNO in
                    (SELECT HRD.DEPTID
                       FROM HR_DEPARTMENT HRD
                      WHERE HRD.MANAGER_EMP_ID = #{adminID, jdbcType=VARCHAR})
        CONNECT BY PRIOR B1.DEPTNO = B1.PARENT_DEPT_NO
        UNION
        SELECT AR_SUPERVISOR_INFO.DEPTNO
          FROM AR_SUPERVISOR_INFO
         WHERE AR_SUPERVISOR_INFO.DEPTNO = HE.DEPTNO
           AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID, jdbcType=VARCHAR})

Thêm cho tôi nút Đọc dữ liệu quẹt thẻ, khi bấm vào sẽ kết nối với máy chủ chứa dữ liệu quẹt thẻ để lấy dữ liệu ra và hiển thị lên giao diện, đồng thời lưu dữ liệu đó vào bảng AR_MAC_RECORDS_HAE. máy chủ có thông tin như sau: 
driver = "com.microsoft.jdbc.sqlserver.SQLServerDriver";
userName = "hrsystem";
passwrod = "5tkatjd!";
url = "jdbc:microsoft:sqlserver://10.44.7.241\\WISENETACS:1433;DatabaseName=WACS";
thông qua cấu lệnh sql: sql =   " select P.EmployeeNo, p.FirstName,cr.ReaderIDX as ReaderCode ,CR.ReaderName, "
							+ " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime, e.OccuredDateTime as UTCDateTime,"
							+ "p.MiddleName, p.LastName, CR.DeviceType, CR.DeviceName "
							+ " from ACS_CARDHOLDER_VIEW P join ACS_EVENT_ACCESS_VIEW E on P.PSNID = E.PSNId right "
							+ " JOIN (SELECT DV.LoopID,dv.DeviceID,DV.DeviceType, DV.DeviceName,rd.ReaderIDX, rd.ReaderID, RD.ReaderName "
							+ " FROM ACS_COMPANY_EXIT_READER_VIEW AR join ACS_DEVICE_DR_RD_VIEW RD "
							+ " ON ar.ReaderId = rd.ReaderIDX join ACS_DEVICE_VIEW DV on dv.DeviceIDX = rd.DeviceIDX) CR "
							+ " ON E.ControllerId = cr.LoopID and E.BoardNo = CR.DeviceID and E.IoIndex = CR.ReaderID "
							+ " where DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= '"+ acr_fromDate +"' "
							+ " and DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= '"+ acr_toDate +"' "; để lấy dữ liệu. với EmployeeNo là EMPID và CARD_NO, LocalDateTime là R_TIME, trong giá trị của ReaderName nếu có chứa "IN" thì ghi DOOR_TYPE là "IN", nếu có chứa "OUT" thì ghi DOOR_TYPE là "OUT", còn lại sẽ ghi DOOR_TYPE là "  ". sau khi lấy dữ liệu xong thì sẽ lưu vào bảng AR_MAC_RECORDS_HAE với INSERT_BY = 'M'. khi lưu vào bảng AR_MAC_RECORDS_HAE thì cần check trùng dữ liệu, nếu đã tồn tại dữ liệu có cùng EMPID, CARD_NO, R_TIME và DOOR_TYPE thì sẽ không lưu nữa để tránh bị trùng dữ liệu.

Thêm cho tôi chức năng upload file excel (có thể tham khảo chức năng upload attNewOpenImportModal của viewApplyAttManagentByAnyApproverList.html), khi người dùng upload file excel lên thì sẽ đọc dữ liệu từ file đó và lưu vào bảng AR_MAC_RECORDS_TEMP (cá trường tham khảo hình ảnh). file excel sẽ có định dạng như sau: cột A là EMPID, cột B là LOCAL_NAME, cột C là AR_DATE_STR, cột D là R_DATE, cột E là R_TIME, cột F là DOOR_TYPE, cột G là REMARK (tham khảo hình ảnh). sau khi lưu vào bảng AR_MAC_RECORDS_TEMP, thì tạo cho tạo luôn cho file viewImportExcelTempMacRecordsList.html ở module /ar/attendanceMintenance. giao diện này để hiển thị thông tin vừa nhập lên cho người dùng. sau khi bấm xác nhận thì sẽ đưa dữ liệu từ bảng AR_MAC_RECORDS_TEMP sang bảng AR_MAC_RECORDS_HAE. đồng thời xóa dữ liệu ở bảng AR_MAC_RECORDS_TEMP đi. khi lưu vào bảng AR_MAC_RECORDS_HAE thì cần check trùng dữ liệu, nếu đã tồn tại dữ liệu có cùng EMPID, CARD_NO, R_TIME và DOOR_TYPE thì sẽ không lưu nữa để tránh bị trùng dữ liệu. với những dòng dữ liệu được lưu thành công thì sẽ ghi INSERT_BY = 'A', 

Giống như viewArCardRecord.html, Hãy tạo cho tôi file viewArCardRecordForSelf.html - Lịch sử ra vào công ty nằm trong module /ar/attendanceMintenance. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng AR_MAC_RECORDS_SST với các trường tham khảo hình ảnh, kết hợp với bảng HR_EMPLOYEE để lấy thông tin nhân viên, trường CARD_NO tương ứng với EMPID HR_EMPLOYEE, sẽ có những dữ liệu trong bảng AR_MAC_RECORDS_SST mà giá trị của trường CARD_NO không nằm trong HR_EMPLOYEE, nếu vậy thì vẫn lấy CARD_NO và LOCAL_NAME sẽ thay bằng CARD_NO.  Định dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày hiện tại. có chức năng xuất excel, khi bấm vào sẽ xuất dữ liệu ra file excel.

Giống như viewArCardRecord.html, Hãy tạo cho tôi file viewArCardRecordMeal.html - Tra cứu suất ăn nằm trong module /ar/attendanceMintenance. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ bảng AR_MAC_RECORDS_MEAL_HAE với các trường tham khảo hình ảnh, câu lệnh lẫy dữ liệu sử dụng SQL: SELECT  A.SEQ,
			          A.EMPID,
			          A.EAT_DATE,
			          A.EAT_NAME,
					  A.EMPLOYEE_NAME,
					  NVL(B.LOCAL_NAME, A.EMPLOYEE_NAME) LOCAL_NAME,
					  TO_CHAR(A.R_TIME,'YYYY-MM-DD') R_DATE,
                      TO_CHAR(A.R_TIME,'HH24:MI:SS') R_TIME,
					  A.AMOUNT,
					  (CASE WHEN A.EAT_DATE IN ('BREAKFAST','NIGHT') THEN TO_CHAR(A.R_TIME - 1 , 'YYYY/MM/DD')
                             ELSE TO_CHAR(A.R_TIME,'YYYY-MM-DD') END ) AS ATTENDANCE_DATE,
					  GET_AR_TIME_BY_CPNYID(GET_PERSON_ID(A.EMPID), CASE WHEN A.EAT_DATE IN ('BREAKFAST','NIGHT') THEN TO_CHAR(A.R_TIME - 1 , 'YYYY/MM/DD')
                             ELSE 
                              TO_CHAR(A.R_TIME,'YYYY-MM-DD') END , 'OUT_DATE_TIME', #CPNY_ID:VARCHAR#) OUTDOOR_TIME,
					  CASE WHEN get_DEPT_NAME(B.DEPTNO,#{lang, jdbcType=VARCHAR}) = '' OR get_DEPT_NAME(B.DEPTNO,#{lang, jdbcType=VARCHAR}) IS NULL THEN A.DEPART_NAME
                            ELSE get_DEPT_NAME(B.DEPTNO,#{lang, jdbcType=VARCHAR}) END DEPTNAME,
					  A.REMARK,
					  GET_CODE_NAME(B.POST_GRADE_NO,#{lang, jdbcType=VARCHAR}) POST_GRADE_NAME,
					  INSERT_BY
				 FROM AR_MAC_RECORDS_MEAL_HAE A,
					  HR_EMPLOYEE B
				WHERE  A.EMPID =  B.EMPID(+). 
 trường EMPID của bảng AR_MAC_RECORDS_MEAL_HAE tương ứng với EMPID của HR_EMPLOYEE, sẽ có những dữ liệu trong bảng AR_MAC_RECORDS_MEAL_HAE mà giá trị của trường EMPID không nằm trong HR_EMPLOYEE, nếu vậy thì vẫn lấy EMPID và LOCAL_NAME sẽ thay bằng EMPLOYEE_NAME.       
         Định dạng ngày tháng dạng YYYY/MM/DD. mặc định ban đầu lấy ngày hiện tại. có chức năng xuất excel, khi bấm vào sẽ xuất dữ liệu ra file excel.

         với việc Đọc dữ liệu quẹt thẻ từ server nơi chưass dữ liệu quẹt thẻ. hãy thêm cho tôi 1 tính năng tự động chạy vào phút thứ 5 của mỗi tiếng, tức là 08:05, 09:05, ... và chỉ đọc dữ liệu trong ngày hiện tại và trươc đó 2 ngày để tránh việc đọc dữ liệu cũ quá nhiều. Việc này sẽ giúp cho dữ liệu quẹt thẻ được cập nhật liên tục mà không cần phải chờ người dùng bấm nút Đọc dữ liệu quẹt thẻ, đồng thời cũng tránh được việc dữ liệu bị trùng do người dùng bấm nút Đọc dữ liệu quẹt thẻ nhiều lần trong ngày.

Giống như chức năng đọc dữ liệu quẹt thẻ - acrOpenImportModal của viewArCardRecord.html, hãy tạo cho tôi chức năng đọc dữ liệu suất ăn - avrmOpenImportModal của viewArCardRecordMeal.html, khi bấm vào sẽ kết nối với máy chủ chứa dữ liệu suất ăn để lấy dữ liệu ra và hiển thị lên giao diện, đồng thời lưu dữ liệu đó vào bảng AR_MAC_RECORDS_MEAL_HAE. máy chủ có thông tin như máy chủ chứa dữ liệu quẹt thẻ, câu lệnh lấy dữ liệu là: sql =   " select P.EmployeeNo, p.FirstName,cr.ReaderIDX as ReaderCode ,CR.ReaderName, CR.DoorID, CR.DoorName,"
							+ " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime, e.OccuredDateTime as UTCDateTime,"
							+ " P.DepartmentID, P.DepartmentID AS DeptName	"
							+ " from ACS_CARDHOLDER_VIEW P join ACS_EVENT_ACCESS_VIEW E on P.PSNID = E.PSNId right "
							+ " JOIN (SELECT DV.LoopID, dv.DeviceID, rd.ReaderIDX, rd.ReaderID, RD.ReaderName, DR.DoorID, DR.DoorName "
							+ " FROM ACS_DEVICE_DR_VIEW DR join ACS_DEVICE_DR_RD_VIEW RD on DR.DoorID = RD.DoorID join ACS_DEVICE_VIEW DV on dv.DeviceIDX = rd.DeviceIDX "
							+ " WHERE RD.DeviceIDX IN ('1033','1034')) CR "
							+ " ON E.ControllerId = cr.LoopID and E.BoardNo = CR.DeviceID and E.IoIndex = CR.ReaderID "
							+ " where DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= '"+ acrm_fromDate +"' "
							+ " and DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= '"+ acrm_toDate +"' "
							+ " order by e.OccuredDateTime desc"; EmployeeNo Tương ứng với EMPID, 
FirstName Tương ứng với	EMPLOYEE_NAME
 LocalDateTime Tương ứng với	CARD_TIME
 DoorName Tương ứng với	DOOR_NAME
 DeptName Tương ứng với	DEPART_NAME 10
  CPNY_ID tương ứng với #{cpnyId, jdbcType=VARCHAR} khi lưu vào bảng AR_MAC_RECORDS_MEAL_HAE thì cần check trùng dữ liệu, nếu đã tồn tại dữ liệu có cùng EMPID, CARD_TIME và DOOR_NAME thì sẽ không lưu nữa để tránh bị trùng dữ liệu. có chức năng tự động chạy vào phút thứ 07:00 và 14:00 và chỉ đọc dữ liệu trong ngày hiện tại và trươc đó 2 ngày để tránh việc đọc dữ liệu cũ quá nhiều. Việc này sẽ giúp cho dữ liệu suất ăn được cập nhật liên tục mà không cần phải chờ người dùng bấm nút Đọc dữ liệu suất ăn, đồng thời cũng tránh được việc dữ liệu bị trùng do người dùng bấm nút Đọc dữ liệu suất ăn nhiều lần trong ngày.

  Giống như chức năng đọc dữ liệu quẹt thẻ - acrOpenImportModal của viewArCardRecord.html, hãy tạo cho tôi chức năng đọc dữ liệu suất ăn - avrmOpenImportModal của viewArCardRecordForSelf.html, khi bấm vào sẽ kết nối với máy chủ chứa dữ liệu suất ăn để lấy dữ liệu ra và hiển thị lên giao diện, đồng thời lưu dữ liệu đó vào bảng AR_MAC_RECORDS_MEAL_HAE. máy chủ có thông tin như máy chủ chứa dữ liệu quẹt thẻ, câu lệnh lấy dữ liệu là: sql =   " select P.EmployeeNo, p.FirstName,cr.ReaderIDX as ReaderCode ,CR.ReaderName, CR.DoorID, CR.DoorName,"
							+ " DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) AS LocalDateTime, e.OccuredDateTime as UTCDateTime,"
							+ " P.DepartmentID, P.DepartmentID AS DeptName	"
							+ " from ACS_CARDHOLDER_VIEW P join ACS_EVENT_ACCESS_VIEW E on P.PSNID = E.PSNId right "
							+ " JOIN (SELECT DV.LoopID, dv.DeviceID, rd.ReaderIDX, rd.ReaderID, RD.ReaderName, DR.DoorID, DR.DoorName "
							+ " FROM ACS_DEVICE_DR_VIEW DR join ACS_DEVICE_DR_RD_VIEW RD on DR.DoorID = RD.DoorID join ACS_DEVICE_VIEW DV on dv.DeviceIDX = rd.DeviceIDX "
							+ " WHERE RD.DeviceIDX IN ('1033','1034')) CR "
							+ " ON E.ControllerId = cr.LoopID and E.BoardNo = CR.DeviceID and E.IoIndex = CR.ReaderID "
							+ " where DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) >= '"+ acrm_fromDate +"' "
							+ " and DATEADD(mi, DATEDIFF(mi, GETUTCDATE(), GETDATE()), E.OccuredDateTime) <= '"+ acrm_toDate +"' "
							+ " order by e.OccuredDateTime desc"; EmployeeNo Tương ứng với EMPID, 
FirstName Tương ứng với	EMPLOYEE_NAME
 LocalDateTime Tương ứng với	CARD_TIME
 DoorName Tương ứng với	DOOR_NAME
 DeptName Tương ứng với	DEPART_NAME 10
  CPNY_ID tương ứng với #{cpnyId, jdbcType=VARCHAR} khi lưu vào bảng AR_MAC_RECORDS_MEAL_HAE thì cần check trùng dữ liệu, nếu đã tồn tại dữ liệu có cùng EMPID, CARD_TIME và DOOR_NAME thì sẽ không lưu nữa để tránh bị trùng dữ liệu. có chức năng tự động chạy vào phút thứ 07:00 và 14:00 và chỉ đọc dữ liệu trong ngày hiện tại và trươc đó 2 ngày để tránh việc đọc dữ liệu cũ quá nhiều. Việc này sẽ giúp cho dữ liệu suất ăn được cập nhật liên tục mà không cần phải chờ người dùng bấm nút Đọc dữ liệu suất ăn, đồng thời cũng tránh được việc dữ liệu bị trùng do người dùng bấm nút Đọc dữ liệu suất ăn nhiều lần trong ngày.


Căn cứ viewArCardRecord.html, Hãy tạo cho tôi file viewArCardRecordDay.html - Dữ liệu quet thẻ - Ca làm nằm trong module /ar/attendanceMintenance. Giao diện tham khảo hình ảnh. câu lệnh lẫy dữ liệu sử dụng SQL: SELECT D.LOCAL_NAME,
       D.EMPID EMPID,
       D.EMPID AS EMPLOYEE_ID,
       D.DEPTNAME,
       D.DEPT_TEAM,
       D.POST_GRADE_NO_NAME,
       GET_AR_EATDEDUCT_TIMES(D.AR_DATE_STR,
                              D.AR_DATE_STR,
                              D.PERSON_ID,
                              'EAT_TIME') EAT_TIMES,
       (SELECT (GET_GLOBAL_NAME(E.LEAVE_TYPE_CODE, #{lang, jdbcType=VARCHAR}) || ' (' ||
               TO_CHAR(E.LEAVE_FROM_TIME, 'DD/MM/YYYY HH24:MI') || ' - ' ||
               TO_CHAR(E.LEAVE_TO_TIME, 'DD/MM/YYYY HH24:MI') || ')')
          FROM ESS_LEAVE_APPLY_TB E
         WHERE E.CPNY_ID = D.CPNY_ID
           AND E.ACTIVITY = '1'
           AND E.BATCH_YN <> '2'
           AND E.CONFIRM_FLAG <> '2'
           AND E.AFFIRM_FLAG NOT IN ('14014310', '14014309')
           AND E.PERSON_ID = D.PERSON_ID
           AND D.DDATE_STR BETWEEN TO_CHAR(E.LEAVE_FROM_TIME, 'YYYY/MM/DD') AND
               TO_CHAR(E.LEAVE_TO_TIME - 8 / 24, 'YYYY/MM/DD')
           AND ROWNUM = 1) LEAVE_CONTENT,
       DECODE(D.EMP_TYPE_CODE, '10418', GET_GLOBAL_NAME(D.EMP_TYPE_CODE, #{lang, jdbcType=VARCHAR})) REMAX,
       GET_GLOBAL_NAME(GET_AR_SHIFTNO(D.PERSON_ID, D.AR_DATE_STR, D.CPNY_ID),
                       #{lang, jdbcType=VARCHAR}) SHIFT_NAME,
       GET_AR_SHIFTNO_WORKTIME(GET_AR_SHIFTNO(D.PERSON_ID,
                                              D.AR_DATE_STR,
                                              D.CPNY_ID)) SHIFT_TIME,
       (SELECT GET_EMP_LOCAL_NAME(ARS.CREATED_BY, #{cpnyId, jdbcType=VARCHAR}) || ' ' ||
               TO_CHAR(ARS.CREATE_DATE, 'DD/MM/YYYY HH24:MI')
          FROM AR_SCHEDULE_HAE ARS
         WHERE D.PERSON_ID = ARS.PERSON_ID
           AND D.AR_DATE_STR = ARS.AR_DATE_STR) CHANGE_SHIFT_PERSON,
       GET_GLOBAL_NAME(D.EMP_TYPE_CODE, #{lang, jdbcType=VARCHAR}) EMP_TYPE_NAME,
       D.EMP_TYPE_CODE,
       TO_CHAR(TO_DATE(D.AR_DATE_STR, 'YYYY/MM/DD'), 'DD/MM/YYYY') AR_DATE_STR,
       D.DDATE_STR,
       TO_CHAR(D.IN_TIME, 'DD/MM/YYYY') IN_DAY,
       TO_CHAR(D.IN_TIME, 'HH24:MI') IN_TIME,
       TO_CHAR(D.OUT_TIME, 'DD/MM/YYYY') OUT_DAY,
       TO_CHAR(D.OUT_TIME, 'HH24:MI') OUT_TIME
  FROM (SELECT HR.LOCAL_NAME,
               HR.EMPID,
               HR.PERSON_ID,
               HR.CPNY_ID,
               HR.EMP_TYPE_CODE,
               TO_CHAR(HR.DATE_LEFT, 'YYYY/MM/DD') DATE_LEFT,
               GET_DEPT_NAME(HR.DEPTNO, #{lang, jdbcType=VARCHAR}) DEPTNAME,
               GET_DEPT_NAME(GET_DEPT_NO_BY_LEVEL(HR.deptno, hr.cpny_id, '2'),
                             #{lang, jdbcType=VARCHAR}) DEPT_TEAM,
               GET_GLOBAL_NAME(HR.POST_GRADE_NO, #{lang, jdbcType=VARCHAR}) POST_GRADE_NO_NAME,
               AR.DDATE_STR AR_DATE_STR,
               AR.DDATE_STR DDATE_STR,
               (SELECT MIN(IN_TIME) IN_TIME
                  FROM (SELECT PERSON_ID,
                               AR_DATE_STR,
                               DECODE(DOOR_TYPE, 'IN', MIN(R_TIME)) IN_TIME,
                               CASE
                                 WHEN DOOR_TYPE IS NULL OR DOOR_TYPE <> 'IN' THEN
                                  MAX(R_TIME)
                               END OUT_TIME
                          FROM AR_MAC_RECORDS_HAE
                         WHERE 1 = 1
                           AND R_TIME >= TO_DATE(#{fromDate, jdbcType=VARCHAR}, 'DD/MM/YYYY')
                           AND R_TIME <= TO_DATE(#{toDate, jdbcType=VARCHAR}, 'DD/MM/YYYY') + 2
                         GROUP BY PERSON_ID, AR_DATE_STR, DOOR_TYPE) C
                 WHERE C.PERSON_ID = HR.PERSON_ID
                   AND C.AR_DATE_STR = AR.DDATE_STR
                 GROUP BY PERSON_ID, AR_DATE_STR) IN_TIME,
               (SELECT MAX(OUT_TIME) OUT_TIME
                  FROM (SELECT PERSON_ID,
                               AR_DATE_STR,
                               DECODE(DOOR_TYPE, 'IN', MIN(R_TIME)) IN_TIME,
                               CASE
                                 WHEN DOOR_TYPE IS NULL OR DOOR_TYPE <> 'IN' THEN
                                  MAX(R_TIME)
                               END OUT_TIME
                          FROM AR_MAC_RECORDS_HAE
                         WHERE 1 = 1
                           AND R_TIME >= TO_DATE(#{fromDate, jdbcType=VARCHAR}, 'DD/MM/YYYY')
                           AND R_TIME <= TO_DATE(#{toDate, jdbcType=VARCHAR}, 'DD/MM/YYYY') + 2
                         GROUP BY PERSON_ID, AR_DATE_STR, DOOR_TYPE) C
                 WHERE C.PERSON_ID = HR.PERSON_ID
                   AND C.AR_DATE_STR = AR.DDATE_STR
                 GROUP BY PERSON_ID, AR_DATE_STR) OUT_TIME
          FROM AR_CALENDER AR, HR_EMPLOYEE HR
         WHERE AR.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
           AND HR.CPNY_ID = #{cpnyId, jdbcType=VARCHAR}
           AND HR.EMPID NOT LIKE '111111%'
           AND HR.EMP_TYPE_CODE <> '10418'
           AND AR.DDATE_STR >=
               TO_CHAR(TO_DATE(#{fromDate, jdbcType=VARCHAR}, 'DD/MM/YYYY'), 'YYYY/MM/DD')
           AND AR.DDATE_STR <=
               TO_CHAR(TO_DATE(#{toDate, jdbcType=VARCHAR}, 'DD/MM/YYYY'), 'YYYY/MM/DD')
           AND EXISTS (SELECT AR_SUPERVISOR_INFO.DEPTNO
                  FROM AR_SUPERVISOR_INFO
                 WHERE AR_SUPERVISOR_INFO.DEPTNO = HR.DEPTNO
                   AND AR_SUPERVISOR_INFO.PERSON_ID = #{adminID, jdbcType=VARCHAR})) D
 WHERE (DATE_LEFT IS NULL OR DATE_LEFT >= DDATE_STR)
 ORDER BY DDATE_STR DESC, IN_TIME. Câu lệnh SQL này đáp ứng được việc lấy ra dữ liệu nhưng chưa được tối ưu về mặt hiệu suất, tôi muốn bạn tối ưu lại câu lệnh SQL này để nó chạy nhanh hơn.

Giống như viewArCardRecordDay.html hãy tạo cho tôi file viewEntryInfoList - Dữ liệu quẹt thẻ nằm trong module /ess/viewDept. chỉ thay đổi prefix và tên file, còn lại giữ nguyên về giao diện và câu lệnh SQL. với việc này sẽ giúp cho người quản lý có thể xem được dữ liệu quẹt thẻ của nhân viên trong phòng ban mình quản lý mà không cần phải vào module /ar/attendanceMintenance để xem, đồng thời cũng có thể xuất dữ liệu đó ra file excel nếu cần thiết.

ở viewArCardRecord.html Thêm cho tôi điều kiện, nếu sysMode === 'ess' (không phải hrm) thì không hiển thị nút Đọc dữ liệu quẹt thẻ Thêm bản ghi, Tải file mẫu, Import Excel, Sửa và Xóa. Chặn cả frontend và backend để tránh việc người dùng có thể truy cập vào các chức năng đó thông qua đường dẫn trực tiếp hoặc các công cụ hỗ trợ khác. chỉ những người dùng có quyền hạn nhất định mới có thể thấy và sử dụng các chức năng đó, còn lại sẽ bị ẩn đi hoàn toàn.

ở đây nếu /evs/manage/api/resume/evsResumeList không lấy ra được dữ liệu thì giao diện sẽ là màu trắng, với dòng thông báo ở giữa màn hình: "Không trong khoảng thời gian đánh giá hoặc bạn không phải là người đánh giá, xin liên hệ Phòng nhân sự!". tham khảo giao diện của viewConfirmTarget1.html để hiển thị thông báo này. Còn nếu có dữ liệu thì vẫn hiển thị giao diện như bình thường để người dùng có thể xem và thao tác với dữ liệu đó. Việc này sẽ giúp cho người dùng hiểu được lý do tại sao không có dữ liệu hiển thị trên giao diện thay vì chỉ nhìn thấy một màn hình trắng mà không biết nguyên nhân. Đồng thời cũng giúp giảm bớt sự nhầm lẫn và thắc mắc của người dùng khi không thấy dữ liệu nào hiển thị trên giao diện.

Tạo cho tôi file photoImport.html - Import ảnh đại diện nằm trong module /hrm/empinfo. chức năng của file này là cho phép người quản trị upload ảnh đại diện của nhân viên lên hệ thống, sau đó lưu ảnh đó vào thư mục chứa ảnh (/assets/images/users/), đồng thời lưu đường dẫn của ảnh đó vào bảng hr_personal_info trong trường PHOTO_PATH để phục vụ cho việc hiển thị ảnh đại diện của nhân viên trên các giao diện khác nhau trong hệ thống. Khi upload ảnh thì cần check định dạng của file ảnh, chỉ cho phép upload các định dạng ảnh phổ biến như .jpg, .jpeg, .png và kích thước của file ảnh không được vượt quá 2MB để đảm bảo chất lượng ảnh và tránh việc lưu trữ những file ảnh có kích thuớc quá lớn. Trong tên file ảnh phải chứa mã nhân viên (viết hoa hay thường đều được), lấy tên file ảnh để lấy ra PERSON_ID của EMPID của nhân viên đó. sau đó lư vào bảng hr_personal_info. có thể upload nhiều file cùng lúc. khi upload xong thì sẽ hiện lên giao diện những trường hợp thành công và thất bại. khi bấm xác nhận thì lưu những file ảnh upload thành công vào thư mục chứa ảnh và lưu đường dẫn của ảnh đó vào bảng hr_personal_info, còn những file ảnh upload thất bại thì sẽ hiển thị thông báo lỗi tương ứng để người quản trị có thể biết được nguyên nhân và khắc phục lỗi đó.

tham khảo cấu trúc của viewEvsParamPanel.html. tạo cho tôi file viewRecruitList.html - Quyết định nhận việc nằm trong module hrm/recruitManage. chức năng của file này để người quản lý nhập liệu về quyết định nhận việc của nhân viên mới vào hệ thống. giao diện sẽ để bên trái là danh sách các nhân viên mới được nhận việc, khi bấm vào từng nhân viên thì sẽ hiển thị thông tin chi tiết về quyết định nhận việc của nhân viên đó ở bên phải với các tab tương ứng với từng phần thông tin như Thông tin chung, Thông tin bổ sung, Thông tin Giáo dục, Quá trình làm việc và Thông tin gia đình. Dữ liệu sẽ được lấy từ bảng HR_EMPLOYEE_RECRUIT với các trường tham khảo hình ảnh (Khi thêm mới thì trường PERSON_ID căn cứ vào HR_PERSON_ID_SEQ.NEXTVAL, và ACTIVITY = 0).
Thông tin cơ bản và Thông tin bổ sung lưu vào bảng HR_EMPLOYEE_RECRUIT,
Thông tin giáo dục lưu vào bảng HR_EDUCATION_RECRUIT, với các trường tham khảo hình ảnh, trong đó có trường PERSON_ID để liên kết với bảng HR_EMPLOYEE_RECRUIT để lấy ra tên nhân viên và mã nhân viên (Khi thêm mới thì trường SEQ căn cứ vào HR_EDU_SEQ.NEXTVAL).
Quá trình làm việc lưu vào bảng HR_WORK_EXPERIENCE_RECRUIT, với các trường tham khảo hình ảnh, trong đó có trường PERSON_ID để liên kết với bảng HR_EMPLOYEE_RECRUIT để lấy ra tên nhân viên và mã nhân viên (Khi thêm mới thì trường SEQ căn cứ vào HR_W_EXP_SEQ.NEXTVAL).
Thông tin gia đình lưu vào bảng HR_FAMILY_RECRUIT, với các trường tham khảo hình ảnh, trong đó có trường PERSON_ID để liên kết với bảng HR_EMPLOYEE_RECRUIT để lấy ra tên nhân viên và mã nhân viên (Khi thêm mới thì trường SEQ căn cứ vào HR_FAMILY_SEQ.NEXTVAL).

Có điều kiện tìm kiếm theo Tạng thái, Đang thực hiện - ACTIVITY = 0, Hoàn thành - ACTIVITY = 1, mặc định ban đầu khi bấm vào tab thì để điều kiện là Đang thực hiện - ACTIVITY = 0 để hiển thị những nhân viên mới đang trong quá trình nhận việc, khi bấm vào tab Hoàn thành thì sẽ hiển thị những nhân viên mới đã hoàn thành việc nhận việc. Sau khi lưu thoogn tin nhận việc, tick chọn vào từng nhân viên rồi bấm Xác nhận (nút Xác nhận chỉ hiển thị khi tick chọn vào nhân viên và dữ liệu dang trong quá trình thực hiện) thì sẽ gọi package PKG_RECRUIT_MANAGE.PR_RECRUIT_EXECUTE(
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#personIds:VARCHAR#,
						#type:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#) với nút Xác nhận thì type sẽ là 'CONFIRM'. 
Khi ta cứu ra những nhân viên đã Hoàn thành nhận việc Hoàn thành - ACTIVITY = 1 thì sẽ có nút Hủy xác nhận, khi bấm vào sẽ gọi lại package PKG_RECRUIT_MANAGE.PR_RECRUIT_EXECUTE(
            #adminID:VARCHAR#,
            #adminIP:VARCHAR#,
            #cpnyId:VARCHAR#,
            #personIds:VARCHAR#,
            #type:VARCHAR#,
            #message,jdbcType=VARCHAR,mode=OUT#) với nút Hủy xác nhận thì type sẽ là 'CANCEL'.

            phần vrl_deptNo lựa chọn phòng ban, tham khảo veas_deptSearch của viewEvsAffirmorSetup.html để lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban (chỉ được phép chọn 1 phòng ban). khi hiện ra thì hiện Tên phòng ban, khi chọn xong thì lưu giá trị vào trường DEPTNO. vrl_costCenter cũng làm tương tự nhưng lưu giá trị vào trường COST_CENTER. khi chọn được phòng ban thì vrl_costCenter cũng được tuwej động chọn đúng mã đó.

Tương tự như viewRecruitList.html, hãy tạo cho tôi file viewStartPoint.html - Quyết định nhân sự nằm trong module hrm/empinfo. chức năng của file này để người quản lý nhập liệu về các quyết định của nhân viên vào hệ thống. giao diện sẽ để bên trái là danh sách các quyết định của nhân viên, khi bấm vào từng quyết định thì sẽ hiển thị thông tin chi tiết về quyết định của nhân viên đó ở bên phải. Dữ liệu sẽ được lấy từ bảng HR_EXPERIENCE_INSIDE, kết hợp cùng HR_EMPLOYEE với các trường của bảng HR_EXPERIENCE_INSIDE tham khảo hình ảnh (Khi thêm mới thì trường SEQ căn cứ vào HR_EXP_INSID_SEQ.NEXTVAL, và ACTIVITY = 0). với TRANS_CODE - Tên quyết định (dữ liệu lấy lấy thông qua data-parent-code="1359"), START_DATE - Ngày quyết định (định dạng ngày tháng là DD/MM/YYYY). Mặc định ban đầu khi bấm vào tab thì lấy ra những quyết định của người dùng đang đăng nhập vào hệ thống. Điều kiện tìm kiếm theo Mã/tên nhân viên và chỉ tìm ra  duy nhất 1 người đó để hiển thị ra những quyết định của người đó. có đầy đủ Thêm mới, Sửa, Xóa và xuất excel.

vsp_position - Vị trí, dữ liệu lấy thông qua data-parent-code="14014049"
vsp_mainBusiness - Công việc, dữ liệu lấy thông qua data-parent-code="400098"
khi chọn value của Loại quyết định - vsp_transCode thì đồng thời load lại 
Lý do quyết định - vsp_transResource với data-parent-code chính là value vừa chọn của Loại quyết định.

Tương tự như vrl_deptNo của viewRecruitList.html, phần vsp_deptNo lựa chọn phòng ban, lấy ra cây phòng ban để làm điều kiện tìm kiếm phòng ban (chỉ được phép chọn 1 phòng ban). khi hiện ra thì hiện Tên phòng ban, khi chọn xong thì lưu giá trị vào trường DEPTNO. vsp_costCenter cũng làm tương tự nhưng lưu giá trị vào trường COST_CENTER. khi chọn được phòng ban thì vsp_costCenter cũng được tự động chọn đúng mã đó.

Ngày quyết định - hãy để dạng js-daterangepicker để lựa chọn (ĐỊnh dang DD/MM/YYYY), Khi bấm Thêm mới thì Ngày quyết định sẽ mặc định là ngày hiện tại, người dùng có thể thay đổi nếu cần thiết. Loại quyết định để trống, còn những trường khác thì lấy giá trị  từu quyết định mới nhất.

Chức năng giống như viewStartPoint.html, hãy tạo cho tôi file viewExperienceBatchList.html - Quyết định hàng loạt nằm trong module hrm/recruitManage. chức năng của file này để người quản lý nhập liệu bằng excel về các quyết định của nhân viên vào hệ thống. Giao diện tham khảo hình ảnh. ở đây có selectbox Ngày đăng ký được lấy từ bảng HR_RECRUIT_REGISTER_INFO với với điều kiện REGISTER_TYPE = '80000057', các trường tham khảo hình ảnh. khi bấm vào tab thì dữ liệu được lấy ra từ bảng HR_EXPERIENCE_INSIDE_BATCH sẽ căn cứ vào giá trị của selectbox Ngày đăng ký để hiển thị những quyết định hàng loạt đã được nhập vào hệ thống tương ứng với ngày đăng ký đó (SEQ của HR_RECRUIT_REGISTER_INFO tương ứng với REGISTER_SEQ của HR_EXPERIENCE_INSIDE_BATCH). Khi bấm vào Đăng ký  sẽ mở modal để nhập REGISTER_DATE và REMARK, sau đó bấm Lưu thì sẽ lưu vào bảng HR_RECRUIT_REGISTER_INFO với REGISTER_TYPE = '80000057'
file excel sẽ có định dạng như sau: cột A là EMPID, cột B là LOCAL_NAME, cột C là START_DATE, cột E là TRANS_CODE, cột G là DEPTNO, cột I là POST_FAMILY, cột K là POST_GRADE_NO, cột M là POSITION_NO, cột O là EMP_TYPE_CODE, cột Q là MAIN_BUSINESS, cột S là COST_CENTER, cột T là REMARK. sau khi người quản lý upload file excel lên thì sẽ đọc dữ liệu từ file đó và lưu vào bảng HR_EXPERIENCE_INSIDE_BATCH với các trường tham khảo hình ảnh, trong đó có trường PERSON_ID để liên kết với bảng HR_EMPLOYEE để lấy ra tên nhân viên và mã nhân viên (Khi thêm mới thì trường SEQ căn cứ vào HR_EXPERIENCE_INSIDE_BATCH_SEQ.NEXTVAL). chức năng tải bản mẫu và upload excel tham khảo attNewDownloadTemplate và attNewOpenImportModal của viewApplyAttManagentByAnyApproverList.html. file mẫu của viewExperienceBatchList.html là StartPoint_add_Template.xlsx 
sau khi tải lên thành công thì load lại dữ liệu từ bảng HR_EXPERIENCE_INSIDE_BATCH ra giao diện để người quản lý có thể xem lại thông tin vừa nhập, nếu có sai sót thì có thể chỉnh sửa trực tiếp trên giao diện, sau đó bấm Xác nhận thì gọi package PKG_RECRUIT_MANAGE.PR_RECRUIT_EXECUTE(
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#personIds:VARCHAR#,
						#type:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#) với nút Xác nhận thì type sẽ là 'EXP_BATCH'

Khi tải file mẫu thì tôi cần lấy dữ liệu để đưa vào file mẫu, chứ không phải là file mẫu trống, sẽ lấy dữ liệu để đưa vào sheet "TemplateCode". 
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014049'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.

1. tôi thấy groups.add(deptPairs); có lấy được dữ liệu, nhưng lại không đưa vào fiel excel mẫu được. 
2. 

Giống như viewExperienceBatchList.html, hãy tạo cho tôi file viewRecruitBatchList.html - Nhận việc hàng loạt nằm trong module hrm/recruitManage. chức năng của file này để người quản lý nhập liệu bằng excel về các quyết định nhận việc của nhân viên vào hệ thống. Giao diện tham khảo hình ảnh. ở đây có selectbox Ngày đăng ký được lấy từ bảng HR_RECRUIT_REGISTER_INFO với với điều kiện REGISTER_TYPE = '14014410'. khi bấm vào tab thì dữ liệu được lấy ra từ bảng HR_EMPLOYEE_RECRUIT_BATCH sẽ căn cứ vào giá trị của selectbox Ngày đăng ký để hiển thị những quyết định hàng loạt đã được nhập vào hệ thống tương ứng với ngày đăng ký đó (SEQ của HR_RECRUIT_REGISTER_INFO tương ứng với REGISTER_SEQ của HR_EMPLOYEE_RECRUIT_BATCH). Khi bấm vào Đăng ký  sẽ mở modal để nhập REGISTER_DATE và REMARK, sau đó bấm Lưu thì sẽ lưu vào bảng HR_RECRUIT_REGISTER_INFO với REGISTER_TYPE = '14014410'
file excel sẽ có định dạng như sau: cột A là EMPID, cột B là VIETNAM_NAME, cột C là ENGLISH_NAME, cột D là DOB, cột E là DATE_STARTED, cột F là END_PROBATION_DATE,  cột H là JOIN_TYPE, cột J là JOIN_DETAIL_TYPE, cột L là DEPTNO, cột N là POST_GRADE_NO, cột P là MAIN_BUSINESS, cột R là POST_FAMILY, cột T là EMP_TYPE_CODE, cột V là POSITION_NO, cột X là COST_CENTER, cột Z là FINAL_DEGREE_CODE, cột AA là END_DATE, cột AB là INSTITUTION_NAME, cột AC là SUBJECT_NAME, cột AD là IDCARD_NO, cột AE là IDCARD_S_DATE, cột AF là ISSUING_AUTHORITY, cột AH là SEXCODE, cột Ạ là NATIONALITY_CODE, cột AL là NATION_CODE, cột AN là MARITAL_STATUS_CODE, cột AO là EMAIL_SECOND, cột AP là HOME_PHONE, cột AQ là TELEPHONE, cột AR là ADDRESS_CONTENT, cột AS là  REG_PLACE. sau khi người quản lý upload file excel lên thì sẽ đọc dữ liệu từ file đó và lưu vào bảng HR_EMPLOYEE_RECRUIT_BATCH với các trường tham khảo hình ảnh(Khi thêm mới thì trường SEQ căn cứ vào HR_EMPLOYEE_RECRUIT_BATCH_SEQ.NEXTVAL). chức năng tải bản mẫu và upload excel tham khảo eblDownloadTemplate và eblOpenImportModal của viewExperienceBatchList.html. file mẫu của viewRecruitBatchList.html là NewEmp_add_Template.xlsx 
sau khi tải lên thành công thì load lại dữ liệu từ bảng HR_EMPLOYEE_RECRUIT_BATCH ra giao diện để người quản lý có thể xem lại thông tin vừa nhập, nếu có sai sót thì có thể chỉnh sửa trực tiếp trên giao diện, sau đó bấm Xác nhận thì gọi package PKG_RECRUIT_MANAGE.PR_RECRUIT_EXECUTE(
						#adminID:VARCHAR#,
						#adminIP:VARCHAR#,
						#cpnyId:VARCHAR#,
						#personIds:VARCHAR#,
						#type:VARCHAR#,
						#message,jdbcType=VARCHAR,mode=OUT#) với nút Xác nhận thì type sẽ là 'CONFIRM_BATCH'.

Khi tải file mẫu thì tôi cần lấy dữ liệu để đưa vào file mẫu, chứ không phải là file mẫu trống, sẽ lấy dữ liệu để đưa vào sheet "TemplateCode". 
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '1359'. với name đưa vào cột A, code đưa vào cột B. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '400414','400435','400429'. với name đưa vào cột C, code đưa vào cột D. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ HR_DEPARTMENT. với ORG_NAME_LOCAL đưa vào cột O VÀ Q, DEPTNO đưa vào cột P VÀ R. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14015812'. với name đưa vào cột E, code đưa vào cột F. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '400001'. với name đưa vào cột G, code đưa vào cột H. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '14014036'. với name đưa vào cột I, code đưa vào cột J. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '13864'. với name đưa vào cột K, code đưa vào cột L. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '400098'. với name đưa vào cột M, code đưa vào cột N. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '13769'. với name đưa vào cột S, code đưa vào cột T. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '1324'. với name đưa vào cột U, code đưa vào cột V. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '870'. với name đưa vào cột W, code đưa vào cột X. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '210942'. với name đưa vào cột Y, code đưa vào cột Z. bắt đầu từ dòng thứ 2.
cụ thể là lấy dữ liệu từ syCodeParamService.getList(parentCode, null) với parentCode là '1709'. với name đưa vào cột AA, code đưa vào cột AB. bắt đầu từ dòng thứ 2.


EMPID, VIETNAM_NAME, ENGLISH_NAME, DOB, DATE_STARTED, END_PROBATION_DATE,  JOIN_TYPE, JOIN_DETAIL_TYPE, DEPTNO, POST_GRADE_NO, MAIN_BUSINESS, POST_FAMILY, EMP_TYPE_CODE, POSITION_NO, COST_CENTER, FINAL_DEGREE_CODE, END_DATE, INSTITUTION_NAME, SUBJECT_NAME, IDCARD_NO, IDCARD_S_DATE, ISSUING_AUTHORITY, SEXCODE, NATIONALITY_CODE, NATION_CODE, MARITAL_STATUS_CODE, EMAIL_SECOND, HOME_PHONE, TELEPHONE, ADDRESS_CONTENT, REG_PLACE.

server chạy của tôi (10.42.200.141) có tomcat: C:\apache-tomcat-10.1.55
JDK: C:\Program Files\Java\jdk-21.0.10
JEUS_HOME=D:\JEUS
DB_URL=jdbc:oracle:thin:@//10.42.200.55:1526/HAEHR
DB_USERNAME=HAE_HR
DB_PASSWORD=`1q2w3a4s
có cần phải viết lại deploy-jeus.bat để phù hợp với cấu hình này không

ở trong file C:\apache-tomcat-10.1.55\bin\setenv.bat tôi đã thiết lập @echo off

REM === Java Options ===
set "JAVA_OPTS=-Xms512m -Xmx1024m -Dfile.encoding=UTF-8"

REM === Database Configuration ===
set "DB_URL=jdbc:oracle:thin:@//10.42.200.55:1526/HAEHR"
set "DB_USERNAME=HAE_HR"
set "DB_PASSWORD=`1q2w3a4s"

REM === Photo Upload Path ===
set "PHOTO_UPLOAD_PATH=D:/source/VHR/HAE_HR/resources/photo/HAE"

REM === Session Cookie (đặt false nếu dùng HTTP thay vì HTTPS) ===
set "SESSION_COOKIE_SECURE=false"

trong C:\apache-tomcat-10.1.55\conf\server.xml tôi cũng sửa port=8088
Nhưng vẫn không được, cmd tắt rất nhanh, còn không ghi ra log nữa

ở đây hãy loại bỏ cách lấy thông tin người phê duyệt từ /ar/attendanceMintenance/api/leaveApply/approvers. thay vào đó người dùng sẽ tự thêm người phê duyệt vòa. Cụ thể hãy thêm cho tôi dấu (+) để người dùng có thể bấm vào đó để thêm người phê duyệt, khi bấm vào sẽ hiện ra 1 dòng mới để người dùng nhập tên người phê duyệt vào, sau khi nhập xong thì bấm Enter để lưu lại người phê duyệt đó vào danh sách những người phê duyệt của đơn xin nghỉ phép đó (Tham khảo cách tìm người với abEmpInputKeydown của viewApplyAttenanceBatchInfoList). Người dùng có thể thêm nhiều người phê duyệt nếu cần thiết, và cũng có thể xóa người phê duyệt đã thêm nếu muốn. Việc này sẽ giúp cho người dùng linh hoạt hơn trong việc quản lý những người phê duyệt cho đơn xin nghỉ phép của mình mà không bị giới hạn bởi việc phải lấy thông tin từ một API nào đó.

Vì đã dùng chức năng thêm lien phê duyệt, nên khi bấm Xin phép thì không cần gọi GET_AFFIRMOR_LIST_IMPROVE để lấy line phê duyệt nữa, mà thay vào đó sử dụng luôn line phê duyệt vừa thêm để thực hiện

khi Lưu thành công thì sẽ gọi đến function sendAffirmInfoEmailApproval của MailSendApprovalManager để gửi thông tin đến những người phê duyệt đã được thêm vào, với nội dung bao gồm thông tin về đơn xin nghỉ phép của người dùng như tên người dùng, ngày bắt đầu, ngày kết thúc, thời lượng, lý do nghỉ và danh sách những người phê duyệt đã được thêm vào. hãy xem lại function sendAffirmInfoEmailApproval và các function liên quan, đây là function tôi dùng từ dự án khác (dùng để kết nối đến web service, với các function liên quan nằm trong \hanwha\neo\branch), bắt buộc phải dùng EagleOffice SOAP web service (hanwha.neo.branch), vì mục đích là đồng bộ dữ liệu EagleOffice SOAP web service, hãy kiểm tra lại và chỉnh sửa cho phù hợp với dự án này, để đảm bảo rằng việc đồng bộ được gửi đi đúng định dạng và nội dung như mong muốn.

thêm cho tôi function getWaitSendApplyInfoList này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT APPLY_DATA.*,
			   (GET_AR_OT_TOTAIL(TO_CHAR(TO_DATE(APPLY_DATA.FROM_TIME, 'DD/MM/YYYY HH24:MI'),'YYYY/MM/DD'),'HAE',APPLY_DATA.PERSON_ID,'30') + 
			   GET_AR_OT_TOTAIL(TO_CHAR(TO_DATE(APPLY_DATA.FROM_TIME, 'DD/MM/YYYY HH24:MI'),'YYYY/MM/DD'),'HAE',APPLY_DATA.PERSON_ID,'301') ) OT_TOTAIL_MONTH,
			   MISDOCID
		  FROM 
			) APPLY_DATA


thêm cho tôi function getAffirmListByApplyNo này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT S.SEQ,
		            
thêm cho tôi function getReceiverListByApplyNo này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT S.SEQ,

thêm cho tôi function getNeedCancelApprovalInfo này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT A.APPLY_NO,

thêm cho tôi function getSynchronizationApprovalList này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT *

thêm cho tôi function getSendDataInfoList này, function này sẽ lấy dữ liệu từ câu lệnh SQl: SELECT ATT.APPLY_NO,

thêm cho tôi function viewModifyApprovalInfo này, function này sẽ dùng câu lệnh SQl: UPDATE SY_AFFIRM_EMAIL A SET A.SEND_FLAG = #SEND_FINISH_FLAG#
			 WHERE A.SEQ = #SEQ#


Tương tự như chức năng thêm line phê duyệt - saAddApproverRow của viewSSTApplyAttendance.html, hãy sửa lại viewSSTOtApplyInfo.html thành kiểu thêm line phê duyệt như vậy (loại bỏ chức năng tự động lấy ra line phê duyệt), check kỹ ở phần backend khi bấm Xin phép (vì bỏ chức năng tự động lấy ra line phê duyệt) 

thêm cho tôi các trường USECAR_YN (number 0 hoặc 1) - Đặt xe hay không. CAR_ADDRESS - Tuyến xe (dữ liệu lấy lấy thông qua data-parent-code="90000578" không có data-default-text). CAR_ADDRESS_DETAIL - Chi tiết điểm đón.  khi chọn value của CAR_ADDRESS - Tuyến xe thì đồng thời load lại Chi tiết điểm đón với data-parent-code chính là value vừa chọn của Tuyến xe. 

Thêm cho tôi thông tin việc dùng xe với giao diện của viewPOtApplyInfoList.html - Chi tiết tăng ca

viewApplyOtLBatchByAnyApproverList.html là giao diện về xin tăng ca cho quản lý, (xin hộ cho nhân viên). ở giao diện này hãy thêm thông tin việc dùng xe với USECAR_YN, CAR_ADDRESS và CAR_ADDRESS_DETAIL. Khi thêm mới thì cũng thay vì tự động lấy line phê duyệt thì người dùng tự thêm line phê duyệt.

Tuwowng tự viewApplyOtLBatchByAnyApproverList.html, ở giao diện viewApplyAttBatchByAnyApproverList.html Khi thêm mới thì cũng thay vì tự động lấy line phê duyệt thì người dùng tự thêm line phê duyệt.

Tương tự viewApplyOtLBatchByAnyApproverList.html, ở giao diện viewAttendanceExForBatchInfoList.html Trước khi bấm Xin phép thì cũng thay vì tự động lấy line phê duyệt thì người dùng tự thêm line phê duyệt.

Tương tự viewApplyAttBatchByAnyApproverList.html, ở giao diện viewApplyAttManagentByAnyApproverList.html Khi thêm mới thì cũng thay vì tự động lấy line phê duyệt thì người dùng tự thêm line phê duyệt.

Tương tự viewApplyOtLBatchByAnyApproverList.html, ở giao diện viewApplyOtManagentByAnyApproverList.html hãy thêm thông tin việc dùng xe với USECAR_YN, CAR_ADDRESS và CAR_ADDRESS_DETAIL. Khi thêm mới thì cũng thay vì tự động lấy line phê duyệt thì người dùng tự thêm line phê duyệt.

viewApplyOTBatchInfoHAE

Giống như viewSSTOtApplyInfo.html. hãy tạo cho tôi file viewSSTOtApplyInfoTx.html - Xin tăng ca vượt nằm trong module ess/infoApply. tất cả chức năng đều giống hệt như viewSSTOtApplyInfo.html. chỉ khác là với viewSSTOtApplyInfo thì tác động vào bảng ess_apply_ot, còn viewSSTOtApplyInfoTx thì tác động vào bảng ess_apply_ot_over, và otTypeNo = '310' thay vì 31 như của viewSSTOtApplyInfo. bảng ess_apply_ot_over có các trường giống hệt các trường của ess_apply_ot.

Giống như viewPOtApplyInfoList.html. hãy tạo cho tôi file viewPiciOtAffirmPBatchList.html - Chi tiết xin tăng ca vượt nằm trong module ess/infoApply. tất cả chức năng đều giống hệt như viewSSTOtApplyInfo.html. chỉ khác là với viewPOtApplyInfoList thì tác động vào bảng ess_apply_ot, còn viewPiciOtAffirmPBatchList thì tác động vào bảng ess_apply_ot_over, và otTypeNo = '310' thay vì 31 như của viewSSTOtApplyInfo. bảng ess_apply_ot_over có các trường giống hệt các trường của ess_apply_ot.


Giống như viewApplyOtLBatchByAnyApproverList.html. hãy tạo cho tôi file viewApplyOTBatchInfoHAE.html - Xin tăng ca vượt nằm trong module ess/infoApply. tất cả chức năng đều giống hệt như viewApplyOtLBatchByAnyApproverList.html. chỉ khác là với viewApplyOtLBatchByAnyApproverList thì tác động vào bảng ess_apply_ot, còn viewApplyOTBatchInfoHAE thì tác động vào bảng ess_apply_ot_over, và otTypeNo = '310' thay vì 31 như của viewSSTOtApplyInfo. bảng ess_apply_ot_over có các trường giống hệt các trường của ess_apply_ot.



Giống như viewCoordApplyOtInfoList.html. hãy tạo cho tôi file viewApplyOTBatchInfoHAEList.html - Chi tiết xin tăng ca vượt nằm trong module ess/infoApply. tất cả chức năng đều giống hệt như viewCoordApplyOtInfoList.html. chỉ khác là với viewCoordApplyOtInfoList thì tác động vào bảng AR_DETAIL_HAE, còn viewApplyOTBatchInfoHAEList thì tác động vào bảng AR_DETAIL_HAE_ot.

căn cứ vào viewDeptPersonalInfoManageList.html. hãy tạo cho tôi 1 file viewPersonalInfoEss.html - Hồ sơ nhân viên năm trong module /ess/viewDept/. Giao diện tham khảo hình ảnh. Dữ liệu lấy từ các bảng HR_EMPLOYEE, HR_PERSONAL_INFO, HR_EDUCATION, hr_emergency_address, hr_address_matters, hr_family, ...

Giống như viewPersonalInfoEss.html. hãy tạo cho tôi 1 file viewPersonalInfo.html - Hồ sơ nhân viên nằm trong module /hrm/empinfo/

Thêm cho tôi các điểu kiện sau trước khi bấm Xin phép:
1. Nếu người dùng chọn Loại nghỉ phép là Nghỉ phụ nữ - value = 141474 thì Thời lượng phải nhỏ hơn 3 tiếng (180 phút)
2. Nếu chọn Loại nghỉ phép là Nghỉ phép năm - value = 26 thì Thời lượng phải nhỏ hơn Số ngày còn lại - vacRemain, và thời lượng phải là bội số của nửa ngày (0.5 ngày, 1 ngày, 1,5 ngày, ...)
3. Thời lượng - sa_duration luôn phỉa lớn hơn 0
4. Chỉ phụ nữ (SEXCODE ở bảng hr_personal_info là 1325) thì mới được phép chọn Loại nghỉ phép là Nghỉ phụ nữ - value = 141474, và Nghỉ thai sản - value = 27


Tương tự những điều kiện này hãy áp dụng cho 2 giao diện viewApplyAttBatchByAnyApproverList và viewApplyAttManagentByAnyApproverList, đây là 2 giao diện dành cho người quản lý, xin nghỉ phép cho nhân viên của mình

Ở giao diện viewSSTOtApplyInfo này hãy Thêm cho tôi các điểu kiện sau trước khi bấm Xin phép:
1. Bắt buộc phải điền Lý do
2. Người xin tăng ca, nếu nhóm nhân viên - Post_Family = 14015813 hoặc 14015814, thì thời lượng tăng ca phải trên 1 tiếng (60 phút), nếu nhóm nhân viên - Post_Family = 14015815, thì thời lượng tăng ca phải trên 0.5 tiếng (30 phút)
3. Hình thức tăng ca nếu là Ngày thường (soa_dateTypeCode = 32) thì thời lượng không được quá 3 tiếng (180 phút), nếu không phải ngày thường thì thời lượng không được quá 12 tiếng (720 phút)
4. Nếu thời gian lúc bấm Xin phép mà sau SHIFT_END_TIME (sau khi kết thúc ca làm việc trong ngày) thì line phê duyệt phải thêm Trưởng bộ phận nhân sự ( có Person_id chính là giá trị MANAGER_EMP_ID của bảng hr_department với DEPTNO = 'D11BV602')

Tương tự những điều kiện này hãy áp dụng cho 2 giao diện viewApplyOtManagentByAnyApproverList và viewApplyOtLBatchByAnyApproverList, đây là 2 giao diện dành cho người quản lý, xin tăng ca cho nhân viên của mình

Tương tự những điều kiện này hãy áp dụng cho 2 giao diện viewApplyOTBatchInfoHAEList và viewApplyOTBatchInfoHAE, mặc dù là tăn ca vượt nhưng điều kiện cũng tương tư như tăng ca bình thường.

Ở đây tôi đã có chức năng thêm mới đối tượng đánh giá, nhưng tôi muốn thêm chức năng thêm mới đối tượng đánh giá theo file excel tải lên, cụ thể là khi bấm vào nút Import Excel thì sẽ hiện ra modal để người dùng upload file excel lên, sau khi upload xong thì đọc dữ liệu từ file excel đó và lưu vào bảng evs_object_temp với các trường tham khảo hình ảnh (Tham khảo phương pháp upload file excel của vpidOpenImportModal trong viewPaInputItemData.html). Khi upload từ file excel thì cột A là EMPID, cột B là AFFIRM_ID_1, cột C là AFFIRM_NAME_1, cột D là AFFIRM_ID_2, cột E là AFFIRM_NAME_2 (file excel như hình ảnh). Khi upload xong thì thực hiện việc thêm mới giống với chức năng thêm mới hiện tại, chỉ là chức năng hiện tại thì nhập từng đối tượng từ giao diện, còn chức năng này là upload đối tượng từ file excel.

Thay đổi lại giao diện của viewRegPersonalTarget.html. Objective Confirm chia thành 2 phần "Mục tiêu chiến lược" và "Mục tiêu vận hành", trong đó Mục tiêu chiến lược sẽ lấy ra những mục tiêu có ITEM_TYPE = 1, còn Mục tiêu vận hành sẽ lấy ra những mục tiêu có ITEM_TYPE IS NULL. Phần "Mục tiêu chiến lược" có thể có hoặc không, nhưng tổng số điểm không được vượt quá 40 điểm. và tổng của cả 2 phần không được vượt quá 100 điểm. khi lưu dữ liệu thì vẫn giữ lại logic cũ chỉ là những hạng mục liên quan đến "Mục tiêu chiến lược" thì lưu với ITEM_TYPE = 1 còn những hạng mục liên quan đến "Mục tiêu vận hành" thì lưu với ITEM_TYPE IS NULL, nhưng khi hiển thị ra giao diện thì sẽ hiển thị ra 2 phần riêng biệt.


ở đây Loại tổ chức - deptType đang là code, hãy lấy theo name thông qua get_global_name(code, #{lang}).  ngoài ra chỗ Trưởng phòng thì managerEmpId đang hiển thị là personId, hãy chuyển sang empid thông qua get_empid(managerEmpId)

Tôi muốn thêm chức năng cho phép người dùng ngay từ giao diện login có thể gửi những góp ý, phản hồi về hệ thống, cụ thể là khi người dùng bấm vào nút Góp ý ở giao diện login thì sẽ hiện ra modal để người dùng nhập nội dung góp ý, sau đó bấm Gửi thì sẽ lưu vào bảng SY_FEEDBACK với các trường tham khảo hình ảnh (Khi thêm mới thì trường FEEDBACK_ID căn cứ vào SY_FEEDBACK_SEQ.NEXTVAL). Tiếp theo ở phần <!-- Notification --> của topbar.html, thêm 1 link /sys/viewFeedback - Thông tin góp ý, để khi người quản lý bấm vào đấy, sẽ hiện ra giao diện xem được những thông tin người dùng đã gửi.


bạn là người hiểu rõ về dự án này của tôi. hãy chuyển đổi dự án này từ thymeleaf (Frontend) sang Angular + NG-ZORRO. hãy build/nhúng Angular vào project Spring Boot của dự án. để khi tôi bấm vào Run and Debug thì sẽ tự động sử dụng đến Angular chứ khoogn dùng đến Thymeleaf cũ nữa, và khi đăng nhập thành công thì cũng điều hướng đến dashboard có Angular

Tôi đang trong quá trình chuyển đổi dự án từ thymeleaf (Frontend) sangAngular + NG-ZORRO. Khi đăng nhập tôi thấy dashboard.html vẫn đang sử dụng thymeleaf, tôi muốn khi đăng nhập thành công thì điều hướng đến dashboard có Angular. Hãy build/nhúng Angular vào project Spring Boot của dự án. để khi tôi bấm vào Run and Debug thì sẽ tự động sử dụng đến Angular chứ không dùng đến Thymeleaf cũ nữa.


hãy chuyển giao diện /ess/empinfo/viewEssApplyInfo.html này về dạng Angular + NG-ZORRO dữ liệu hiển thị ra không dùng dataTables nữa mà dùng nz-table (tham khảo manage-emp-position-info). sau khi hoàn thành thì có thể xóa file /ess/empinfo/viewEssApplyInfo.html cũ đi.

hãy chuyển giao diện /ess/viewDept/ManageEmpPositionInfoList.html này về dạng Angular + NG-ZORRO dữ liệu hiển thị ra không dùng dataTables nữa mà dùng nz-table. sau khi hoàn thành thì có thể xóa file /ess/viewDept/ManageEmpPositionInfoList.html cũ đi.


hãy chuyển giao diện /ess/viewDept/viewPersonalInfoEss.html này về dạng Angular + NG-ZORRO. sau khi hoàn thành thì có thể xóa file /ess/viewDept/viewPersonalInfoEss.html cũ đi.

bạn đã loại bỏ mất những thành phần trong topbar.html. hãy đưa những thành phần của topbar.html vào theo dạng Angular + NG-ZORRO. và sau đó có thể xóa topbar.html đi nếu nó khoogn cần thiết nữa.


ở phần menu bên trái nz-sider hãy chuyển thành nền #ee7f47 giúp tôi, chữ sẽ chuyển sang màu trắng đậm để nổi bật lên. Ngoài ra những menu cha ban đầu khi hiển thị hãy căn đều sang bên trái giúp tôi, các menu con sẽ thụt vào để thể hiện rõ sự phân cấp. có thêm icon cho menu cha và menu con.

chỉ show ra menu con của 1 menu cha duy nhất, khi bấm vào menu con của menu cha khác, thì menu con của menu cha kia sẽ bị thu lại, tức là 1 lần chỉ hiển thị danh sách menu con của 1 menu cha

vì giờ đã chuyển sang Angular + NG-ZORRO, vì vậy hãy xóa tất cả những gì liên quan đến thymeleaf đi, bao gồm cả thư việc và cấu hình. chỉ giữ lại những file giao diện html để làm dữ liệu tham khảo để làm giao diện dạng Angular sau này. 
hãy loại bỏ tất cả những gì liên quan đến Thymeleaf khi chạy. chỉ giữ lại những file .html cũ, để tôi chuyển dần sang angular


ở giao diện manage-emp-position-info phần phân trang hãy đưa ra lựa chọn 25, 50, 100, 200, 500. và thêm Tổng số dòng dữ liệu nữa

khi bấm vào menu thì mở các tab mới, không hiển thị tên của tab đó lên ô địa chỉ chỉ trình duyệt, ngoài ra khi bấm chuột phải vào tab, hãy hiện cho tôi các lựa chọn: Đóng tab, Đóng tất cả tab, Đóng tất cả tab bên trái, Đóng tấ cả tab bên phải.

Vẫn xóa topbar.html, khi bấm vào link HR Management System vẫn điều hướng bình thường sang hrm.html. nhưng bây giờ hãy chuyển sang dạng Angular + NG-ZORRO / PrimeNG (Frontend) cho hrm.html, và khi bấm vào link HR Management System thì vẫn điều hướng sang hrm.html nhưng không hiển thị tên của tab đó lên ô địa chỉ chỉ trình duyệt nữa. sau khi chuyển sang Angular + NG-ZORRO cho hrm.html thì có thể xóa hrm.html cũ đi.

hãy chuyển giao diện /login/login.html này về dạng Angular + NG-ZORRO. sau khi hoàn thành thì có thể xóa file /login/login.html cũ đi.

tôi thấy các giao diện đều có  phần search-card, hãy cố định nó, thanh cuộn chỉ cuộn phần dữ liệu hiển thị ra thôi, nếu được hãy cố định luôn cho tôi phần tiêu đề (th) của bảng, chỉ cuộn dữ liệu (td) thôi.
tôi thấy vẫn không được, bạn hãy tham khảo view-pa-pay-schedule của D:\Java\WorkSpace\New_HR\HVV-VHR\frontend-ng\src\app. ở dụ án HVV-VHR làm rất tốt việc này

tương tự như /ess/arConfirm/viewLeaveConfirmList - Xác nhận nghỉ phép, hãy tạo cho tôi giao diện /ess/arConfirm/viewPOtApplyInfoConfirmList - Xác nhận tăng ca. Dữ liệu và sso lượng cần xác nhận lấy từ câu lệnh SQL: SELECT ESS.APPLY_NO,

tương tự như /ess/empinfo/viewQualificationInfo - Thông tin chứng chỉ. hãy tạo cho tôi giao diện /evs/manage/viewEvsResultEmp - Kết quả đánh giá nhân viên, Tham khảo hình ảnh. Dữ liệu và sso lượng cần xác nhận lấy từ câu lệnh SQL: SELECT EVS_YEAR,

tạo mới giao diện /ar/countAttendance/arCountInfoList - Hiện trạng chấm công của nhân viên với dạng Angular + NG-ZORRO  (Frontend). giao diện tham khảo hình ảnh. bên trong giao diện có 2 tab là "Nghỉ phép" và tăng ca, 
Dữ liệu tab Nghỉ phép lấy từ selectSummaryList trong ArPersonalListMapper.xml, hiển thị ra tương tự như ở giao diện ar-personal-list,
Dữ liệu tab Tăng ca lấy từ câu lệnh SQL: SELECT H.EMPID EMPID_ID,
        H.LOCAL_NAME,
.

Thêm cho tôi giao diện /sys/notice/viewPersonalDataConfirmList - Danh sách xác nhận đồng ý xử lý dữ liệu cá nhân, với các cột: STT, Họ và tên, ID, Chức vụ, Team, Part, Cell, Ngày xác nhận, Địa chỉ IP. Dữ liệu lấy từ bảng sy_user và bảng HR_EMPLOYEE. Khi người dùng bấm vào 1 dòng trong danh sách sẽ hiển thị ra cái nội dung giống với Popup bắt buộc xác nhận đồng ý xử lý dữ liệu cá nhân.

Thêm cho tôi giao diện /disc/autoExcel/viewRetrieveSqlMasterList - Quản lý truy vấn SQL tự động xuất excel, với các cột: STT, Tên truy vấn, Mô tả, Ngày tạo, Người tạo. Dữ liệu lấy từ bảng sys_sql_master (với các trường tham khảo hình ảnh, khi thêm mới thì trường SQL_SEQ sẽ tăng lên dựa vào câu lệnh SQL: SELECT case when MAX(to_number(SQL_SEQ))  is null  or MAX(to_number(SQL_SEQ))='' then 1 else  MAX(to_number(SQL_SEQ))+1 end from sys_sql_master ), có đầy đủ chức năng: Thêm, Sửa, Xóa, Tìm kiếm. Mục đích của giao diện này là để người quản lý có thể tạo ra các truy vấn SQL, và khi bấm vào 1 dòng trong danh sách sẽ hiển thị ra giao diện Chi tiết truy vấn SQL tự động xuất excel, nơi người quản lý có thể nhập câu lệnh SQL, và khi bấm Lưu thì sẽ lưu vào bảng sys_sql_master, với các params truyền vào câu lệnh SQL sẽ là các giá trị mà người dùng nhập vào, rồi lưu vào bảng sys_param_by_sql (với các trường tham khảo hình ảnh). Khi người dùng chọn vào 1 dòng trong danh sách và bấm vào nút Xuất excel thì sẽ thực hiện câu lệnh SQL đó và xuất ra file excel. 

Tôi đang thực hiện việc chuyển đổi dự án HR ở dự án D:\Java\WorkSpace\Hanwha_HAE sang dự án này. Tạo mới cho tôi giao diện /pa/workManagement/detailmonthCountInfoLeft - Hệ thống đào tạo với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như /pa/workManagement/detailmonthCountInfoLeft ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này. với modal, khi bấm chuột ra ngoài phạm vi modal thì sẽ đóng modal.

Tương tự Tạo mới cho tôi giao diện /edu/traineducation/courseSubjects, /edu/traineducation/trainBasicInformation, /edu/traineducation/studentEvaluate, /edu/traineducation/teacherEvaluate, /edu/traineducation/trainResult và /edu/traineducation/trainCostManager với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như các giao diện tương ứng ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.



Tương tự Tạo mới cho tôi giao diện /edu/trainfile/trainCalendar, /report/ar/viewTrainReport và /edu/traineducation/trainArchives với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như các giao diện tương ứng ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.

Tương tự Tạo mới cho tôi giao diện /edu/traineducation/courseApply, /edu/traineducation/courseMaker, /edu/traineducation/courseConfirm, /edu/traineducation/makerSituation và /edu/traineducation/makerSituationHUB với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như các giao diện tương ứng ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.

Tương tự Tạo mới cho tôi giao diện /edu/trainfile/personalTrainCalendar và /edu/traineducation/viewRegisterForTraining với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như các giao diện tương ứng ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.

Tôi đang thực hiện việc chuyển đổi dự án HR ở dự án D:\Java\WorkSpace\Hanwha_HAE sang dự án này. Chỉnh sửa lại cho tôi giao diện /pa/workManagement/viewPaArSummaryForManageList với dạng Angular + NG-ZORRO  (Frontend). chức năng và giao diện hiển thị giống như ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.

Tôi đang thực hiện việc chuyển đổi dự án HR ở dự án D:\Java\WorkSpace\Hanwha_HAE sang dự án này. Chỉnh sửa lại cho tôi giao diện /pa/salary/viewPaResult với dạng Angular + NG-ZORRO  (Frontend). chức năng và giao diện hiển thị giống như ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.



Tôi đang thực hiện việc chuyển đổi dự án HR ở dự án D:\Java\WorkSpace\Hanwha_HAE sang dự án này. Tạo mới cho tôi giao diện /pa/workManagement/detailmonthCountInfoLeft, /pa/workManagement/detailYearCountInfoLeft, /pa/workManagement/viewPaResultList, /pa/workManagement/viewDeptPaResultList và /report/ar/viewArReportsList  với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.


Tôi đang thực hiện việc chuyển đổi dự án HR ở dự án D:\Java\WorkSpace\Hanwha_HAE sang dự án này. Tạo mới cho tôi giao diện /pa/workManagement/monthPersonCountInfoList, /pa/paView/viewPaMonthChain, /pa/workManagement/viewVerificationList, /pa/workManagement/detailPersonCountInfo, /pa/workManagement/detailPersonCountInfoLeft, /pa/workManagement/detailItemCountInfo, /pa/workManagement/detailItemDifCountInfo và /pa/workManagement/viewResultConfirmList  với dạng Angular + NG-ZORRO  (Frontend). chức năng giống như ở dự án D:\Java\WorkSpace\Hanwha_HAE. chỉ là giao diện được chuyển sang Angular + NG-ZORRO  (Frontend) và tương thích với dự án mới này.