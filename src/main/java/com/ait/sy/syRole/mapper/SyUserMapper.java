package com.ait.sy.syRole.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.sy.syRole.model.SyUser;

/**
 * SyUserMapper - Interface cho các thao tác với bảng sy_user
 */
@Mapper
public interface SyUserMapper {

    /**
     * Tìm user theo username
     * 
     * @param userName Tên đăng nhập
     * @return SyUser object hoặc null
     */
    SyUser findByUserName(@Param("userName") String userName);

    /**
     * Tìm user theo userNo
     * 
     * @param userNo Mã người dùng
     * @return SyUser object hoặc null
     */
    SyUser findByUserNo(@Param("userNo") String userNo);

    /**
     * Tìm user theo personId
     * 
     * @param personId ID cá nhân
     * @return SyUser object hoặc null
     */
    SyUser findByPersonId(@Param("personId") String personId);

    /**
     * Xác thực đăng nhập với username và password
     * 
     * @param userName Tên đăng nhập
     * @param password Mật khẩu
     * @return SyUser object nếu đăng nhập thành công, null nếu thất bại
     */
    SyUser authenticate(@Param("userName") String userName, @Param("password") String password);

    /**
     * Đăng nhập với validation đầy đủ - kiểm tra user, employee và department
     * 
     * @param userName Tên đăng nhập
     * @param password Mật khẩu
     * @return SyUser object nếu đăng nhập thành công, null nếu thất bại
     */
    SyUser loginWithValidation(@Param("userName") String userName, @Param("password") String password);

    /**
     * Cập nhật thời gian đăng nhập cuối
     * 
     * @param userNo Mã người dùng
     * @return Số dòng được cập nhật
     */
    int updateLastLogin(@Param("userNo") String userNo);

    /**
     * Kiểm tra username đã tồn tại chưa
     * 
     * @param userName Tên đăng nhập
     * @return true nếu đã tồn tại
     */
    boolean existsByUserName(@Param("userName") String userName);

    /**
     * Kiểm tra userNo đã tồn tại chưa
     * 
     * @param userNo Mã người dùng
     * @return true nếu đã tồn tại
     */
    boolean existsByUserNo(@Param("userNo") String userNo);

    /**
     * Lấy tất cả users (cho password migration)
     * 
     * @return Danh sách tất cả users
     */
    java.util.List<SyUser> findAll();

    /**
     * Tìm users theo từ khóa
     * 
     * @param keyword
     * @return
     */
    java.util.List<SyUser> searchUsers(@Param("keyword") String keyword);

    /**
     * Cập nhật password cho user
     * 
     * @param userNo   Mã người dùng
     * @param password Mật khẩu mới (đã mã hóa)
     * @return Số dòng được cập nhật
     */
    int updatePassword(@Param("userNo") String userNo, @Param("password") String password);

    /**
     * Đếm số users cần migration (password chưa được mã hóa)
     * 
     * @return Số lượng users cần migration
     */
    int countUsersNeedingMigration();

    /**
     * Kiểm tra migration đã hoàn thành chưa
     * 
     * @return true nếu tất cả passwords đã được mã hóa
     */
    boolean isMigrationCompleted();
}
