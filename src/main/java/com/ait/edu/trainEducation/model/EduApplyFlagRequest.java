package com.ait.edu.trainEducation.model;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.util.List;

/**
 * Cập nhật trạng thái phê duyệt / xác nhận cho nhiều đơn (updateCourseMaker /
 * updateCourseConfirm bản gốc). flag: 0 = từ chối, 1 = chờ, 2 = duyệt/xác nhận.
 */
@Data
public class EduApplyFlagRequest {

    @NotEmpty
    private List<String> applyNos;

    @NotBlank
    @Pattern(regexp = "[012]")
    private String flag;
}
