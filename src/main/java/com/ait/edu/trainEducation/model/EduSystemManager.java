package com.ait.edu.trainEducation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

/**
 * Model cho bảng EDU_SYSTEM_MANAGER (Hệ thống đào tạo - loại hình đào tạo).
 * Port từ /edu/traineducation/systemManager (dự án Hanwha_HAE).
 * Không khai báo cpnyId/createdBy/... vì LanguageParameterInterceptor tự inject
 * #{cpnyId}, #{adminID}, #{adminIP}, #{lang} vào tham số MyBatis.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EduSystemManager {

    /** SYSMANA_NO - khóa chính, sinh từ sequence EDU_SYS_MANA_SEQ */
    private String sysmanaNo;

    /** TRAIN_DIFF_CODE - Chương trình đào tạo (mã cha 14014478) */
    @NotBlank(message = "TRAIN_DIFF_CODE không được để trống")
    private String trainDiffCode;

    /** TRAIN_TYPE_CODE - Loại hình (mã con của TRAIN_DIFF_CODE) */
    @NotBlank(message = "TRAIN_TYPE_CODE không được để trống")
    private String trainTypeCode;

    /** Tên hiển thị theo ngôn ngữ hiện tại (GET_GLOBAL_NAME) */
    private String trainDiffCodeName;
    private String trainTypeCodeName;

    /** TRAIN_TYPE_NO - Mã loại hình, tự sinh: tiền tố theo TRAIN_DIFF_CODE + 6 chữ số */
    private String trainTypeNo;

    /** REMARK - Ghi chú */
    private String remark;
}
