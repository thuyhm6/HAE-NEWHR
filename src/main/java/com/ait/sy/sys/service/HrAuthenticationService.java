package com.ait.sy.sys.service;

import com.ait.org.orgManage.model.HrDepartment;
import com.ait.sy.syRole.model.SyUser;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.hrm.empinfo.model.HrPersonalInfo;

/**
 * HrAuthenticationService - Interface cho xác thực đăng nhập với 3 bảng HR
 */
public interface HrAuthenticationService {

    /**
     * Xác thực đăng nhập với validation phức tạp
     * Kiểm tra:
     * 1. Username và password trong bảng sy_user
     * 2. PERSON_ID phải trùng với PERSON_ID trong hr_employee
     * 3. DEPTNO tương ứng phải có trong hr_department
     * 
     * @param username Tên đăng nhập
     * @param password Mật khẩu
     * @return HrUserInfo object nếu đăng nhập thành công, null nếu thất bại
     */
    HrUserInfo authenticate(String username, String password);

    /**
     * Tìm thông tin user theo username
     * 
     * @param username Tên đăng nhập
     * @return HrUserInfo object hoặc null
     */
    HrUserInfo findByUsername(String username);

    /**
     * Tìm thông tin user theo personId
     * 
     * @param personId ID cá nhân
     * @return HrUserInfo object hoặc null
     */
    HrUserInfo findByPersonId(String personId);

    /**
     * Cập nhật thời gian đăng nhập cuối
     * 
     * @param userNo Mã người dùng
     * @return true nếu cập nhật thành công
     */
    boolean updateLastLogin(String userNo);

    /**
     * Kiểm tra username đã tồn tại chưa
     * 
     * @param username Tên đăng nhập
     * @return true nếu đã tồn tại
     */
    boolean existsByUsername(String username);

    /**
     * Class chứa thông tin đầy đủ của user sau khi đăng nhập thành công
     */
    class HrUserInfo {
        private SyUser syUser;
        private HrEmployee hrEmployee;
        private HrDepartment hrDepartment;
        private HrPersonalInfo hrPersonalInfo;

        public HrUserInfo() {
        }

        public HrUserInfo(SyUser syUser, HrEmployee hrEmployee, HrDepartment hrDepartment, HrPersonalInfo hrPersonalInfo) {
            this.syUser = syUser;
            this.hrEmployee = hrEmployee;
            this.hrDepartment = hrDepartment;
            this.hrPersonalInfo = hrPersonalInfo;
        }

        // Getters and Setters
        public SyUser getSyUser() {
            return syUser;
        }

        public void setSyUser(SyUser syUser) {
            this.syUser = syUser;
        }

        public HrEmployee getHrEmployee() {
            return hrEmployee;
        }

        public void setHrEmployee(HrEmployee hrEmployee) {
            this.hrEmployee = hrEmployee;
        }

        public HrDepartment getHrDepartment() {
            return hrDepartment;
        }

        public void setHrDepartment(HrDepartment hrDepartment) {
            this.hrDepartment = hrDepartment;
        }

        public HrPersonalInfo getHrPersonalInfo() {return hrPersonalInfo;}

        public void setHrPersonalInfo(HrPersonalInfo hrPersonalInfo) {this.hrPersonalInfo = hrPersonalInfo;}

        // Helper methods
        public String getUsername() {
            return syUser != null ? syUser.getUserName() : null;
        }

        public String getPersonId() {
            return syUser != null ? syUser.getPersonId() : null;
        }

        public String getEmployeeName() {
            if (hrEmployee != null) {
                String localName = hrEmployee.getLocalName();
                if (localName != null && !localName.trim().isEmpty()) {
                    return localName;
                }
                // Fallback to English name if local name is empty
                String englishName = hrEmployee.getEnglishName();
                if (englishName != null && !englishName.trim().isEmpty()) {
                    return englishName;
                }
            }
            return null;
        }

        public String getDepartmentName() {
            return hrDepartment != null ? hrDepartment.getOrgNameLocal() : null;
        }

        public String getPhotoPath() {
            return hrPersonalInfo != null ? hrPersonalInfo.getPhotoPath() : null;
        }

        public String getPhotoUrl() {
            String rawPath = getPhotoPath();
            if (rawPath == null || rawPath.trim().isEmpty()) {
                return "/assets/images/users/dummy-avatar.jpg";
            }

            String normalized = rawPath.trim().replace("\\", "/");
            if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("/")) {
                return normalized;
            }
            return "/" + normalized;
        }

        public String getDeptNo() {
            return hrEmployee != null ? hrEmployee.getDeptNo() : null;
        }

        public String getCpnyId() {
            return syUser != null ? syUser.getCpnyId() : null;
        }

        public boolean isActive() {
            return syUser != null && syUser.isActive() &&
                    hrEmployee != null && hrEmployee.isActive() &&
                    hrDepartment != null && hrDepartment.isActive();
        }
    }
}
