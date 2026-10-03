package com.ait.sy.sys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO thông tin user hiện tại trả về cho Angular qua GET /api/auth/me.
 * Không dùng trực tiếp HrUserInfo/SyUser vì các entity đó chứa field mật
 * khẩu (password/passwordFirst/Second/Third) sẽ bị lộ nếu serialize thẳng.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserDTO {

    private String username;
    private String employeeName;
    private String photoUrl;
    private String personId;
    private String cpnyId;
    private String userType;
    private boolean admin;
    private boolean requirePasswordChange;
    private boolean hasSysTypeZeroMenus;
    private boolean requirePersonalDataConfirm;
}
