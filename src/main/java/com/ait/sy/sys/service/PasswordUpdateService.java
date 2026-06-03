package com.ait.sy.sys.service;

/**
 * PasswordUpdateService - Interface cho cập nhật mật khẩu
 */
public interface PasswordUpdateService {

    /**
     * Kiểm tra mật khẩu cũ có đúng không (hỗ trợ cả plain text và BCrypt)
     * 
     * @param userNo      Mã người dùng
     * @param oldPassword Mật khẩu cũ
     * @return true nếu mật khẩu cũ đúng
     */
    boolean verifyOldPassword(String userNo, String oldPassword);

    /**
     * Cập nhật mật khẩu mới (mã hóa bằng BCrypt)
     * 
     * @param userNo      Mã người dùng
     * @param newPassword Mật khẩu mới
     * @return true nếu cập nhật thành công
     */
    boolean updatePassword(String userNo, String newPassword);

    /**
     * Kiểm tra độ mạnh của mật khẩu mới
     * 
     * @param password Mật khẩu cần kiểm tra
     * @return true nếu mật khẩu đủ mạnh
     */
    boolean isPasswordStrong(String password);

    /**
     * Lấy thông tin user để hiển thị
     * 
     * @param userNo Mã người dùng
     * @return Thông tin user
     */
    UserPasswordInfo getUserPasswordInfo(String userNo);

    /**
     * Inner class để chứa thông tin user cho password update
     */
    class UserPasswordInfo {
        private String userNo;
        private String userName;
        private String personId;
        private boolean isPasswordEncoded;

        public UserPasswordInfo() {
        }

        public UserPasswordInfo(String userNo, String userName, String personId, boolean isPasswordEncoded) {
            this.userNo = userNo;
            this.userName = userName;
            this.personId = personId;
            this.isPasswordEncoded = isPasswordEncoded;
        }

        // Getters and Setters
        public String getUserNo() {
            return userNo;
        }

        public void setUserNo(String userNo) {
            this.userNo = userNo;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getPersonId() {
            return personId;
        }

        public void setPersonId(String personId) {
            this.personId = personId;
        }

        public boolean isPasswordEncoded() {
            return isPasswordEncoded;
        }

        public void setPasswordEncoded(boolean passwordEncoded) {
            isPasswordEncoded = passwordEncoded;
        }
    }
}