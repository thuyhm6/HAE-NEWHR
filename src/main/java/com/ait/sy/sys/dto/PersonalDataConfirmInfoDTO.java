package com.ait.sy.sys.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO thông tin nhân viên hiển thị trên popup xác nhận đồng ý xử lý dữ liệu
 * cá nhân (PERSONAL_DATA_CONFIRM_BY) - lấy từ HR_EMPLOYEE qua
 * GET_GLOBAL_NAME/GET_DEPT_NAME/GET_DEPT_NO_BY_LEVEL. Xem
 * PersonalDataConfirmService#getConfirmInfo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalDataConfirmInfoDTO {

    private String localName;
    private String empId;
    private String positionName;
    private String teamName;
    private String partName;
    private String cellName;
}
