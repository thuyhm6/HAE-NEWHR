package com.ait.sy.basicMaintenance.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * DTO cho SyMenuParam - Dùng để hiển thị Menu kèm trạng thái đã gán cho Company
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SyMenuParamDto extends SyMenuDto {
    private String paramNo; // ID trong SY_MENU_PARAM
    private String cpnyId; // Company ID
    private String isCanBeBuild; // Cờ cấu hình thêm

    private Integer paramOrderNo; // Order trong SY_MENU_PARAM custom cho công ty
    private Integer paramActivity; // Activity trong SY_MENU_PARAM custom cho công ty

    private boolean assigned; // Cờ đánh dấu đã được gán menu này cho công ty chưa
}
