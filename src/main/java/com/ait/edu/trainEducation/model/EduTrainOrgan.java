package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * Model cho bảng EDU_TRAIN_ORGAN (Đơn vị đào tạo).
 * Port từ /edu/traineducation/trainOrgan (Hanwha_HTSV).
 */
@Data
public class EduTrainOrgan {

    /** ORGAN_NO - khóa chính, sinh từ EDU_TRAIN_ORGAN_SEQ */
    private String organNo;

    @NotBlank(message = "ORGAN_NAME không được để trống")
    private String organName;
    private String linkman;
    private String address;
    private String officePhone;
    private String cellphone;
    private String urlNet;
    private String mainField;
    /** WORK_TOGETHER - Hợp tác &amp; đánh giá */
    private String workTogether;
    /** ORGAN_ABSTRACT - Giới thiệu đơn vị */
    private String organAbstract;

    /** (Không lưu DB) File hợp đồng đính kèm (ESS_FILE, APPLY_TYPE = eduTrainOrgan) */
    private List<EduFile> files;
}
