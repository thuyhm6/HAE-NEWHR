-- Script insert dữ liệu mẫu cho hệ thống menu và quyền
-- Tạo dữ liệu mẫu cho sy_menu, sy_role, sy_role_group, sy_role_group_relation, sy_role_relation, sy_user_relation

-- Insert dữ liệu mẫu cho sy_menu (có phân cấp)
INSERT INTO sy_menu (MENU_NO, MENU_PARENT_NO, MENU_CODE, MENU_IMG, DEPTH, MENU_URL, ORDERNO, ACTIVITY, CREATED_BY) VALUES
-- Menu gốc (depth = 1)
('M001', NULL, 'EMPLOYEE_MANAGEMENT', 'solar:users-group-two-rounded-bold-duotone', 1, NULL, 1, 1, 'SYSTEM'),
('M002', NULL, 'DEPARTMENT_MANAGEMENT', 'solar:buildings-bold-duotone', 1, NULL, 2, 1, 'SYSTEM'),
('M003', NULL, 'COMPANY_MANAGEMENT', 'solar:buildings-2-bold-duotone', 1, NULL, 3, 1, 'SYSTEM'),
('M004', NULL, 'REPORTS', 'solar:chart-2-bold-duotone', 1, NULL, 4, 1, 'SYSTEM'),
('M005', NULL, 'SYSTEM_SETTINGS', 'solar:settings-bold-duotone', 1, NULL, 5, 1, 'SYSTEM'),

-- Menu con của Quản lý nhân viên (depth = 2)
('M001001', 'M001', 'EMPLOYEE_LIST', 'solar:user-bold-duotone', 2, '/employees', 1, 1, 'SYSTEM'),
('M001002', 'M001', 'EMPLOYEE_ADD', 'solar:user-plus-bold-duotone', 2, '/employees/add', 2, 1, 'SYSTEM'),
('M001003', 'M001', 'EMPLOYEE_EDIT', 'solar:user-edit-bold-duotone', 2, '/employees/edit', 3, 1, 'SYSTEM'),
('M001004', 'M001', 'EMPLOYEE_DETAIL', 'solar:user-check-bold-duotone', 2, '/employees/detail', 4, 1, 'SYSTEM'),

-- Menu con của Quản lý phòng ban (depth = 2)
('M002001', 'M002', 'DEPARTMENT_LIST', 'solar:buildings-bold-duotone', 2, '/departments', 1, 1, 'SYSTEM'),
('M002002', 'M002', 'DEPARTMENT_ADD', 'solar:buildings-plus-bold-duotone', 2, '/departments/add', 2, 1, 'SYSTEM'),
('M002003', 'M002', 'DEPARTMENT_EDIT', 'solar:buildings-edit-bold-duotone', 2, '/departments/edit', 3, 1, 'SYSTEM'),

-- Menu con của Quản lý công ty (depth = 2)
('M003001', 'M003', 'COMPANY_INFO', 'solar:buildings-2-bold-duotone', 2, '/company', 1, 1, 'SYSTEM'),
('M003002', 'M003', 'COMPANY_EDIT', 'solar:buildings-2-edit-bold-duotone', 2, '/company/edit', 2, 1, 'SYSTEM'),

-- Menu con của Báo cáo (depth = 2)
('M004001', 'M004', 'REPORT_EMPLOYEES', 'solar:chart-2-bold-duotone', 2, '/reports/employees', 1, 1, 'SYSTEM'),
('M004002', 'M004', 'REPORT_DEPARTMENTS', 'solar:chart-2-bold-duotone', 2, '/reports/departments', 2, 1, 'SYSTEM'),
('M004003', 'M004', 'REPORT_SUMMARY', 'solar:chart-2-bold-duotone', 2, '/reports/summary', 3, 1, 'SYSTEM'),

-- Menu con của Cài đặt hệ thống (depth = 2)
('M005001', 'M005', 'USER_MANAGEMENT', 'solar:user-speak-rounded-bold-duotone', 2, '/settings/users', 1, 1, 'SYSTEM'),
('M005002', 'M005', 'ROLE_MANAGEMENT', 'solar:user-speak-rounded-bold-duotone', 2, '/settings/roles', 2, 1, 'SYSTEM'),
('M005003', 'M005', 'PERMISSION_MANAGEMENT', 'solar:checklist-minimalistic-bold-duotone', 2, '/settings/permissions', 3, 1, 'SYSTEM'),
('M005004', 'M005', 'MULTILINGUAL_SETTINGS', 'solar:translate-bold-duotone', 2, '/multilingual/management', 4, 1, 'SYSTEM');

-- Insert dữ liệu mẫu cho sy_global_name (tên menu đa ngôn ngữ)
INSERT INTO sy_global_name (NO, LANGUAGE, CONTENT, CREATED_BY, ACTIVITY, ORDERNO) VALUES
-- Menu gốc (tiếng Việt)
('M001', 'vi', 'Quản lý nhân viên', 'SYSTEM', 'Y', 1),
('M002', 'vi', 'Quản lý phòng ban', 'SYSTEM', 'Y', 2),
('M003', 'vi', 'Quản lý công ty', 'SYSTEM', 'Y', 3),
('M004', 'vi', 'Báo cáo', 'SYSTEM', 'Y', 4),
('M005', 'vi', 'Cài đặt hệ thống', 'SYSTEM', 'Y', 5),

-- Menu con của Quản lý nhân viên (tiếng Việt)
('M001001', 'vi', 'Danh sách nhân viên', 'SYSTEM', 'Y', 1),
('M001002', 'vi', 'Thêm nhân viên', 'SYSTEM', 'Y', 2),
('M001003', 'vi', 'Chỉnh sửa nhân viên', 'SYSTEM', 'Y', 3),
('M001004', 'vi', 'Xem chi tiết nhân viên', 'SYSTEM', 'Y', 4),

-- Menu con của Quản lý phòng ban (tiếng Việt)
('M002001', 'vi', 'Danh sách phòng ban', 'SYSTEM', 'Y', 1),
('M002002', 'vi', 'Thêm phòng ban', 'SYSTEM', 'Y', 2),
('M002003', 'vi', 'Chỉnh sửa phòng ban', 'SYSTEM', 'Y', 3),

-- Menu con của Quản lý công ty (tiếng Việt)
('M003001', 'vi', 'Thông tin công ty', 'SYSTEM', 'Y', 1),
('M003002', 'vi', 'Cập nhật thông tin', 'SYSTEM', 'Y', 2),

-- Menu con của Báo cáo (tiếng Việt)
('M004001', 'vi', 'Báo cáo nhân viên', 'SYSTEM', 'Y', 1),
('M004002', 'vi', 'Báo cáo phòng ban', 'SYSTEM', 'Y', 2),
('M004003', 'vi', 'Báo cáo tổng hợp', 'SYSTEM', 'Y', 3),

-- Menu con của Cài đặt hệ thống (tiếng Việt)
('M005001', 'vi', 'Quản lý người dùng', 'SYSTEM', 'Y', 1),
('M005002', 'vi', 'Quản lý vai trò', 'SYSTEM', 'Y', 2),
('M005003', 'vi', 'Quản lý quyền', 'SYSTEM', 'Y', 3),
('M005004', 'vi', 'Cài đặt đa ngôn ngữ', 'SYSTEM', 'Y', 4),

-- Menu gốc (tiếng Anh)
('M001', 'en', 'Employee Management', 'SYSTEM', 'Y', 1),
('M002', 'en', 'Department Management', 'SYSTEM', 'Y', 2),
('M003', 'en', 'Company Management', 'SYSTEM', 'Y', 3),
('M004', 'en', 'Reports', 'SYSTEM', 'Y', 4),
('M005', 'en', 'System Settings', 'SYSTEM', 'Y', 5),

-- Menu con của Quản lý nhân viên (tiếng Anh)
('M001001', 'en', 'Employee List', 'SYSTEM', 'Y', 1),
('M001002', 'en', 'Add Employee', 'SYSTEM', 'Y', 2),
('M001003', 'en', 'Edit Employee', 'SYSTEM', 'Y', 3),
('M001004', 'en', 'Employee Details', 'SYSTEM', 'Y', 4),

-- Menu con của Quản lý phòng ban (tiếng Anh)
('M002001', 'en', 'Department List', 'SYSTEM', 'Y', 1),
('M002002', 'en', 'Add Department', 'SYSTEM', 'Y', 2),
('M002003', 'en', 'Edit Department', 'SYSTEM', 'Y', 3),

-- Menu con của Quản lý công ty (tiếng Anh)
('M003001', 'en', 'Company Information', 'SYSTEM', 'Y', 1),
('M003002', 'en', 'Update Information', 'SYSTEM', 'Y', 2),

-- Menu con của Báo cáo (tiếng Anh)
('M004001', 'en', 'Employee Reports', 'SYSTEM', 'Y', 1),
('M004002', 'en', 'Department Reports', 'SYSTEM', 'Y', 2),
('M004003', 'en', 'Summary Reports', 'SYSTEM', 'Y', 3),

-- Menu con của Cài đặt hệ thống (tiếng Anh)
('M005001', 'en', 'User Management', 'SYSTEM', 'Y', 1),
('M005002', 'en', 'Role Management', 'SYSTEM', 'Y', 2),
('M005003', 'en', 'Permission Management', 'SYSTEM', 'Y', 3),
('M005004', 'en', 'Multilingual Settings', 'SYSTEM', 'Y', 4);

-- Insert dữ liệu mẫu cho sy_role_group
INSERT INTO sy_role_group (ROLE_GROUP_NO, ROLE_GROUP_ID, JOIN_DEFAULT, CPNY_ID, ORDERNO, ACTIVITY, SYS_TYPE, CREATED_BY) VALUES
('RG001', 'ADMIN_GROUP', 'N', 'CP001', 1, 1, 'HR', 'SYSTEM'),
('RG002', 'MANAGER_GROUP', 'N', 'CP001', 2, 1, 'HR', 'SYSTEM'),
('RG003', 'USER_GROUP', 'Y', 'CP001', 3, 1, 'HR', 'SYSTEM');

-- Insert dữ liệu mẫu cho sy_role
INSERT INTO sy_role (ROLE_NO, ROLE_ID, CPNY_ID, ORDERNO, ACTIVITY, SYS_TYPE, CREATED_BY) VALUES
('R001', 'ADMIN', 'CP001', 1, 1, 'HR', 'SYSTEM'),
('R002', 'MANAGER', 'CP001', 2, 1, 'HR', 'SYSTEM'),
('R003', 'USER', 'CP001', 3, 1, 'HR', 'SYSTEM'),
('R004', 'HR_MANAGER', 'CP001', 4, 1, 'HR', 'SYSTEM'),
('R005', 'HR_USER', 'CP001', 5, 1, 'HR', 'SYSTEM');

-- Insert dữ liệu mẫu cho sy_role_group_relation
INSERT INTO sy_role_group_relation (ROLE_GROUP_NO, ROLE_NO, ORDERNO, ACTIVITY, CREATED_BY) VALUES
-- Admin group có tất cả quyền
('RG001', 'R001', 1, 1, 'SYSTEM'),
('RG001', 'R002', 2, 1, 'SYSTEM'),
('RG001', 'R003', 3, 1, 'SYSTEM'),
('RG001', 'R004', 4, 1, 'SYSTEM'),
('RG001', 'R005', 5, 1, 'SYSTEM'),

-- Manager group có quyền quản lý và user
('RG002', 'R002', 1, 1, 'SYSTEM'),
('RG002', 'R003', 2, 1, 'SYSTEM'),
('RG002', 'R004', 3, 1, 'SYSTEM'),
('RG002', 'R005', 4, 1, 'SYSTEM'),

-- User group chỉ có quyền user
('RG003', 'R003', 1, 1, 'SYSTEM'),
('RG003', 'R005', 2, 1, 'SYSTEM');

-- Insert dữ liệu mẫu cho sy_role_relation (quyền truy cập menu)
INSERT INTO sy_role_relation (ROLE_NO, MENU_NO, SELECTR, INSERTR, UPDATER, DELETER, ORDERNO, ACTIVITY, CREATED_BY) VALUES
-- Admin có tất cả quyền
('R001', 'M001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M001001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M001002', 'Y', 'Y', 'Y', 'Y', 2, 1, 'SYSTEM'),
('R001', 'M001003', 'Y', 'Y', 'Y', 'Y', 3, 1, 'SYSTEM'),
('R001', 'M001004', 'Y', 'Y', 'Y', 'Y', 4, 1, 'SYSTEM'),
('R001', 'M002', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M002001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M002002', 'Y', 'Y', 'Y', 'Y', 2, 1, 'SYSTEM'),
('R001', 'M002003', 'Y', 'Y', 'Y', 'Y', 3, 1, 'SYSTEM'),
('R001', 'M003', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M003001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M003002', 'Y', 'Y', 'Y', 'Y', 2, 1, 'SYSTEM'),
('R001', 'M004', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M004001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M004002', 'Y', 'Y', 'Y', 'Y', 2, 1, 'SYSTEM'),
('R001', 'M004003', 'Y', 'Y', 'Y', 'Y', 3, 1, 'SYSTEM'),
('R001', 'M005', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M005001', 'Y', 'Y', 'Y', 'Y', 1, 1, 'SYSTEM'),
('R001', 'M005002', 'Y', 'Y', 'Y', 'Y', 2, 1, 'SYSTEM'),
('R001', 'M005003', 'Y', 'Y', 'Y', 'Y', 3, 1, 'SYSTEM'),
('R001', 'M005004', 'Y', 'Y', 'Y', 'Y', 4, 1, 'SYSTEM'),

-- Manager có quyền xem và chỉnh sửa (không có quyền xóa)
('R002', 'M001', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M001001', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M001002', 'Y', 'Y', 'Y', 'N', 2, 1, 'SYSTEM'),
('R002', 'M001003', 'Y', 'Y', 'Y', 'N', 3, 1, 'SYSTEM'),
('R002', 'M001004', 'Y', 'Y', 'Y', 'N', 4, 1, 'SYSTEM'),
('R002', 'M002', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M002001', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M002002', 'Y', 'Y', 'Y', 'N', 2, 1, 'SYSTEM'),
('R002', 'M002003', 'Y', 'Y', 'Y', 'N', 3, 1, 'SYSTEM'),
('R002', 'M003', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M003001', 'Y', 'Y', 'Y', 'N', 1, 1, 'SYSTEM'),
('R002', 'M003002', 'Y', 'Y', 'Y', 'N', 2, 1, 'SYSTEM'),
('R002', 'M004', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R002', 'M004001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R002', 'M004002', 'Y', 'N', 'N', 'N', 2, 1, 'SYSTEM'),
('R002', 'M004003', 'Y', 'N', 'N', 'N', 3, 1, 'SYSTEM'),
('R002', 'M005', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R002', 'M005001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R002', 'M005002', 'Y', 'N', 'N', 'N', 2, 1, 'SYSTEM'),
('R002', 'M005003', 'Y', 'N', 'N', 'N', 3, 1, 'SYSTEM'),
('R002', 'M005004', 'Y', 'N', 'N', 'N', 4, 1, 'SYSTEM'),

-- User chỉ có quyền xem
('R003', 'M001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M001001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M001004', 'Y', 'N', 'N', 'N', 4, 1, 'SYSTEM'),
('R003', 'M002', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M002001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M003', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M003001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M004', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M004001', 'Y', 'N', 'N', 'N', 1, 1, 'SYSTEM'),
('R003', 'M004002', 'Y', 'N', 'N', 'N', 2, 1, 'SYSTEM'),
('R003', 'M004003', 'Y', 'N', 'N', 'N', 3, 1, 'SYSTEM');

-- Insert dữ liệu mẫu cho sy_user_relation (liên kết user với role group)
-- Giả sử có user 'USER001' thuộc admin group, 'USER002' thuộc manager group, 'USER003' thuộc user group
INSERT INTO sy_user_relation (USER_NO, ROLE_GROUP_NO, ORDERNO, ACTIVITY, CREATED_BY) VALUES
('USER001', 'RG001', 1, 1, 'SYSTEM'),
('USER002', 'RG002', 1, 1, 'SYSTEM'),
('USER003', 'RG003', 1, 1, 'SYSTEM');
