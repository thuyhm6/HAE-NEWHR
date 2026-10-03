package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * Đăng ký đào tạo bên ngoài (addRegisterForTraining bản gốc): thông tin đào tạo,
 * chi phí và danh sách người phê duyệt theo thứ tự cấp.
 */
@Data
public class EduTrainingRegisterRequest {

    private static final String DATE_PATTERN = "^$|^\\d{2}/\\d{2}/\\d{4}$";

    @Size(max = 1000)
    private String trainingContent;
    @Size(max = 1000)
    private String trainingPurpose;
    private String trainingType;
    @Size(max = 500)
    private String trainingUnit;
    @Size(max = 500)
    private String trainingLocation;
    /** DD/MM/YYYY */
    @Pattern(regexp = DATE_PATTERN)
    private String startDate;
    /** DD/MM/YYYY */
    @Pattern(regexp = DATE_PATTERN)
    private String endDate;
    @Size(max = 50)
    private String trainFee;
    @Pattern(regexp = "^$|^(VND|USD)$")
    private String trainUnit;
    @Size(max = 50)
    private String trainPrice;
    @Size(max = 50)
    private String trainTrainee;
    @Size(max = 50)
    private String trainAmount;
    @Size(max = 50)
    private String trainFeesOther;
    @Size(max = 50)
    private String trainFeesTotal;
    @Size(max = 2000)
    private String remark;

    @NotEmpty
    @Valid
    private List<Approver> approvers;

    /** Người phê duyệt - affirmType: 1 = Phê duyệt, 3 = Thông báo (approvType bản gốc). */
    @Data
    public static class Approver {
        @NotBlank
        private String personId;
        private String empid;
        private String localName;
        @Pattern(regexp = "^$|^[13]$")
        private String affirmType;
    }
}
