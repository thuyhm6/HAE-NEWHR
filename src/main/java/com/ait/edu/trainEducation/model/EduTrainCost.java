package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

/**
 * Model cho bảng EDU_COST_MANAGER (Chi phí đào tạo) + thông tin khóa (EDU_BASIC_INFORMATION).
 * Port từ /edu/traineducation/trainCostManager (Hanwha_HTSV).
 */
@Data
public class EduTrainCost {

    /** COST_NO - khóa chính (tạo khi lập khóa đào tạo) */
    private String costNo;
    private String basicNo;

    // ===== Thông tin khóa (chỉ đọc) =====
    private String trainTypeCodeName;
    private String courseNameCode;
    private String periodTime;
    private String impleStartDate;
    private String impleEndDate;
    private String budget;
    private BigDecimal allCost;
    private BigDecimal avgCost;
    /** Số học viên (tối thiểu 1) dùng tính chi phí bình quân */
    private Integer totalCount;

    // ===== Các khoản chi phí =====
    @DecimalMin(value = "0", message = "TEACHER_COST không được âm")
    private BigDecimal teacherCost;
    @DecimalMin(value = "0", message = "MATERIAL_COST không được âm")
    private BigDecimal materialCost;
    @DecimalMin(value = "0", message = "FIELD_COST không được âm")
    private BigDecimal fieldCost;
    @DecimalMin(value = "0", message = "FOOD_COST không được âm")
    private BigDecimal foodCost;
    @DecimalMin(value = "0", message = "STAY_COST không được âm")
    private BigDecimal stayCost;
    @DecimalMin(value = "0", message = "TRAFFIC_COST không được âm")
    private BigDecimal trafficCost;
    @DecimalMin(value = "0", message = "VISA_COST không được âm")
    private BigDecimal visaCost;
    @DecimalMin(value = "0", message = "OTHER_COST không được âm")
    private BigDecimal otherCost;
    private String remark;

    /** (Không lưu DB) File đính kèm (ESS_FILE, APPLY_TYPE = eduCostManager) */
    private List<EduFile> files;
}
