package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * Model cho bảng EDU_TRAIN_AGREEMENT (Hợp đồng đào tạo).
 * Port từ /edu/traineducation/trainAgreement (Hanwha_HTSV). Ngày dạng DD/MM/YYYY,
 * các khoản phí lưu dạng chuỗi số như bản gốc.
 */
@Data
public class EduTrainAgreement {

    /** AGREE_NO - khóa chính, sinh từ EDU_TRAIN_AGREE_SEQ */
    private String agreeNo;
    /** AGREE_ID - Mã hợp đồng tự sinh: "TRA" + 6 chữ số */
    private String agreeId;

    @NotBlank(message = "AGREE_NAME không được để trống")
    private String agreeName;

    private String personId;
    @NotBlank(message = "EMPID không được để trống")
    private String empid;
    private String localName;
    private String departName;

    private String conStartDate;
    private String conEndDate;
    private String studyStartDate;
    private String studyEndDate;
    private String studyDay;

    // Các trường chỉ nhập qua import Excel (form bản gốc đã ẩn)
    private String serStartDate;
    private String serEndDate;
    private String serviceYear;
    private String exchangeRate;
    private String totalFee;
    private String leftDate;

    private String hqFree;
    private String cgfyFree;
    private String jpFree;
    private String zfbzFree;
    private String cgbzFree;
    private String cgbzFreeFact;
    private String sybxFree;
    private String yxPay;
    private String jtFree;
    private String txFree;
    private String factPay;

    private String agreeStartDate;
    private String agreeEndDate;
    private String remark;

    /** (Không lưu DB) File đính kèm (ESS_FILE, APPLY_TYPE = eduTrainAgreement) */
    private List<EduFile> files;
}
