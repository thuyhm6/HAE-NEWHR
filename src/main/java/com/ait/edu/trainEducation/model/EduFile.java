package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * File đính kèm (ESS_FILE) của các màn đào tạo, phân biệt bằng APPLY_TYPE
 * (eduPlanManager / eduTrainOrgan / eduTrainAgreement - giữ nguyên bản gốc).
 */
@Data
public class EduFile {
    private String fileNo;
    private String applyNo;
    private String applyType;
    private String fileName;
}
